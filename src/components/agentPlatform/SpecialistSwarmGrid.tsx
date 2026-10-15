import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  specialistSwarmService,
  SwarmFullConsensusResult,
} from "@/services/agentPlatform/specialists/specialistSwarmService";
import { getAllAgents, AgentManifest } from "@/services/agentPlatform/agentConfig";
import { toolRegistry } from "@/services/agentPlatform/toolRegistry";
import { approvalBus } from "@/services/agentPlatform/approvalBus";
import {
  Cpu,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Play,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Send,
  Layers,
  Sparkles,
  Search,
  BookOpen,
  Eye,
  RefreshCw,
  Terminal,
} from "lucide-react";
import { toast } from "sonner";

interface SpecialistSwarmGridProps {
  onOrderRequested?: (details: any) => void;
}

export const SpecialistSwarmGrid: React.FC<SpecialistSwarmGridProps> = ({
  onOrderRequested,
}) => {
  const [agents, setAgents] = useState<AgentManifest[]>(() => getAllAgents());
  const [selectedSymbol, setSelectedSymbol] = useState("EURUSD");
  const [isRunningFullSwarm, setIsRunningFullSwarm] = useState(false);
  const [swarmStepMessage, setSwarmStepMessage] = useState<string>("");
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [consensusResult, setConsensusResult] = useState<SwarmFullConsensusResult | null>(null);

  // Single Agent Test State
  const [activeTestAgent, setActiveTestAgent] = useState<AgentManifest | null>(null);
  const [isTestingSingle, setIsTestingSingle] = useState(false);
  const [singleTestResult, setSingleTestResult] = useState<any>(null);

  // Subscribe to step updates during full swarm run
  useEffect(() => {
    const unsub = specialistSwarmService.subscribe((event) => {
      setSwarmStepMessage(event.message);
      if (event.stepIndex !== undefined) {
        setCurrentStepIndex(event.stepIndex);
      }
    });
    return unsub;
  }, []);

  const handleRunFullSwarm = async () => {
    try {
      setIsRunningFullSwarm(true);
      setCurrentStepIndex(1);
      setConsensusResult(null);
      toast.info(`Orchestrating 9-Agent Consensus Swarm for ${selectedSymbol}...`);

      const result = await specialistSwarmService.runFullConsensusSwarm(selectedSymbol);
      setConsensusResult(result);

      if (result.isVetoed) {
        toast.error("Swarm setup was VETOED by Aegis Risk Sentinel.");
      } else {
        toast.success(`Swarm approved ${result.strategy.direction} on ${selectedSymbol}!`);
      }
    } catch (err: any) {
      toast.error(`Swarm orchestration failed: ${err.message || String(err)}`);
    } finally {
      setIsRunningFullSwarm(false);
    }
  };

  const handleTestSingleAgent = async (agent: AgentManifest) => {
    try {
      setActiveTestAgent(agent);
      setIsTestingSingle(true);
      setSingleTestResult(null);

      let result: any = null;
      switch (agent.id) {
        case "research-intel":
          result = await specialistSwarmService.runResearchIntel(selectedSymbol);
          break;
        case "quant-analyst":
          result = await specialistSwarmService.runQuantAnalyst(selectedSymbol);
          break;
        case "strategy-signal":
          result = await specialistSwarmService.runStrategySignal(selectedSymbol);
          break;
        case "risk-manager":
          result = await specialistSwarmService.runRiskManager(selectedSymbol, {
            symbol: selectedSymbol,
            direction: "BUY",
            setupName: "15M Liquidity Sweep Test",
            entryZone: "1.08350",
            entryPrice: 1.0835,
            stopLoss: 1.0822,
            takeProfit1: 1.0874,
            takeProfit2: 1.091,
            riskRewardRatio: 3.0,
            confluenceFactors: ["Test Sweep", "Orderflow Delta Positive"],
            invalidationCondition: "Candle close below 1.0820",
            recommendedTimeframe: "M15",
          });
          break;
        case "critic-reviewer":
          result = await specialistSwarmService.runCriticReviewer({
            symbol: selectedSymbol,
            direction: "BUY",
            setupName: "15M Liquidity Sweep Test",
            entryZone: "1.08350",
            entryPrice: 1.0835,
            stopLoss: 1.0822,
            takeProfit1: 1.0874,
            takeProfit2: 1.091,
            riskRewardRatio: 3.0,
            confluenceFactors: ["Test Sweep", "Orderflow Delta Positive"],
            invalidationCondition: "Candle close below 1.0820",
            recommendedTimeframe: "M15",
          });
          break;
        case "journal-coach":
          result = await specialistSwarmService.runJournalCoach();
          break;
        case "copilot-embedded":
          result = await specialistSwarmService.runUICopilot("How do I identify institutional fair value gaps in EURUSD?");
          break;
        case "monitor-alert":
          result = await specialistSwarmService.runMonitorAlert(selectedSymbol);
          break;
        case "ops-sentinel":
          result = await specialistSwarmService.runOpsSentinel();
          break;
        default:
          result = { message: `Agent ${agent.id} operational.` };
      }

      setSingleTestResult(result);
      toast.success(`${agent.name} test complete!`);
    } catch (err: any) {
      toast.error(`Agent test failed: ${err.message || String(err)}`);
    } finally {
      setIsTestingSingle(false);
    }
  };

  const handleTriggerPaperExecution = async () => {
    if (!consensusResult || consensusResult.isVetoed) return;

    try {
      toast.info("Triggering simulated paper order with Human-in-the-Loop review...");
      const strat = consensusResult.strategy;
      const risk = consensusResult.risk;

      await toolRegistry.executeTool(
        "simulate_paper_order",
        {
          symbol: strat.symbol,
          direction: strat.direction as "BUY" | "SELL",
          lotSize: risk.recommendedLotSize,
          entryPrice: strat.entryPrice,
          stopLoss: strat.stopLoss,
          takeProfit: strat.takeProfit1,
        },
        {
          agentName: "Aegis Risk Sentinel & Hyperion Strategy",
          runId: consensusResult.runId,
          isHumanApproved: false, // Triggers HITL dialog!
        },
        ["simulate_paper_order"]
      );

      toast.success("Order simulated successfully!");
    } catch (err: any) {
      if (err.name === "HumanApprovalRequiredError") {
        toast.info("Awaiting trader approval in the Human-in-the-Loop dialog.");
      } else {
        toast.error(`Order execution aborted: ${err.message || String(err)}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="p-5 rounded-2xl bg-[#090a0f] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              9-Specialist Quant Swarm
              <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px] font-mono">
                STAGE 3 OPERATIONAL
              </Badge>
            </h2>
            <p className="text-xs text-white/50">
              Parallel intelligence synthesis, adversarial devil's advocate, independent veto power, and real-time governance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Symbol Select */}
          <div className="flex items-center gap-1.5 bg-black/60 border border-white/10 px-3 py-1.5 rounded-xl text-xs font-mono">
            <span className="text-white/40">PAIR:</span>
            {["EURUSD", "GBPUSD", "XAUUSD", "BTCUSDT"].map((sym) => (
              <button
                key={sym}
                onClick={() => setSelectedSymbol(sym)}
                className={`px-2 py-0.5 rounded-md transition-all ${
                  selectedSymbol === sym
                    ? "bg-purple-600 text-white font-bold"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {sym}
              </button>
            ))}
          </div>

          {/* Run Full Swarm Button */}
          <Button
            onClick={handleRunFullSwarm}
            disabled={isRunningFullSwarm}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs h-10 px-4 rounded-xl shadow-lg shadow-purple-600/30"
          >
            {isRunningFullSwarm ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Orchestrating ({currentStepIndex}/5)...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2 text-amber-300" />
                Run Full Swarm Consensus
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Step Indicator Progress Bar */}
      {isRunningFullSwarm && (
        <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-purple-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
              {swarmStepMessage || "Dispatching multi-agent execution graph..."}
            </span>
            <span className="text-white/50">{currentStepIndex} of 5 Steps</span>
          </div>
          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${(currentStepIndex / 5) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Consensus Result Audit Card */}
      {consensusResult && (
        <div
          className={`p-6 rounded-2xl border transition-all ${
            consensusResult.isVetoed
              ? "bg-rose-950/20 border-rose-500/40 shadow-xl shadow-rose-950/30"
              : "bg-emerald-950/20 border-emerald-500/40 shadow-xl shadow-emerald-950/30"
          } space-y-5`}
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              {consensusResult.isVetoed ? (
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-rose-400" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      consensusResult.isVetoed
                        ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                        : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    }
                  >
                    {consensusResult.isVetoed ? "CONSENSUS VETOED" : "CONSENSUS APPROVED"}
                  </Badge>
                  <span className="font-mono text-xs text-white/50">
                    Run ID: {consensusResult.runId.slice(-8)}
                  </span>
                  <span className="font-mono text-xs text-white/50">
                    Latency: {consensusResult.totalLatencyMs}ms
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">
                  {consensusResult.strategy.direction} {consensusResult.symbol} -{" "}
                  {consensusResult.strategy.setupName}
                </h3>
              </div>
            </div>

            {!consensusResult.isVetoed && (
              <Button
                onClick={handleTriggerPaperExecution}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 shadow-md shadow-emerald-600/30"
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                Simulate Paper Order (Trigger HITL)
              </Button>
            )}
          </div>

          {/* 4-Column Audit Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            {/* 1. Macro & Quant Intel */}
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2">
              <div className="text-[10px] font-mono text-purple-400 uppercase tracking-wider font-semibold">
                1. Macro & Quant Foundation
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-white/60">Macro Bias:</span>
                  <span className="font-semibold text-white">
                    {consensusResult.research.overallMacroBias}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Regime:</span>
                  <span className="font-semibold text-white">
                    {consensusResult.quant.marketRegime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Confidence:</span>
                  <span className="font-semibold text-emerald-400">
                    {consensusResult.quant.confidencePct}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Invalidation:</span>
                  <span className="font-mono text-rose-400">
                    {consensusResult.quant.invalidationLevel}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Proposed Setup */}
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2">
              <div className="text-[10px] font-mono text-blue-400 uppercase tracking-wider font-semibold">
                2. Strategy Parameters
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-white/60">Entry Zone:</span>
                  <span className="font-mono text-white">
                    {consensusResult.strategy.entryZone}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Stop Loss:</span>
                  <span className="font-mono text-rose-300">
                    {consensusResult.strategy.stopLoss}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Take Profit 1:</span>
                  <span className="font-mono text-emerald-300">
                    {consensusResult.strategy.takeProfit1}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Risk / Reward:</span>
                  <span className="font-mono font-bold text-amber-400">
                    1 : {consensusResult.strategy.riskRewardRatio}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Adversarial Critique */}
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2">
              <div className="text-[10px] font-mono text-amber-400 uppercase tracking-wider font-semibold">
                3. Adversarial Challenge
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-white/60">Skepticism Score:</span>
                  <span className="font-bold text-amber-400">
                    {consensusResult.critic.adversarialScore}/100
                  </span>
                </div>
                <div className="text-white/70 text-[11px] leading-relaxed line-clamp-3">
                  {consensusResult.critic.mandatedAdjustments}
                </div>
              </div>
            </div>

            {/* 4. Risk Sentinel Clearance */}
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2">
              <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
                4. Risk Governor Verdict
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-white/60">Ruin Probability:</span>
                  <span className="font-mono text-emerald-400 font-semibold">
                    {consensusResult.risk.ruinProbabilityPct}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Recommended Lots:</span>
                  <span className="font-mono font-bold text-white">
                    {consensusResult.risk.recommendedLotSize} Lots
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Kelly Fraction:</span>
                  <span className="font-mono text-white">
                    {consensusResult.risk.fractionalKellyExposure}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Verdict:</span>
                  <span
                    className={`font-bold ${
                      consensusResult.isVetoed ? "text-rose-400" : "text-emerald-400"
                    }`}
                  >
                    {consensusResult.risk.verdict}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9-Agent Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {agents.map((agent) => {
          const isVeto = agent.isVetoPower;
          return (
            <div
              key={agent.id}
              className={`p-4 rounded-xl border bg-[#0b0c12] transition-all hover:border-purple-500/40 flex flex-col justify-between ${
                isVeto ? "border-amber-500/30" : "border-white/10"
              }`}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[10px] text-purple-400 block font-semibold">
                      {agent.codeName}
                    </span>
                    <h3 className="font-bold text-white text-sm">{agent.name}</h3>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge
                      className={
                        isVeto
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40 text-[9px]"
                          : "bg-white/5 text-white/60 border-white/10 text-[9px]"
                      }
                    >
                      {isVeto ? "INDEPENDENT VETO" : "SPECIALIST"}
                    </Badge>
                    <span className="text-[9px] font-mono text-white/40">{agent.model}</span>
                  </div>
                </div>

                {/* Role & Specialty */}
                <div className="space-y-1">
                  <div className="text-xs font-medium text-purple-200">{agent.role}</div>
                  <p className="text-[11px] text-white/50 leading-relaxed">{agent.specialty}</p>
                </div>

                {/* Tools */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {agent.grantedTools.map((t) => (
                    <span
                      key={t}
                      className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/5 font-mono text-[9px] text-white/60"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-white/5 mt-3 flex items-center justify-between">
                <span className="text-[10px] font-mono text-white/40">
                  Budget: ${agent.costBudgetUsd.toFixed(2)}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleTestSingleAgent(agent)}
                  className="h-7 text-xs border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20"
                >
                  <Play className="w-3 h-3 mr-1" />
                  Test Node
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Single Agent Test Result Dialog */}
      <Dialog
        open={!!activeTestAgent}
        onOpenChange={(open) => {
          if (!open) setActiveTestAgent(null);
        }}
      >
        <DialogContent className="max-w-2xl bg-[#0d0e15] border border-purple-500/30 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Terminal className="w-4 h-4 text-purple-400" />
              Specialist Node Execution: {activeTestAgent?.name}
            </DialogTitle>
          </DialogHeader>

          {isTestingSingle ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-6 h-6 text-purple-400 animate-spin" />
              <span className="font-mono text-xs text-white/60">
                Executing {activeTestAgent?.name} with tool feeds & pgvector context...
              </span>
            </div>
          ) : singleTestResult ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px]">
                  Output Validated by Zod Schema
                </Badge>
                <span className="text-white/40">Model: {activeTestAgent?.model}</span>
              </div>
              <pre className="text-xs font-mono text-emerald-400 bg-black/70 p-4 rounded-xl overflow-x-auto border border-white/10 max-h-96">
                {JSON.stringify(singleTestResult, null, 2)}
              </pre>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};
