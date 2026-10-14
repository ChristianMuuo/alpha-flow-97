/**
 * AlphaFlow S-Tier Agent Platform - Memory Engine
 * 
 * Rules:
 * 1. Short-term memory: Tracks ongoing conversational run context and recent tool outputs.
 * 2. Long-term memory: Persisted in Supabase `agent_memories` table with category tags.
 * 3. User Controls: Full transparency. Users can view, search, and delete memories at any time.
 * 4. Fallback Support: If user is offline or unauthenticated, maintains an in-memory session store.
 */

import { supabase } from "@/integrations/supabase/client";

export type MemoryType = "preference" | "trade_pattern" | "coaching_insight" | "risk_rule" | "knowledge_chunk";

export interface AgentMemoryItem {
  id: string;
  userId: string;
  memoryType: MemoryType;
  content: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

class MemoryEngine {
  private localSessionMemories: AgentMemoryItem[] = [
    {
      id: "mem-seed-1",
      userId: "guest",
      memoryType: "risk_rule",
      content: "Trader strictly adheres to a maximum 1.0% risk per trade hurdle and halts trading after 2 consecutive stop-outs.",
      metadata: { source: "Onboarding Wizard", tag: "Capital Preservation" },
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: "mem-seed-2",
      userId: "guest",
      memoryType: "preference",
      content: "Preferred execution style: Smart Money Concepts (FVG mitigation & liquidity sweeps) on EURUSD and XAUUSD.",
      metadata: { source: "Profile Setup", tag: "Strategy Bias" },
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "mem-seed-3",
      userId: "guest",
      memoryType: "trade_pattern",
      content: "Observed behavioral leak: Tends to move Stop Loss to breakeven prematurely before 1.0 R:R is reached, cutting winners early.",
      metadata: { source: "Journal Coach", tag: "Behavioral Leak" },
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
  ];

  private listeners: (() => void)[] = [];

  /**
   * Save a new memory record.
   */
  public async saveMemory(
    memoryType: MemoryType,
    content: string,
    metadata: Record<string, unknown> = {},
    userId?: string
  ): Promise<AgentMemoryItem> {
    const memoryItem: AgentMemoryItem = {
      id: `mem-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: userId || "guest",
      memoryType,
      content,
      metadata,
      createdAt: new Date().toISOString(),
    };

    if (userId && userId !== "guest") {
      try {
        const { data, error } = await supabase
          .from("agent_memories")
          .insert({
            user_id: userId,
            memory_type: memoryType,
            content,
            metadata,
          })
          .select()
          .single();

        if (!error && data) {
          memoryItem.id = data.id;
        }
      } catch (err) {
        console.warn("[Memory Engine] Failed to write memory to Supabase, stored in session:", err);
      }
    }

    this.localSessionMemories.unshift(memoryItem);
    this.notify();
    return memoryItem;
  }

  /**
   * Retrieve all memories for the current user or session.
   */
  public async getMemories(userId?: string, filterType?: MemoryType): Promise<AgentMemoryItem[]> {
    if (userId && userId !== "guest") {
      try {
        let query = supabase
          .from("agent_memories")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (filterType) {
          query = query.eq("memory_type", filterType);
        }

        const { data, error } = await query;

        if (!error && data && data.length > 0) {
          return data.map((d) => ({
            id: d.id,
            userId: d.user_id,
            memoryType: d.memory_type as MemoryType,
            content: d.content,
            metadata: (d.metadata as Record<string, unknown>) || {},
            createdAt: d.created_at,
          }));
        }
      } catch (err) {
        console.warn("[Memory Engine] Failed to fetch memories from Supabase, using local session:", err);
      }
    }

    if (filterType) {
      return this.localSessionMemories.filter((m) => m.memoryType === filterType);
    }
    return [...this.localSessionMemories];
  }

  /**
   * Delete a specific memory item by ID (User Privacy Control).
   */
  public async deleteMemory(memoryId: string, userId?: string): Promise<boolean> {
    this.localSessionMemories = this.localSessionMemories.filter((m) => m.id !== memoryId);

    if (userId && userId !== "guest") {
      try {
        await supabase
          .from("agent_memories")
          .delete()
          .eq("id", memoryId)
          .eq("user_id", userId);
      } catch (err) {
        console.warn("[Memory Engine] Failed to delete from Supabase:", err);
      }
    }

    this.notify();
    return true;
  }

  /**
   * Purge all memories for user.
   */
  public async clearAllMemories(userId?: string): Promise<void> {
    this.localSessionMemories = [];

    if (userId && userId !== "guest") {
      try {
        await supabase
          .from("agent_memories")
          .delete()
          .eq("user_id", userId);
      } catch (err) {
        console.warn("[Memory Engine] Failed to purge memories in Supabase:", err);
      }
    }

    this.notify();
  }

  /**
   * Search relevant memories by keyword or semantic heuristic.
   */
  public async searchRelevantMemories(query: string, limit = 4): Promise<AgentMemoryItem[]> {
    const q = query.toLowerCase();
    const all = await this.getMemories();

    return all
      .map((item) => {
        let score = 0;
        const text = (item.content + " " + JSON.stringify(item.metadata)).toLowerCase();
        const words = q.split(/\s+/).filter(Boolean);

        words.forEach((w) => {
          if (text.includes(w)) score += 1;
        });

        return { item, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.item)
      .slice(0, limit);
  }

  /**
   * Summarizes user profile memories into a prompt context string for agent reasoning.
   */
  public async buildMemoryContext(userId?: string): Promise<string> {
    const memories = await this.getMemories(userId);
    if (memories.length === 0) return "No prior memory recorded.";

    return memories
      .slice(0, 6)
      .map((m) => `• [${m.memoryType.toUpperCase()}]: ${m.content}`)
      .join("\n");
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }
}

export const memoryEngine = new MemoryEngine();
