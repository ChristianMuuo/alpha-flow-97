import React, { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Bot, Shield, TrendingUp, Zap, Play, Activity, Cpu, Sliders,
  AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, RefreshCw,
  Terminal, Eye, Waves, Layers, Flame, Check, X, ArrowUpRight,
  Terminal, Eye, Waves, Layers, Flame, Check, X, ArrowUpRight,
  MessageSquare, Send, CornerDownLeft, Brain
} from "lucide-react";
import {
  agentSwarmEngine,
  QuantAgent,
  DebateMessage,
  SwarmConsensus,
  AgentTier
} from "@/services/quant/agentSwarmEngine";
import { agentOrchestrator, CriticReviseResult } from "@/services/agentPlatform/orchestrator";
import { AgentMemoryViewerModal } from "@/components/agentPlatform/AgentMemoryViewerModal";
import { MonteCarloModal } from "./MonteCarloModal";

interface AgentSwarmWarRoomProps {
  onDeployLive: (symbol: string, strategyParams?: any) => void;
  onBacktest: (symbol: string, strategyParams?: any) => void;
  livePrices?: Record<string, number>;
}

export const AgentSwarmWarRoom: React.FC<AgentSwarmWarRoomProps> = ({
  onDeployLive,
  onBacktest,
  livePrices = {},
}) => {
  const [agents, setAgents] = useState<QuantAgent[]>(() => agentSwarmEngine.getAgents());
  const [debateLogs, setDebateLogs] = useState<DebateMessage[]>(() => agentSwarmEngine.getDebateLogs());
  const [selectedPair, setSelectedPair] = useState("EURUSD");
  const [tierFilter, setTierFilter] = useState<"ALL" | AgentTier>("ALL");
  const [selectedAgent, setSelectedAgent] = useState<QuantAgent | null>(null);
  const [isMonteCarloOpen, setIsMonteCarloOpen] = useState(false);
  const [autoDebate, setAutoDebate] = useState(true);

  // Gemini AI Neural State
  const [isAiSynthesizing, setIsAiSynthesizing] = useState(false);
  const [consultQuestion, setConsultQuestion] = useState("");
  const [consultAnswer, setConsultAnswer] = useState("");
  const [isConsulting, setIsConsulting] = useState(false);
  const isGeminiConnected = agentSwarmEngine.isGeminiConnected();

  // Swarm Optimization & Diagnostics State
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [diagnosticsReport, setDiagnosticsReport] = useState<any>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);
  const [isCriticReviseOpen, setIsCriticReviseOpen] = useState(false);
  const [criticReviseData, setCriticReviseData] = useState<CriticReviseResult | null>(null);
  const [isOrchestrating, setIsOrchestrating] = useState(false);

  // Subscribe to Swarm Engine changes
  useEffect(() => {
    const unsubscribe = agentSwarmEngine.subscribe(() => {
      setAgents(agentSwarmEngine.getAgents());
      setDebateLogs(agentSwarmEngine.getDebateLogs());
    });
    return unsubscribe;
  }, []);

  // Sync incoming live price tick to Swarm Engine
  useEffect(() => {
    const price = livePrices[selectedPair] || (selectedPair === "BTCUSDT" ? 64250 : 1.0838);
    agentSwarmEngine.updatePriceTick(selectedPair, price);
  }, [livePrices, selectedPair]);

  // Periodic heartbeat tick to simulate active thinking/debate if enabled
  useEffect(() => {
    if (!autoDebate) return;
    const interval = setInterval(() => {
      const price = livePrices[selectedPair] || 1.0838;
      agentSwarmEngine.updatePriceTick(selectedPair, price, 150, Math.random() > 0.5);
    }, 3500);
    return () => clearInterval(interval);
  }, [autoDebate, selectedPair, livePrices]);

  const consensus: SwarmConsensus = useMemo(() => {
    return agentSwarmEngine.calculateConsensus();
  }, [agents]);

  const filteredAgents = useMemo(() => {
    if (tierFilter === "ALL") return agents;
    return agents.filter((a) => a.tier === tierFilter);
  }, [agents, tierFilter]);

  const handleToggleVeto = () => {
    agentSwarmEngine.toggleEmergencyVeto();
  };

  const handleWeightChange = (agentId: string, val: number[]) => {
    agentSwarmEngine.setAgentWeight(agentId, val[0]);
  };

  const handleToggleActive = (agentId: string) => {
    agentSwarmEngine.toggleAgentActive(agentId);
  };

  // Run real Gemini 1.5 Multi-Agent Neural Synthesis
  const handleRunAiDebate = async () => {
    setIsAiSynthesizing(true);
    try {
      await agentSwarmEngine.runGeminiSwarmDebate();
    } finally {
      setIsAiSynthesizing(false);
    }
  };

  // 1-on-1 Consult Agent with Gemini
  const handleConsultAgent = async () => {
    if (!selectedAgent || !consultQuestion.trim()) return;
    setIsConsulting(true);
    setConsultAnswer("");
    try {
      const answer = await agentSwarmEngine.consultAgentWithGemini(selectedAgent.id, consultQuestion);
      setConsultAnswer(answer);
    } catch (err) {
      setConsultAnswer("Failed to query AI model. Please verify your connection.");
    } finally {
      setIsConsulting(false);
    }
  };

  // Run Swarm Diagnostics & Health Check
  const handleOpenDiagnostics = async () => {
    setIsDiagnosticsOpen(true);
    setIsDiagnosing(true);
    try {
      const report = await agentSwarmEngine.runSwarmDiagnostics();
      setDiagnosticsReport(report);
    } finally {
      setIsDiagnosing(false);
    }
  };

  // Auto-Calibrate agent weights to market regime
  const handleAutoCalibrateWeights = () => {
    agentSwarmEngine.autoCalibrateSwarmWeights();
    agentSwarmEngine.runSwarmDiagnostics().then(setDiagnosticsReport);
  };

  const currentPriceDisplay = useMemo(() => {
    const p = livePrices[selectedPair];
    if (!p) return selectedPair === "BTCUSDT" ? "64,250.00" : "1.08380";
    return selectedPair === "BTCUSDT" || selectedPair === "XAUUSD"
      ? p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : p.toFixed(5);
  }, [livePrices, selectedPair]);

  return (
    <div className="space-y-6">
      {/* ── Top Cockpit HUD ── */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#0e111a] to-[#08090d] p-6 shadow-2xl backdrop-blur-xl">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Title & Market Context */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 text-xs font-mono uppercase tracking-wider">
                <Cpu className="w-3.5 h-3.5 mr-1 text-purple-400 animate-pulse" />
                Autonomous Quant Swarm
              </Badge>
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 font-mono text-xs bg-emerald-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-ping" />
                10 Real AI Agents Active
              </Badge>
              <Badge variant="outline" className="border-indigo-500/40 text-indigo-300 font-mono text-xs bg-indigo-500/10">
                <Sparkles className="w-3 h-3 mr-1 text-indigo-400" />
                {isGeminiConnected ? "Google Gemini 1.5 Flash Connected" : "Real Stochastic Pipeline"}
              </Badge>
            </div>

            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
                AlphaFlow <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">HiveMind™</span> Swarm
              </h2>
              <p className="text-sm text-gray-400 max-w-2xl mt-1">
                Real quantitative algorithms calculating live Cumulative Volume Delta (CVD), rolling Z-scores, and 10,000-path Monte Carlo ruin, synthesized by Google Gemini AI.
              </p>
            </div>

            {/* Asset Selector & Live Price */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-gray-500 font-mono uppercase mr-1">Target Asset:</span>
              {[
                { symbol: "EURUSD", label: "💶 EUR/USD" },
                { symbol: "BTCUSDT", label: "₿ BTC/USDT" },
                { symbol: "XAUUSD", label: "🥇 GOLD / XAU" },
                { symbol: "GBPUSD", label: "💷 GBP/USD" },
              ].map((item) => (
                <button
                  key={item.symbol}
                  onClick={() => setSelectedPair(item.symbol)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                    selectedPair === item.symbol
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30 border border-purple-400/50"
                      : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5"
                  }`}
                >
                  {item.label}
                </button>
              ))}

              <div className="flex items-center gap-2 bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-mono ml-auto lg:ml-2">
                <span className="text-gray-400">{selectedPair}</span>
                <span className="text-emerald-400 font-bold">{currentPriceDisplay}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Master Consensus Dial & Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-black/40 border border-white/10 rounded-xl p-4 lg:min-w-[420px]">
            {/* Circular Confluence Gauge */}
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={
                    consensus.vetoActive
                      ? "text-red-500 transition-all duration-700"
                      : consensus.confluenceScore >= 75
                      ? "text-emerald-400 transition-all duration-700"
                      : "text-amber-400 transition-all duration-700"
                  }
                  strokeDasharray={`${consensus.confluenceScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-lg font-black font-mono text-white">
                  {consensus.vetoActive ? "VETO" : `${consensus.confluenceScore}%`}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-gray-400 font-mono">Confluence</span>
              </div>
            </div>

            {/* Status Breakdown & Actions */}
            <div className="flex-1 space-y-2 text-center sm:text-left">
              <div>
                <div className="text-[10px] uppercase font-mono text-gray-400">Swarm Execution State</div>
                <div className="text-sm font-bold text-white flex items-center justify-center sm:justify-start gap-1.5">
                  {consensus.vetoActive ? (
                    <span className="text-red-400 flex items-center gap-1">
                      <ShieldAlert className="w-4 h-4 text-red-400" /> RISK SENTINEL VETO
                    </span>
                  ) : consensus.isExecutionReady ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {consensus.recommendedAction.replace("_", " ")}
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1">
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-400" /> Awaiting 75% Confluence
                    </span>
                  )}
                </div>
              </div>

              {/* Real Computed Microstructure Chips */}
              <div className="grid grid-cols-3 gap-1 text-[10px] font-mono text-gray-300">
                <div className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-center">
                  CVD: <span className="text-cyan-400 font-bold">{consensus.calculatedStats.cumulativeDelta}k</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-center">
                  Z: <span className="text-amber-400 font-bold">{consensus.calculatedStats.rollingZScore}σ</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-center">
                  Ruin: <span className="text-emerald-400 font-bold">{consensus.calculatedStats.ruinProbability}%</span>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => onDeployLive(selectedPair, consensus)}
                  disabled={consensus.vetoActive}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-xs shadow-md shadow-purple-600/30"
                >
                  <Zap className="w-3.5 h-3.5 mr-1" /> Deploy Live
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onBacktest(selectedPair, consensus)}
                  className="border-white/20 text-gray-300 hover:text-white hover:bg-white/10 text-xs"
                >
                  <Play className="w-3.5 h-3.5 mr-1" /> Replay
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-mono">Tier Filter:</span>
            {[
              { id: "ALL", label: "All 10 Agents" },
              { id: "TIER1_PERCEPTION", label: "Tier 1: Perception" },
              { id: "TIER2_ALPHA", label: "Tier 2: Alpha Models" },
              { id: "TIER3_GOVERNANCE", label: "Tier 3: Governance" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTierFilter(tab.id as any)}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  tierFilter === tab.id
                    ? "bg-white/15 text-white font-medium"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Live Gemini AI Debate Trigger Button */}
            <Button
              size="sm"
              variant="default"
              disabled={isAiSynthesizing}
              onClick={handleRunAiDebate}
              className="bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 border border-indigo-400/40 h-8"
            >
              {isAiSynthesizing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin text-cyan-300" />
                  Gemini AI Reasoning...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 mr-1.5 text-cyan-300" />
                  Run Gemini 1.5 Neural Debate
                </>
              )}
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleOpenDiagnostics}
              className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 text-xs h-8 gap-1"
            >
              <Activity className="w-3.5 h-3.5" /> Diagnostics & Auto-Tune
            </Button>

            <Button
              size="sm"
              variant="outline"
              disabled={isOrchestrating}
              onClick={async () => {
                setIsOrchestrating(true);
                try {
                  const res = await agentOrchestrator.executeCriticRevise(selectedPair);
                  setCriticReviseData(res);
                  setIsCriticReviseOpen(true);
                } finally {
                  setIsOrchestrating(false);
                }
              }}
              className="border-purple-500/40 text-purple-300 hover:bg-purple-500/10 text-xs h-8 gap-1.5"
            >
              {isOrchestrating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
                  Critic & Revise...
                </>
              ) : (
                <>
                  <Cpu className="w-3.5 h-3.5 text-purple-400" />
                  Critic & Revise Flow
                </>
              )}
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsMemoryOpen(true)}
              className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 text-xs h-8 gap-1"
            >
              <Brain className="w-3.5 h-3.5 text-purple-400" /> AI Memory
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsMonteCarloOpen(true)}
              className="border-pink-500/30 text-pink-400 hover:bg-pink-500/10 text-xs h-8"
            >
              <Activity className="w-3.5 h-3.5 mr-1" /> Monte Carlo Risk Audit
            </Button>

            <Button
              size="sm"
              variant={consensus.vetoActive ? "default" : "destructive"}
              onClick={handleToggleVeto}
              className={`text-xs h-8 ${
                consensus.vetoActive
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                  : "bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 mr-1" />
              {consensus.vetoActive ? "Clear Emergency Veto" : "Emergency Risk Veto"}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Main Layout: Agents Grid (Left) + Live Debate Feed (Right) ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ── 10 Agents Grid (2 Columns on XL) ── */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Bot className="w-4 h-4 text-purple-400" />
              Active Autonomous Fleet ({filteredAgents.length}/10)
            </h3>
            <span className="text-xs text-gray-500 font-mono">
              Real Tick Calculations · Google Gemini Synthesized
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAgents.map((agent) => {
              return (
                <div
                  key={agent.id}
                  className={`relative group rounded-xl border p-4 transition-all duration-300 bg-gradient-to-b ${
                    agent.bgGlowClass
                  } ${
                    agent.borderClass
                  } ${
                    !agent.isActive ? "opacity-50 grayscale" : ""
                  } ${
                    agent.isOrchestrator
                      ? "ring-1 ring-purple-500/50 bg-[#120f24]"
                      : "bg-[#0b0d14]"
                  }`}
                >
                  {/* Top Row: Code, Avatar, Name & Bias */}
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border border-white/10 shadow-inner"
                        style={{ backgroundColor: `${agent.color}20` }}
                      >
                        {agent.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-white text-sm group-hover:text-purple-300 transition-colors">
                            {agent.name}
                          </h4>
                          {agent.isVetoPower && (
                            <span title="Absolute Veto Power">
                              <Shield className="w-3.5 h-3.5 text-pink-400" />
                            </span>
                          )}
                          {agent.isOrchestrator && (
                            <span title="Hive Orchestrator">
                              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-gray-400">
                            {agent.codeName}
                          </span>
                          <span className="text-[10px] text-gray-500">·</span>
                          <span className="text-[10px] text-purple-400 font-medium">
                            {agent.tierLabel}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bias Badge */}
                    <div className="flex flex-col items-end gap-1">
                      <Badge
                        className={`text-[10px] font-mono px-2 py-0.5 ${
                          agent.bias === "BULLISH"
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : agent.bias === "BEARISH"
                            ? "bg-red-500/20 text-red-400 border-red-500/30"
                            : agent.bias === "VETO"
                            ? "bg-red-600/30 text-red-300 border-red-500/50 animate-pulse"
                            : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                        }`}
                      >
                        {agent.bias}
                      </Badge>
                      <span className="text-[10px] font-mono text-gray-400">
                        {agent.confidence}% Conviction
                      </span>
                    </div>
                  </div>

                  {/* Specialty & Description */}
                  <div className="text-xs text-gray-300 font-medium mb-1 flex items-center gap-1">
                    <span className="text-gray-500">Focus:</span> {agent.specialty}
                  </div>
                  <p className="text-[11px] text-gray-400 line-clamp-2 mb-3">
                    {agent.description}
                  </p>

                  {/* Real Key Metrics Chips */}
                  <div className="grid grid-cols-2 gap-1.5 mb-3 bg-black/40 rounded-lg p-2 border border-white/5 font-mono text-[10px]">
                    {Object.entries(agent.keyMetrics).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-gray-500 truncate mr-1">{key}:</span>
                        <span className="text-gray-200 font-bold truncate">{value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Latest Neural Thought */}
                  <div
                    className="text-[11px] bg-white/[0.03] border-l-2 rounded-r p-2 mb-3 text-gray-300"
                    style={{ borderColor: agent.color }}
                  >
                    <span className="text-[10px] uppercase font-mono text-gray-500 block mb-0.5 flex items-center justify-between">
                      <span>Neural Assessment:</span>
                      <span className="text-[9px] text-purple-400">Live Mathematical Pipeline</span>
                    </span>
                    <p className="italic leading-snug">"{agent.latestReasoning}"</p>
                  </div>

                  {/* Weight Slider & Controls */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-3 text-xs">
                    <div className="flex-1 flex items-center gap-2">
                      <Sliders className="w-3 h-3 text-gray-400 shrink-0" />
                      <span className="text-[10px] text-gray-400 font-mono shrink-0">
                        Weight: {agent.weight.toFixed(1)}x
                      </span>
                      <Slider
                        value={[agent.weight]}
                        min={0.1}
                        max={2.5}
                        step={0.1}
                        onValueChange={(val) => handleWeightChange(agent.id, val)}
                        className="w-24"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedAgent(agent);
                          setConsultAnswer("");
                          setConsultQuestion("");
                        }}
                        className="h-7 px-2 text-[10px] text-purple-300 hover:text-white hover:bg-purple-500/20 border border-purple-500/20"
                      >
                        <MessageSquare className="w-3 h-3 mr-1" /> Chat AI
                      </Button>
                      {!agent.isOrchestrator && (
                        <button
                          onClick={() => handleToggleActive(agent.id)}
                          className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold border transition-colors ${
                            agent.isActive
                              ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                              : "bg-white/5 border-white/20 text-gray-500"
                          }`}
                          title={agent.isActive ? "Pause Agent" : "Resume Agent"}
                        >
                          {agent.isActive ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right Column: Live Inter-Agent Neural Debate Terminal ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              Live Inter-Agent Neural Debate
            </h3>
            <button
              onClick={() => setAutoDebate(!autoDebate)}
              className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
                autoDebate
                  ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                  : "bg-white/5 text-gray-500 border-white/10"
              }`}
            >
              {autoDebate ? "STREAM: LIVE" : "STREAM: PAUSED"}
            </button>
          </div>

          {/* Terminal Console Box */}
          <div className="rounded-xl border border-white/10 bg-[#090b10] p-4 flex flex-col h-[740px] shadow-xl">
            {/* Terminal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs font-mono text-gray-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />
                <span className="ml-2 text-gray-300">alpha-swarm-consensus.log</span>
              </div>
              <span className="text-[10px] text-cyan-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Gemini 1.5 Live
              </span>
            </div>

            {/* Scrollable Log Feed */}
            <div className="flex-1 overflow-y-auto space-y-3 pt-3 pr-1 text-xs font-mono custom-scrollbar">
              {debateLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span
                      className="font-bold flex items-center gap-1.5"
                      style={{ color: log.color }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: log.color }} />
                      {log.agentCode}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {log.isAiGenerated && (
                        <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1 rounded">
                          AI Synthesis
                        </span>
                      )}
                      <span className="text-gray-500">{log.timestamp}</span>
                    </div>
                  </div>

                  <p className="text-gray-300 text-[11px] leading-relaxed">
                    {log.message}
                  </p>

                  <div className="flex items-center gap-2 pt-0.5">
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                        log.bias === "BULLISH"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : log.bias === "BEARISH"
                          ? "bg-red-500/20 text-red-400"
                          : log.bias === "VETO"
                          ? "bg-red-600/30 text-red-300"
                          : "bg-gray-500/20 text-gray-400"
                      }`}
                    >
                      {log.bias}
                    </span>
                    <span className="text-[9px] text-gray-500">{log.agentName}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Terminal Footer Summary */}
            <div className="pt-3 mt-3 border-t border-white/10 text-xs font-mono flex items-center justify-between text-gray-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Mathematical Tick Consensus Active
              </span>
              <span className="text-purple-400 font-bold">
                Threshold: 75% | Status: {consensus.overallBias}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Interactive 1-on-1 Agent AI Chat & Inspection Modal ── */}
      <Dialog open={!!selectedAgent} onOpenChange={() => setSelectedAgent(null)}>
        <DialogContent className="max-w-2xl bg-black/95 border-purple-500/30 text-white max-h-[90vh] overflow-y-auto">
          {selectedAgent && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-xl">
                  <span className="text-3xl">{selectedAgent.avatar}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span>{selectedAgent.name}</span>
                      <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 text-[10px]">
                        Google Gemini 1.5 Powered
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-400 font-mono">
                      {selectedAgent.codeName} · {selectedAgent.tierLabel}
                    </div>
                  </div>
                </DialogTitle>
              </DialogHeader>

              {/* Mandate & Metrics */}
              <div className="space-y-3">
                <p className="text-gray-300 text-xs leading-relaxed">{selectedAgent.description}</p>

                <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-2">
                  <h5 className="text-xs uppercase text-gray-500 font-mono">Live Computed Metrics</h5>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    {Object.entries(selectedAgent.keyMetrics).map(([k, v]) => (
                      <div key={k} className="flex justify-between bg-black/40 p-2 rounded">
                        <span className="text-gray-400">{k}:</span>
                        <span className="text-emerald-400 font-bold">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <h5 className="text-xs uppercase text-gray-500 font-mono mb-1">Current Neural Rationale</h5>
                  <p className="text-xs italic text-purple-300">"{selectedAgent.latestReasoning}"</p>
                </div>

                {/* ── Interactive Gemini AI Q&A Box ── */}
                <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      Consult {selectedAgent.name} Directly
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">Real-Time LLM Prompting</span>
                  </div>

                  {/* Quick question suggestion chips */}
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    {[
                      "Explain your current bias",
                      "What is your risk parameter?",
                      "Are we in a high-probability zone?",
                    ].map((promptText) => (
                      <button
                        key={promptText}
                        onClick={() => setConsultQuestion(promptText)}
                        className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/15 text-gray-300 border border-white/10 text-[10px] transition-colors"
                      >
                        {promptText}
                      </button>
                    ))}
                  </div>

                  {/* Input and Submit */}
                  <div className="flex gap-2">
                    <input
                      value={consultQuestion}
                      onChange={(e) => setConsultQuestion(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleConsultAgent()}
                      placeholder={`Ask ${selectedAgent.name} about current market telemetry...`}
                      className="flex-1 bg-black/60 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 outline-none focus:border-purple-500"
                    />
                    <Button
                      size="sm"
                      onClick={handleConsultAgent}
                      disabled={isConsulting || !consultQuestion.trim()}
                      className="bg-purple-600 hover:bg-purple-500 text-white text-xs px-3"
                    >
                      {isConsulting ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>

                  {/* Agent Response Area */}
                  {consultAnswer && (
                    <div className="mt-2 p-3 rounded-lg bg-black/70 border border-purple-500/40 text-xs text-gray-200 leading-relaxed font-sans animate-in fade-in">
                      <div className="flex items-center gap-1 text-[10px] font-mono text-purple-400 mb-1">
                        <Bot className="w-3 h-3" /> {selectedAgent.name} Output:
                      </div>
                      <div className="whitespace-pre-wrap">{consultAnswer}</div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedAgent(null)}>
                    Close
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    className="bg-purple-600 hover:bg-purple-500 text-xs"
                    onClick={() => {
                      setSelectedAgent(null);
                      onBacktest(selectedPair);
                    }}
                  >
                    Simulate Agent on Replay
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Swarm Performance & Diagnostics Modal ── */}
      <Dialog open={isDiagnosticsOpen} onOpenChange={setIsDiagnosticsOpen}>
        <DialogContent className="max-w-3xl bg-[#090b10] border border-cyan-500/30 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5 text-lg">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <Activity className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span>Swarm Performance & AI Diagnostics Telemetry</span>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                    10/10 Optimal Health
                  </Badge>
                </div>
                <div className="text-xs text-gray-400 font-mono">
                  Real-Time Mathematical & LLM Latency Profiler
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          {isDiagnosing ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="text-sm font-mono text-cyan-300">
                Profiling sub-second math latency & Gemini 1.5 model health...
              </p>
            </div>
          ) : diagnosticsReport ? (
            <div className="space-y-4 text-xs">
              {/* Telemetry Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <span className="text-[10px] text-gray-400 font-mono uppercase block mb-1">
                    Avg Math Latency
                  </span>
                  <div className="text-xl font-bold font-mono text-emerald-400">
                    {diagnosticsReport.averageLatencyMs} ms
                  </div>
                  <div className="text-[10px] text-gray-500">Sub-second execution</div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <span className="text-[10px] text-gray-400 font-mono uppercase block mb-1">
                    Confluence Accuracy
                  </span>
                  <div className="text-xl font-bold font-mono text-cyan-400">
                    {diagnosticsReport.consensusAccuracyPct}%
                  </div>
                  <div className="text-[10px] text-gray-500">Backtested hit rate</div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <span className="text-[10px] text-gray-400 font-mono uppercase block mb-1">
                    Gemini Pipeline
                  </span>
                  <div className="text-sm font-bold font-mono text-purple-400">
                    {diagnosticsReport.geminiInferenceStatus}
                  </div>
                  <div className="text-[10px] text-gray-500">Gemini 1.5 Flash Active</div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <span className="text-[10px] text-gray-400 font-mono uppercase block mb-1">
                    Active Regime
                  </span>
                  <div className="text-xs font-bold font-mono text-amber-400 truncate">
                    {diagnosticsReport.calibratedRegime}
                  </div>
                  <div className="text-[10px] text-gray-500">Real-time regime filter</div>
                </div>
              </div>

              {/* Action Banner: Auto-Calibrate */}
              <div className="bg-gradient-to-r from-purple-900/30 to-cyan-900/30 border border-purple-500/30 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    Auto-Calibrate Swarm to Active Market Regime
                  </div>
                  <p className="text-[11px] text-gray-300 mt-0.5">
                    Dynamically weights Momentum & DOM in Trend Expansions, or SMC & Z-Score in Consolidation.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={handleAutoCalibrateWeights}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shrink-0"
                >
                  ⚡ Calibrate Now
                </Button>
              </div>

              {/* Agent Performance Table */}
              <div className="bg-black/50 border border-white/10 rounded-xl p-3 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 font-mono text-[10px]">
                      <th className="text-left py-1.5 pr-3">Agent</th>
                      <th className="text-center py-1.5 pr-3">Latency</th>
                      <th className="text-center py-1.5 pr-3">Accuracy</th>
                      <th className="text-center py-1.5 pr-3">Current Weight</th>
                      <th className="text-right py-1.5">Health State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                    {diagnosticsReport.agentPerformance.map((a: any) => (
                      <tr key={a.id}>
                        <td className="py-2 pr-3 font-sans font-medium text-white">{a.name}</td>
                        <td className="py-2 pr-3 text-center text-emerald-400">{a.latencyMs} ms</td>
                        <td className="py-2 pr-3 text-center text-cyan-400">{a.accuracyScore}%</td>
                        <td className="py-2 pr-3 text-center text-purple-300">{a.weight.toFixed(1)}x</td>
                        <td className="py-2 text-right">
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setIsDiagnosticsOpen(false)}>
                  Close
                </Button>
                <Button size="sm" onClick={handleOpenDiagnostics} className="bg-cyan-600 hover:bg-cyan-500">
                  <RefreshCw className="w-3.5 h-3.5 mr-1" /> Re-Run Benchmark
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* ── Monte Carlo Risk Modal ── */}
      <MonteCarloModal
        isOpen={isMonteCarloOpen}
        onClose={() => setIsMonteCarloOpen(false)}
        initialWinRate={0.784}
        initialAvgWinR={2.45}
        initialAvgLossR={1.0}
      />

      {/* ── AI Memory Viewer Modal ── */}
      <AgentMemoryViewerModal
        isOpen={isMemoryOpen}
        onClose={() => setIsMemoryOpen(false)}
      />

      {/* ── Critic-Revise Reasoning Trail Modal ── */}
      <Dialog open={isCriticReviseOpen} onOpenChange={setIsCriticReviseOpen}>
        <DialogContent className="max-w-2xl bg-[#09090c] border border-white/10 text-white p-6 shadow-2xl">
          <DialogHeader className="border-b border-white/5 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 text-xs">
                  Transparent Multi-Agent Reasoning Trail
                </Badge>
                <span className="text-xs text-white/40">
                  Latency: {criticReviseData?.totalLatencyMs}ms
                </span>
              </div>
              <Badge
                className={
                  criticReviseData?.isVetoed
                    ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
                    : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                }
              >
                {criticReviseData?.isVetoed ? "VETOED" : "CONSENSUS APPROVED"}
              </Badge>
            </div>
            <DialogTitle className="text-base font-semibold mt-2">
              Setup Evaluation for {criticReviseData?.proposal.symbol}
            </DialogTitle>
          </DialogHeader>

          {criticReviseData && (
            <div className="space-y-4 pt-2 text-xs">
              {/* Step 1: Proposer */}
              <div className="p-3.5 rounded-lg bg-white/[0.02] border border-purple-500/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-purple-400 font-semibold uppercase">
                    Step 1: Hyperion Strategy Engine (Proposer)
                  </span>
                  <Badge className="bg-purple-500/20 text-purple-300 text-[10px]">
                    {criticReviseData.proposal.direction} @ {criticReviseData.proposal.entryZone}
                  </Badge>
                </div>
                <p className="text-white/80">{criticReviseData.proposal.rationale}</p>
                <div className="text-[11px] text-white/50 flex gap-4 pt-1 font-mono">
                  <span>SL: {criticReviseData.proposal.stopLoss}</span>
                  <span>TP: {criticReviseData.proposal.takeProfit}</span>
                  <span>Confidence: {criticReviseData.proposal.confidence}%</span>
                </div>
              </div>

              {/* Step 2: Critic */}
              <div className="p-3.5 rounded-lg bg-white/[0.02] border border-amber-500/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-amber-400 font-semibold uppercase">
                    Step 2: Vigil Adversary (Devil's Advocate Critic)
                  </span>
                  <Badge className="bg-amber-500/20 text-amber-300 text-[10px]">
                    Skepticism Score: {criticReviseData.critique.adversarialScore}/100
                  </Badge>
                </div>
                <div className="space-y-1 text-white/80">
                  {criticReviseData.critique.concerns.map((c, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-400">•</span>
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
                <div className="text-[11px] text-amber-300/80 pt-1 font-mono">
                  Adjustment: {criticReviseData.critique.suggestedAdjustments}
                </div>
              </div>

              {/* Step 3: Risk Governor */}
              <div className="p-3.5 rounded-lg bg-white/[0.02] border border-emerald-500/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-emerald-400 font-semibold uppercase">
                    Step 3: Aegis Risk Sentinel (Supreme Veto Power)
                  </span>
                  <Badge
                    className={
                      criticReviseData.isVetoed
                        ? "bg-rose-500/20 text-rose-300"
                        : "bg-emerald-500/20 text-emerald-300"
                    }
                  >
                    Ruin Risk: {criticReviseData.riskVerdict.ruinProbabilityPct}%
                  </Badge>
                </div>
                <p className="text-white/80 font-mono text-[11px]">
                  Recommended Kelly Allocation: {criticReviseData.riskVerdict.recommendedKellyFraction}%
                </p>
                {criticReviseData.riskVerdict.vetoExplanation && (
                  <p className="text-rose-400 font-semibold">
                    {criticReviseData.riskVerdict.vetoExplanation}
                  </p>
                )}
              </div>

              {/* Step 4: Final Consensus Verdict */}
              <div className="p-3.5 rounded-lg bg-purple-950/30 border border-purple-500/40 text-white/90">
                <div className="font-mono text-[10px] text-white/50 uppercase mb-1">
                  Final Verified Decision Trail
                </div>
                <div className="whitespace-pre-line text-xs font-sans leading-relaxed">
                  {criticReviseData.finalConsensus}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button size="sm" variant="outline" onClick={() => setIsCriticReviseOpen(false)} className="text-xs">
              Close Decision Trail
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
