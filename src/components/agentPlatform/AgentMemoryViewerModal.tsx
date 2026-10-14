import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Brain,
  Trash2,
  Plus,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  Search,
} from "lucide-react";
import { memoryEngine, AgentMemoryItem, MemoryType } from "@/services/agentPlatform/memoryEngine";
import { toast } from "sonner";

interface AgentMemoryViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

export const AgentMemoryViewerModal: React.FC<AgentMemoryViewerModalProps> = ({
  isOpen,
  onClose,
  userId,
}) => {
  const [memories, setMemories] = useState<AgentMemoryItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<MemoryType | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [newRuleText, setNewRuleText] = useState("");
  const [selectedType, setSelectedType] = useState<MemoryType>("preference");
  const [isAdding, setIsAdding] = useState(false);

  const loadMemories = async () => {
    const list = await memoryEngine.getMemories(
      userId,
      activeFilter === "ALL" ? undefined : activeFilter
    );
    setMemories(list);
  };

  useEffect(() => {
    if (isOpen) {
      loadMemories();
    }
    const unsub = memoryEngine.subscribe(loadMemories);
    return unsub;
  }, [isOpen, activeFilter, userId]);

  const handleDelete = async (id: string) => {
    await memoryEngine.deleteMemory(id, userId);
    toast.success("Memory permanently deleted from AI context.");
    loadMemories();
  };

  const handleClearAll = async () => {
    if (confirm("Are you sure you want to purge all AI memories? The AI will reset to factory preferences.")) {
      await memoryEngine.clearAllMemories(userId);
      toast.success("All AI memories purged.");
      loadMemories();
    }
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleText.trim()) return;

    await memoryEngine.saveMemory(
      selectedType,
      newRuleText.trim(),
      { source: "User Manual Input", tag: "Custom Directive" },
      userId
    );
    setNewRuleText("");
    setIsAdding(false);
    toast.success("New directive saved to agent long-term memory.");
    loadMemories();
  };

  const filteredMemories = memories.filter((m) =>
    searchQuery ? m.content.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  const getBadgeColor = (type: MemoryType) => {
    switch (type) {
      case "risk_rule":
        return "bg-rose-500/20 text-rose-400 border-rose-500/30";
      case "preference":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "trade_pattern":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "coaching_insight":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-[#09090c] border border-white/10 text-white p-6 shadow-2xl">
        <DialogHeader className="border-b border-white/5 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center border border-purple-500/40">
                <Brain className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                  What the AI Remembers
                  <Badge className="bg-purple-500/10 text-purple-300 border-purple-500/30 text-[10px]">
                    pgvector Long-Term Memory
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-white/50">
                  Inspect, add, or delete preferences and risk boundaries stored in the agent swarm memory.
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="text-xs border-rose-500/30 text-rose-400 hover:bg-rose-500/10 h-7"
            >
              <Trash2 className="w-3 h-3 mr-1" /> Purge All
            </Button>
          </div>
        </DialogHeader>

        {/* Filter Pills & Search */}
        <div className="flex flex-col gap-3 pt-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <Input
                placeholder="Search remembered patterns or rules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 bg-black/40 border-white/10 text-xs h-8 text-white placeholder:text-white/30"
              />
            </div>
            <Button
              size="sm"
              onClick={() => setIsAdding(!isAdding)}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-8"
            >
              <Plus className="w-3 h-3 mr-1" /> Add Directive
            </Button>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
            {(["ALL", "risk_rule", "preference", "trade_pattern", "coaching_insight"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-2.5 py-1 rounded-md border transition-colors ${
                  activeFilter === filter
                    ? "bg-white/15 border-white/30 text-white font-medium"
                    : "bg-white/5 border-white/5 text-white/50 hover:bg-white/10"
                }`}
              >
                {filter === "ALL" ? "All Memories" : filter.replace("_", " ").toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Optional Add Memory Form */}
        {isAdding && (
          <form onSubmit={handleAddMemory} className="p-3 rounded-lg bg-white/5 border border-white/10 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/60">Category:</span>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as MemoryType)}
                className="bg-black/60 border border-white/15 rounded px-2 py-0.5 text-xs text-white"
              >
                <option value="preference">Preference</option>
                <option value="risk_rule">Risk Rule</option>
                <option value="trade_pattern">Trade Pattern</option>
                <option value="coaching_insight">Coaching Insight</option>
              </select>
            </div>
            <Input
              placeholder="e.g. Never enter trades during high-impact USD red folder news..."
              value={newRuleText}
              onChange={(e) => setNewRuleText(e.target.value)}
              className="bg-black/40 border-white/15 text-xs text-white"
            />
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsAdding(false)} className="text-xs h-7">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-7">
                Save Memory
              </Button>
            </div>
          </form>
        )}

        {/* Memories List */}
        <div className="max-h-[320px] overflow-y-auto space-y-2 pr-1">
          {filteredMemories.length === 0 ? (
            <div className="text-center py-8 text-white/40 text-xs">
              No memories found matching your search.
            </div>
          ) : (
            filteredMemories.map((m) => (
              <div
                key={m.id}
                className="p-3 rounded-lg bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge className={`text-[10px] font-mono ${getBadgeColor(m.memoryType)}`}>
                      {m.memoryType.replace("_", " ").toUpperCase()}
                    </Badge>
                    <span className="text-[10px] text-white/40">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-white/90 leading-relaxed">{m.content}</p>
                </div>
                <button
                  onClick={() => handleDelete(m.id)}
                  title="Delete memory"
                  className="text-white/30 hover:text-rose-400 p-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-white/5 pt-3 flex items-center justify-between text-[11px] text-white/40">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero-Knowledge: Memories are tied strictly to your user ID and never shared.</span>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose} className="h-7 text-xs text-white/60">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
