/**
 * AlphaFlow S-Tier Agent Platform - Observability & Run Tracing
 * 
 * Rules:
 * 1. Every agent run creates a traceable record with unique runId.
 * 2. Every tool invocation inside a run creates a child trace record with latency & duration.
 * 3. Observability is persisted to Supabase (`agent_runs`, `agent_traces`) and cached locally.
 * 4. Reactive event subscriptions allow the UI / Admin Debug page to stream live executions.
 */

import { supabase } from "@/integrations/supabase/client";

export interface AgentRunRecord {
  id: string;
  userId?: string | null;
  agentName: string;
  model: string;
  promptPreview: string;
  inputPayload: Record<string, unknown>;
  outputPayload?: Record<string, unknown> | null;
  status: "pending" | "completed" | "failed" | "blocked_by_guardrail";
  latencyMs?: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costEstimateUsd: number;
  errorMessage?: string | null;
  createdAt: string;
}

export interface AgentTraceRecord {
  id: string;
  runId: string;
  toolName: string;
  toolInput: Record<string, unknown>;
  toolOutput?: Record<string, unknown> | null;
  durationMs: number;
  status: "success" | "error" | "denied";
  createdAt: string;
}

class AgentObservabilityService {
  private localRuns: AgentRunRecord[] = [];
  private localTraces: AgentTraceRecord[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.seedInitialObservabilityLogs();
  }

  private seedInitialObservabilityLogs() {
    const sampleRunId = "run-sample-01";
    this.localRuns.push({
      id: sampleRunId,
      userId: "guest",
      agentName: "Aegis Risk Sentinel",
      model: "gemini-1.5-flash",
      promptPreview: "Evaluate 10,000-path Monte Carlo ruin probability for proposed EURUSD buy...",
      inputPayload: { symbol: "EURUSD", winRatePct: 68, riskRewardRatio: 3.2 },
      outputPayload: { clearance: "APPROVED", ruinProbPct: 0.12, safeKelly: 1.2 },
      status: "completed",
      latencyMs: 382,
      promptTokens: 245,
      completionTokens: 82,
      totalTokens: 327,
      costEstimateUsd: 0.000043,
      createdAt: new Date(Date.now() - 120000).toISOString(),
    });

    this.localTraces.push({
      id: "trace-sample-01",
      runId: sampleRunId,
      toolName: "run_monte_carlo_sim",
      toolInput: { winRatePct: 68, riskRewardRatio: 3.2, simulationsCount: 5000 },
      toolOutput: { ruinProbabilityPct: 0.12, riskClearance: "APPROVED" },
      durationMs: 48,
      status: "success",
      createdAt: new Date(Date.now() - 119000).toISOString(),
    });
  }

  /**
   * Initializes a new agent execution run.
   */
  public async startRun(params: {
    agentName: string;
    model: string;
    prompt: string;
    inputPayload: Record<string, unknown>;
    userId?: string;
  }): Promise<AgentRunRecord> {
    const runRecord: AgentRunRecord = {
      id: `run-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: params.userId || "guest",
      agentName: params.agentName,
      model: params.model,
      promptPreview: params.prompt.slice(0, 160),
      inputPayload: params.inputPayload,
      status: "pending",
      promptTokens: Math.ceil(params.prompt.length / 4),
      completionTokens: 0,
      totalTokens: Math.ceil(params.prompt.length / 4),
      costEstimateUsd: 0,
      createdAt: new Date().toISOString(),
    };

    this.localRuns.unshift(runRecord);
    if (this.localRuns.length > 50) this.localRuns.pop();
    this.notify();

    // Persist to Supabase if client/user authenticated
    if (params.userId && params.userId !== "guest") {
      try {
        const { data } = await supabase
          .from("agent_runs")
          .insert({
            user_id: params.userId,
            agent_name: params.agentName,
            model: params.model,
            prompt_preview: runRecord.promptPreview,
            input_payload: params.inputPayload as any,
            status: "pending",
          })
          .select("id")
          .single();

        if (data) runRecord.id = data.id;
      } catch (err) {
        console.warn("[Observability] Failed to write startRun to Supabase:", err);
      }
    }

    return runRecord;
  }

  /**
   * Finalizes an agent execution run with metrics.
   */
  public async finishRun(
    runId: string,
    params: {
      outputPayload: Record<string, unknown>;
      latencyMs: number;
      promptTokens?: number;
      completionTokens?: number;
      status?: "completed" | "failed" | "blocked_by_guardrail";
      errorMessage?: string;
    }
  ): Promise<void> {
    const run = this.localRuns.find((r) => r.id === runId);
    const pTokens = params.promptTokens || run?.promptTokens || 100;
    const cTokens = params.completionTokens || 150;
    const total = pTokens + cTokens;
    const cost = Number(((pTokens * 0.075 + cTokens * 0.3) / 1000000).toFixed(6));

    if (run) {
      run.outputPayload = params.outputPayload;
      run.latencyMs = params.latencyMs;
      run.promptTokens = pTokens;
      run.completionTokens = cTokens;
      run.totalTokens = total;
      run.costEstimateUsd = cost;
      run.status = params.status || "completed";
      run.errorMessage = params.errorMessage || null;
    }

    this.notify();

    // Update in Supabase
    try {
      await supabase
        .from("agent_runs")
        .update({
          output_payload: params.outputPayload as any,
          latency_ms: params.latencyMs,
          prompt_tokens: pTokens,
          completion_tokens: cTokens,
          total_tokens: total,
          cost_estimate: cost,
          status: params.status || "completed",
          error_message: params.errorMessage || null,
        })
        .eq("id", runId);
    } catch (err) {
      console.warn("[Observability] Failed to update finishRun in Supabase:", err);
    }
  }

  /**
   * Records a granular tool invocation trace within an active run.
   */
  public async recordToolTrace(params: {
    runId: string;
    toolName: string;
    toolInput: Record<string, unknown>;
    toolOutput?: Record<string, unknown>;
    durationMs: number;
    status: "success" | "error" | "denied";
  }): Promise<AgentTraceRecord> {
    const trace: AgentTraceRecord = {
      id: `trace-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      runId: params.runId,
      toolName: params.toolName,
      toolInput: params.toolInput,
      toolOutput: params.toolOutput || null,
      durationMs: params.durationMs,
      status: params.status,
      createdAt: new Date().toISOString(),
    };

    this.localTraces.unshift(trace);
    if (this.localTraces.length > 100) this.localTraces.pop();
    this.notify();

    // Persist to Supabase
    try {
      await supabase.from("agent_traces").insert({
        run_id: params.runId,
        tool_name: params.toolName,
        tool_input: params.toolInput as any,
        tool_output: (params.toolOutput || {}) as any,
        duration_ms: params.durationMs,
        status: params.status,
      });
    } catch (err) {
      console.warn("[Observability] Failed to write trace to Supabase:", err);
    }

    return trace;
  }

  public getRecentRuns(): AgentRunRecord[] {
    return [...this.localRuns];
  }

  public getTracesForRun(runId: string): AgentTraceRecord[] {
    return this.localTraces.filter((t) => t.runId === runId);
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

export const agentObservability = new AgentObservabilityService();
