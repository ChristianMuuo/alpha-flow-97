import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Activity,
  Zap,
  ShieldAlert,
  Clock,
  Coins,
  CheckCircle2,
  XCircle,
  Play,
  RotateCw,
  Sliders,
  Terminal,
  Cpu,
  Wrench,
  TrendingUp,
  Calendar,
  Layers,
  Send,
  Lock,
} from "lucide-react";
import {
  agentObservability,
  AgentRunRecord,
  AgentTraceRecord,
} from "@/services/agentPlatform/observability";
import {
  getAllAgents,
  setAgentEnabled,
  AgentManifest,
} from "@/services/agentPlatform/agentConfig";
import { agentOrchestrator, CriticReviseResult } from "@/services/agentPlatform/orchestrator";
import { toolRegistry, AgentTool } from "@/services/agentPlatform/toolRegistry";
import { approvalBus, PendingActionTicket } from "@/services/agentPlatform/approvalBus";
import { toast } from "sonner";

export const AgentObservabilityDashboard: React.FC = () => {
  const [runs, setRuns] = useState<AgentRunRecord[]>([]);
  const [agents, setAgents] = useState<AgentManifest[]>(getAllAgents());
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [selectedTraces, setSelectedTraces] = useState<AgentTraceRecord[]>([]);
  const [isRunningWorkflow, setIsRunningWorkflow] = useState(false);
  const [workflowResult, setWorkflowResult] = useState<CriticReviseResult | null>(null);
  const [pendingTickets, setPendingTickets] = useState<PendingActionTicket[]>([]);
  const [activeTab, setActiveTab] = useState<"traces" | "tools" | "sandbox">("traces");
  const [sandboxResult, setSandboxResult] = useState<{ tool: string; data: unknown } | null>(null);
  const [isExecutingTool, setIsExecutingTool] = useState(false);

  const refreshData = () => {
    const list = agentObservability.getRecentRuns();
    setRuns(list);
    setAgents(getAllAgents());
    setPendingTickets(approvalBus.getPendingTickets());
    if (selectedRunId) {
      setSelectedTraces(agentObservability.getTracesForRun(selectedRunId));
    } else if (list.length > 0) {
      setSelectedRunId(list[0].id);
      setSelectedTraces(agentObservability.getTracesForRun(list[0].id));
    }
  };

  useEffect(() => {
    refreshData();
    const unsubObs = agentObservability.subscribe(refreshData);
    const unsubBus = approvalBus.subscribe((tickets) => setPendingTickets([...tickets]));
    return () => {
      unsubObs();
      unsubBus();
    };
  }, [selectedRunId]);

  const handleToggleAgent = (agentId: string, enabled: boolean) => {
    setAgentEnabled(agentId, enabled);
    setAgents(getAllAgents());
    toast.info(`Agent '${agentId}' ${enabled ? "enabled" : "disabled by kill-switch"}`);
  };

  const handleRunCriticReviseWorkflow = async () => {
    setIsRunningWorkflow(true);
    setWorkflowResult(null);
    try {
      const res = await agentOrchestrator.executeCriticRevise("EURUSD");
      setWorkflowResult(res);
      refreshData();
      toast.success("Multi-agent Critic-Revise workflow executed successfully!");
    } catch (err) {
      toast.error(`Workflow execution error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsRunningWorkflow(false);
    }
  };

  // Interactive Tool Sandbox Executions
  const handleTestTool = async (toolId: string, inputPayload: Record<string, unknown>) => {
    setIsExecutingTool(true);
    setSandboxResult(null);
    try {
      const runId = `sandbox-${Date.now()}`;
      agentObservability.recordRunStart({
        runId,
        agentId: "ops-sentinel",
        agentName: "Interactive Quant Sandbox",
        model: "gemini-1.5-flash",
        promptPreview: `Executing Sandbox Tool: ${toolId}`,
      });

      const res = await toolRegistry.executeTool(
        toolId,
        inputPayload,
        {
          agentId: "ops-sentinel",
          agentName: "Interactive Quant Sandbox",
          runId,
          isHumanApproved: false, // forces HITL dialog if tool requires execution permission
        },
        ["*"] // grant all for sandbox
      );

      agentObservability.recordToolTrace({
        id: `trace-${Date.now()}`,
        runId,
        toolName: toolId,
        toolInput: inputPayload,
        toolOutput: res.data,
        durationMs: res.durationMs,
        status: res.status === "success" ? "success" : "error",
      });

      agentObservability.recordRunComplete({
        runId,
        status: "completed",
        responsePreview: JSON.stringify(res.data).slice(0, 150),
        tokensUsed: { prompt: 120, completion: 80, total: 200 },
        costUsd: 0.0001,
      });

      setSandboxResult({ tool: toolId, data: res.data });
      refreshData();
      toast.success(`Tool '${toolId}' executed successfully!`);
    } catch (err) {
      toast.error(`Execution halted: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsExecutingTool(false);
    }
  };

  // Aggregated Stats
  const totalRuns = runs.length;
  const completedRuns = runs.filter((r) => r.status === "completed").length;
  const avgLatency =
    runs.length > 0
      ? Math.round(runs.reduce((sum, r) => sum + (r.latencyMs || 0), 0) / runs.length)
      : 0;
  const totalCost = runs.reduce((sum, r) => sum + r.costEstimateUsd, 0).toFixed(5);
  const tools = toolRegistry.listTools();

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-[#09090c] border border-white/10 shadow-lg">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge className="bg-purple-500/15 text-purple-400 border-purple-500/30 text-[10px] font-mono">
              <Cpu className="w-3 h-3 mr-1" /> S-Tier Agent Platform Engine
            </Badge>
            <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px]">
              Active Observability
            </Badge>
            {pendingTickets.length > 0 && (
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px] font-mono animate-pulse">
                <ShieldAlert className="w-3 h-3 mr-1" /> {pendingTickets.length} Pending Approval
              </Badge>
            )}
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Agent Swarm Observability & Trace View</h2>
          <p className="text-xs text-white/50">
            Real-time latency profiling, token expenditure, child tool traces, sandbox execution, and kill switches.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleRunCriticReviseWorkflow}
            disabled={isRunningWorkflow}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-8"
          >
            {isRunningWorkflow ? (
              <>
                <RotateCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Orchestrating Swarm...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 mr-1.5" /> Run Critic-Revise Flow
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={refreshData}
            className="text-xs border-white/10 text-white/70 hover:bg-white/5 h-8"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Observability Telemetry Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#0c0d12] border border-white/10">
          <div className="flex items-center justify-between text-white/40 text-xs mb-1">
            <span>Total Executions</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{totalRuns}</div>
          <div className="text-[10px] text-emerald-400 mt-1">{completedRuns} Successful Runs</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0c0d12] border border-white/10">
          <div className="flex items-center justify-between text-white/40 text-xs mb-1">
            <span>Average Latency</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{avgLatency} ms</div>
          <div className="text-[10px] text-white/40 mt-1">Edge Server Roundtrip</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0c0d12] border border-white/10">
          <div className="flex items-center justify-between text-white/40 text-xs mb-1">
            <span>Token Accounting</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {runs.reduce((sum, r) => sum + r.totalTokens, 0)}
          </div>
          <div className="text-[10px] text-white/40 mt-1">Prompt + Output Tokens</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0c0d12] border border-white/10">
          <div className="flex items-center justify-between text-white/40 text-xs mb-1">
            <span>Estimated Cost</span>
            <Coins className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">${totalCost}</div>
          <div className="text-[10px] text-emerald-400 mt-1">Gemini 1.5 Tier Budget</div>
        </div>
      </div>

      {/* Critic-Revise Result Banner (if run recently) */}
      {workflowResult && (
        <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 text-white space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 text-xs">
                Workflow Completed: {workflowResult.proposal.symbol}
              </Badge>
              <span className="text-xs text-white/40">Total Latency: {workflowResult.totalLatencyMs}ms</span>
            </div>
            <Badge
              className={
                workflowResult.isVetoed
                  ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
                  : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
              }
            >
              {workflowResult.isVetoed ? "VETOED" : "CONSENSUS APPROVED"}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-black/40 border border-white/10 space-y-1">
              <div className="text-white/40 font-mono text-[10px]">1. PROPOSER (HYPERION)</div>
              <div className="font-semibold text-purple-300">
                {workflowResult.proposal.direction} @ {workflowResult.proposal.entryZone}
              </div>
              <p className="text-white/70 text-[11px]">{workflowResult.proposal.rationale}</p>
            </div>

            <div className="p-3 rounded-lg bg-black/40 border border-white/10 space-y-1">
              <div className="text-white/40 font-mono text-[10px]">2. CRITIC (VIGIL ADVERSARY)</div>
              <div className="font-semibold text-amber-300">
                Skepticism Score: {workflowResult.critique.adversarialScore}/100
              </div>
              <p className="text-white/70 text-[11px]">
                {workflowResult.critique.concerns[0] || "No critical traps detected."}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-black/40 border border-white/10 space-y-1">
              <div className="text-white/40 font-mono text-[10px]">3. RISK MANAGER (AEGIS VETO)</div>
              <div className="font-semibold text-emerald-300">
                Status: {workflowResult.riskVerdict.status} (Ruin: {workflowResult.riskVerdict.ruinProbabilityPct}%)
              </div>
              <p className="text-white/70 text-[11px]">
                Kelly Target: {workflowResult.riskVerdict.recommendedKellyFraction}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs for Lower Section */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <Button
          size="sm"
          variant={activeTab === "traces" ? "default" : "ghost"}
          onClick={() => setActiveTab("traces")}
          className={`h-8 text-xs font-mono gap-1.5 ${
            activeTab === "traces"
              ? "bg-purple-600 text-white"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          Execution Traces & Flags
        </Button>

        <Button
          size="sm"
          variant={activeTab === "sandbox" ? "default" : "ghost"}
          onClick={() => setActiveTab("sandbox")}
          className={`h-8 text-xs font-mono gap-1.5 ${
            activeTab === "sandbox"
              ? "bg-purple-600 text-white"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          Interactive Tool Sandbox (HITL Test)
        </Button>

        <Button
          size="sm"
          variant={activeTab === "tools" ? "default" : "ghost"}
          onClick={() => setActiveTab("tools")}
          className={`h-8 text-xs font-mono gap-1.5 ${
            activeTab === "tools"
              ? "bg-purple-600 text-white"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Tool Registry Catalog ({tools.length})
        </Button>
      </div>

      {/* Tab: Traces & Feature Flags */}
      {activeTab === "traces" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agent Kill Switches Panel */}
          <div className="p-5 rounded-xl bg-[#09090c] border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-purple-400" /> Agent Feature Flags & Kill Switches
              </h3>
              <span className="text-[10px] text-white/40">
                {agents.filter((a) => a.enabled).length} of {agents.length} Active
              </span>
            </div>

            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className="p-3 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-white">{agent.name}</span>
                      <span className="text-[10px] text-white/40 font-mono">v{agent.version}</span>
                      {agent.isVetoPower && (
                        <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/40 text-[9px] px-1 py-0">
                          VETO
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-white/50">{agent.specialty}</p>
                  </div>
                  <Switch
                    checked={agent.enabled}
                    onCheckedChange={(val) => handleToggleAgent(agent.id, val)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Live Runs List & Trace Inspector */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-5 rounded-xl bg-[#09090c] border border-white/10 space-y-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-blue-400" /> Recent Agent Executions (`agent_runs`)
                </h3>
                <span className="text-[10px] text-white/40">Select run to inspect child tool traces</span>
              </div>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {runs.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRunId(r.id)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 text-xs ${
                      selectedRunId === r.id
                        ? "bg-purple-950/20 border-purple-500/50"
                        : "bg-white/[0.02] border-white/5 hover:border-white/15"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{r.agentName}</span>
                        <Badge className="text-[9px] bg-white/5 border-white/10 text-white/60 font-mono">
                          {r.model}
                        </Badge>
                        <span className="text-[10px] text-white/40">
                          {new Date(r.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-white/60 line-clamp-1">{r.promptPreview}</p>
                    </div>

                    <div className="flex items-center gap-3 text-right font-mono text-[11px]">
                      <div>
                        <div className="text-white/80">{r.latencyMs || 0}ms</div>
                        <div className="text-[10px] text-white/40">{r.totalTokens} tkn</div>
                      </div>
                      {r.status === "completed" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Child Tool Traces Inspector */}
            <div className="p-5 rounded-xl bg-[#09090c] border border-white/10 space-y-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-1.5 border-b border-white/5 pb-2">
                <Activity className="w-4 h-4 text-emerald-400" /> Child Tool Execution Traces (`agent_traces`)
              </h3>

              {selectedTraces.length === 0 ? (
                <div className="text-center py-6 text-xs text-white/40">
                  No tool calls recorded for this run.
                </div>
              ) : (
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                  {selectedTraces.map((trace) => (
                    <div
                      key={trace.id}
                      className="p-3 rounded-lg bg-black/40 border border-white/10 space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <span className="text-purple-300 font-semibold">{trace.toolName}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white/40">{trace.durationMs}ms</span>
                          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[9px]">
                            {trace.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-[11px] text-white/60 font-mono bg-black/60 p-2 rounded overflow-x-auto">
                        <div>Input: {JSON.stringify(trace.toolInput)}</div>
                        {trace.toolOutput && (
                          <div className="text-emerald-400 mt-1">
                            Output: {JSON.stringify(trace.toolOutput)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Interactive Tool Sandbox */}
      {activeTab === "sandbox" && (
        <div className="p-6 rounded-xl bg-[#09090c] border border-white/10 space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Wrench className="w-4 h-4 text-purple-400" />
              Interactive Quant Tool Execution Sandbox
            </h3>
            <p className="text-xs text-white/50">
              Directly invoke registered agent tools. Executing write/order tools triggers the real-time Human-In-The-Loop approval dialog.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tool 1: Regime Detector */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3 flex flex-col justify-between">
              <div className="space-y-1">
                <Badge className="bg-blue-500/15 text-blue-300 border-blue-500/30 text-[10px] font-mono">
                  READ ONLY
                </Badge>
                <h4 className="font-semibold text-white text-sm">Statistical Regime Detector</h4>
                <p className="text-white/50 text-xs">
                  Analyzes ADX and volatility percentiles to detect Bullish, Bearish, or Mean-Reverting states.
                </p>
              </div>
              <Button
                size="sm"
                disabled={isExecutingTool}
                onClick={() => handleTestTool("calculate_market_regimes", { symbol: "EURUSD" })}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs"
              >
                <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
                Detect EURUSD Regime
              </Button>
            </div>

            {/* Tool 2: Economic Calendar */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3 flex flex-col justify-between">
              <div className="space-y-1">
                <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/30 text-[10px] font-mono">
                  READ ONLY
                </Badge>
                <h4 className="font-semibold text-white text-sm">Macroeconomic Calendar</h4>
                <p className="text-white/50 text-xs">
                  Scans upcoming high-impact CPI, NFP, and FOMC announcements for trading halts.
                </p>
              </div>
              <Button
                size="sm"
                disabled={isExecutingTool}
                onClick={() => handleTestTool("fetch_economic_calendar", { currency: "USD", minImpact: "HIGH" })}
                className="w-full bg-amber-600 hover:bg-amber-500 text-white text-xs"
              >
                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                Scan USD Catalysts
              </Button>
            </div>

            {/* Tool 3: Position Sizing */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3 flex flex-col justify-between">
              <div className="space-y-1">
                <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 text-[10px] font-mono">
                  READ ONLY
                </Badge>
                <h4 className="font-semibold text-white text-sm">Fractional Kelly Sizer</h4>
                <p className="text-white/50 text-xs">
                  Calculates mathematical lot size based on account balance and stop loss distance.
                </p>
              </div>
              <Button
                size="sm"
                disabled={isExecutingTool}
                onClick={() =>
                  handleTestTool("calculate_position_size", {
                    accountBalance: 100000,
                    riskPercent: 1.0,
                    entryPrice: 1.0850,
                    stopLossPrice: 1.0825,
                    symbol: "EURUSD",
                  })
                }
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
              >
                <Coins className="w-3.5 h-3.5 mr-1.5" />
                Size $100k Account
              </Button>
            </div>

            {/* Tool 4: Simulate Paper Order (HITL GUARDRAIL TEST) */}
            <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-3 flex flex-col justify-between">
              <div className="space-y-1">
                <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/40 text-[10px] font-mono flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-rose-400" />
                  REQUIRES HITL APPROVAL
                </Badge>
                <h4 className="font-semibold text-white text-sm">Simulate Paper Order</h4>
                <p className="text-white/50 text-xs">
                  Triggers human-in-the-loop review. The safety dialog will open immediately for approval.
                </p>
              </div>
              <Button
                size="sm"
                disabled={isExecutingTool}
                onClick={() =>
                  handleTestTool("simulate_paper_order", {
                    symbol: "EURUSD",
                    direction: "BUY",
                    lotSize: 0.5,
                    entryPrice: 1.0850,
                    stopLoss: 1.0820,
                    takeProfit: 1.0910,
                  })
                }
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30"
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                Trigger Order (Test HITL)
              </Button>
            </div>
          </div>

          {/* Sandbox Execution Result Panel */}
          {sandboxResult && (
            <div className="p-4 rounded-xl bg-black/60 border border-purple-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-purple-300 font-bold">
                  Sandbox Result: `{sandboxResult.tool}`
                </span>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px]">
                  Output Validated by Zod
                </Badge>
              </div>
              <pre className="text-xs font-mono text-emerald-400 bg-black/80 p-3 rounded-lg overflow-x-auto border border-white/5">
                {JSON.stringify(sandboxResult.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Tab: Tool Registry Catalog */}
      {activeTab === "tools" && (
        <div className="p-6 rounded-xl bg-[#09090c] border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                Active Typed Tool Catalog
              </h3>
              <p className="text-xs text-white/50">
                All agent tools are strictly typed with Zod, sandboxed with timeouts, and guarded by permission levels.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400">{tools.length} Tools Operational</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tools.map((t) => (
              <div key={t.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-semibold text-white text-xs">{t.id}</span>
                  <Badge
                    className={
                      t.permission === "execute"
                        ? "bg-rose-500/20 text-rose-300 border-rose-500/40 text-[10px]"
                        : t.permission === "write"
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px]"
                        : "bg-blue-500/20 text-blue-300 border-blue-500/40 text-[10px]"
                    }
                  >
                    {t.permission.toUpperCase()}
                  </Badge>
                </div>
                <div className="font-medium text-purple-200 text-xs">{t.name}</div>
                <p className="text-white/50 text-[11px]">{t.description}</p>
                <div className="flex items-center gap-3 text-[10px] font-mono text-white/40 pt-2 border-t border-white/5">
                  <span>Timeout: {t.timeoutMs}ms</span>
                  <span>Retries: {t.retryPolicy.maxRetries}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default AgentObservabilityDashboard;
