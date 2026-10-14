import React, { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp, ShieldAlert, Sparkles, RefreshCw, BarChart2,
  Percent, ArrowUpRight, CheckCircle2, AlertOctagon, HelpCircle
} from "lucide-react";
import { monteCarloEngine, MonteCarloResults } from "@/services/quant/monteCarloEngine";
import { haptics } from "@/utils/audioHaptics";

interface MonteCarloModalProps {
  isOpen: boolean;
  onClose: () => void;
  startingBalance?: number;
  profitTarget?: number;
}

export const MonteCarloModal: React.FC<MonteCarloModalProps> = ({
  isOpen,
  onClose,
  startingBalance = 100000,
  profitTarget = 10000
}) => {
  const [winRatePct, setWinRatePct] = useState("58");
  const [avgWinR, setAvgWinR] = useState("2.2");
  const [riskPct, setRiskPct] = useState("1.0");
  const [numTrades, setNumTrades] = useState("40");
  const [isSimulating, setIsSimulating] = useState(false);

  const results: MonteCarloResults = useMemo(() => {
    return monteCarloEngine.runSimulation({
      startingBalance,
      profitTarget,
      winRate: Number(winRatePct) / 100,
      avgWinR: Number(avgWinR),
      riskPerTradePct: Number(riskPct) / 100,
      tradesPerSimulation: Number(numTrades),
      numSimulations: 10000
    });
  }, [startingBalance, profitTarget, winRatePct, avgWinR, riskPct, numTrades, isSimulating]);

  const handleReRun = () => {
    haptics.playClick(1400);
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      haptics.playSuccess();
    }, 300);
  };

  // SVG dimensions for trajectory fan
  const svgWidth = 620;
  const svgHeight = 220;
  const minEquity = startingBalance * 0.88;
  const maxEquity = startingBalance * 1.22;

  const getY = (val: number) => {
    const clamped = Math.max(minEquity, Math.min(maxEquity, val));
    return svgHeight - ((clamped - minEquity) / (maxEquity - minEquity)) * svgHeight;
  };

  const getX = (idx: number, total: number) => {
    return (idx / (total - 1)) * (svgWidth - 60) + 40;
  };

  const p90Path = results.simulationPaths
    .map((p, i) => `${i === 0 ? "M" : "L"} ${getX(i, results.simulationPaths.length)} ${getY(p.p90)}`)
    .join(" ");

  const p50Path = results.simulationPaths
    .map((p, i) => `${i === 0 ? "M" : "L"} ${getX(i, results.simulationPaths.length)} ${getY(p.p50)}`)
    .join(" ");

  const p10Path = results.simulationPaths
    .map((p, i) => `${i === 0 ? "M" : "L"} ${getX(i, results.simulationPaths.length)} ${getY(p.p10)}`)
    .join(" ");

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-4xl bg-[#09090c] border border-white/10 text-white p-6 max-h-[92vh] overflow-y-auto shadow-2xl">
        <DialogHeader className="border-b border-white/5 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-mono text-[10px]">
                  <Sparkles className="w-3 h-3 mr-1" /> 10,000 Stochastic Bootstrap Paths
                </Badge>
                <Badge variant="outline" className="border-white/10 text-gray-400 font-mono text-[10px]">
                  Geometric Brownian Motion
                </Badge>
              </div>
              <DialogTitle className="text-xl font-bold font-display text-white">
                Monte Carlo Risk & Ruin Engine
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-400">
                Stress-test your strategy against statistical black swans, drawdown clustering, and prop firm combine limits.
              </DialogDescription>
            </div>

            <Button
              onClick={handleReRun}
              size="sm"
              disabled={isSimulating}
              className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isSimulating ? "animate-spin" : ""}`} />
              Re-Simulate (10k Paths)
            </Button>
          </div>
        </DialogHeader>

        {/* Input Parameters Control Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/[0.02] p-3 rounded-xl border border-white/5 mt-2">
          <div>
            <label className="text-[10px] text-gray-400 font-mono block mb-1">Win Rate (%)</label>
            <Input
              type="number"
              value={winRatePct}
              onChange={e => setWinRatePct(e.target.value)}
              className="h-8 bg-black/40 border-white/10 text-xs text-emerald-400 font-mono"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-400 font-mono block mb-1">Avg Win Multiplier (R)</label>
            <Input
              type="number"
              step="0.1"
              value={avgWinR}
              onChange={e => setAvgWinR(e.target.value)}
              className="h-8 bg-black/40 border-white/10 text-xs font-mono"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-400 font-mono block mb-1">Risk Per Trade (%)</label>
            <Input
              type="number"
              step="0.1"
              value={riskPct}
              onChange={e => setRiskPct(e.target.value)}
              className="h-8 bg-black/40 border-white/10 text-xs font-mono"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-400 font-mono block mb-1">Trades in Horizon</label>
            <Input
              type="number"
              value={numTrades}
              onChange={e => setNumTrades(e.target.value)}
              className="h-8 bg-black/40 border-white/10 text-xs font-mono"
            />
          </div>
        </div>

        {/* Core Outcome Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-[10px] text-emerald-400 font-mono uppercase block">Combine Pass Rate</span>
            <div className="text-2xl font-bold font-mono text-emerald-300 mt-1">
              {results.passProbability}%
            </div>
            <span className="text-[10px] text-emerald-500/80 font-mono">Odds of +$10k target</span>
          </div>

          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20">
            <span className="text-[10px] text-red-400 font-mono uppercase block">Risk of Account Ruin</span>
            <div className="text-2xl font-bold font-mono text-red-300 mt-1">
              {results.ruinProbability}%
            </div>
            <span className="text-[10px] text-red-500/80 font-mono">Max DD breach probability</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
            <span className="text-[10px] text-gray-400 font-mono uppercase block">95% Value at Risk (VaR)</span>
            <div className="text-xl font-bold font-mono text-white mt-1">
              ${results.valueAtRisk95.toLocaleString()}
            </div>
            <span className="text-[10px] text-gray-400 font-mono">Worst-case 95th %tile loss</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
            <span className="text-[10px] text-gray-400 font-mono uppercase block">Half-Kelly Sizing</span>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
              {results.halfKellyFraction}%
            </div>
            <span className="text-[10px] text-gray-400 font-mono">Full Kelly: {results.fullKellyFraction}%</span>
          </div>
        </div>

        {/* Equity Trajectory Fan (SVG Chart) */}
        <div className="bg-[#050508] p-4 rounded-xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-gray-300 flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-emerald-400" /> Simulated Equity Distribution Fan
            </span>
            <div className="flex items-center gap-4 text-[10px] font-mono">
              <span className="text-emerald-400">── 90th %tile (Top 10%)</span>
              <span className="text-blue-400">── 50th %tile (Median)</span>
              <span className="text-red-400">── 10th %tile (Worst 10%)</span>
            </div>
          </div>

          <div className="w-full overflow-hidden bg-black/50 rounded-lg p-2 border border-white/5">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-48 select-none">
              {/* Target & Drawdown Reference Lines */}
              <line x1="40" y1={getY(startingBalance + profitTarget)} x2={svgWidth - 20} y2={getY(startingBalance + profitTarget)} stroke="#10b981" strokeDasharray="4 4" strokeWidth="1" opacity="0.6" />
              <text x="45" y={getY(startingBalance + profitTarget) - 4} fill="#10b981" fontSize="9" fontFamily="monospace">Target: +$10k</text>

              <line x1="40" y1={getY(startingBalance)} x2={svgWidth - 20} y2={getY(startingBalance)} stroke="#ffffff" strokeWidth="1" opacity="0.2" />
              <text x="45" y={getY(startingBalance) - 4} fill="#888888" fontSize="9" fontFamily="monospace">$100,000 Starting</text>

              <line x1="40" y1={getY(startingBalance - 10000)} x2={svgWidth - 20} y2={getY(startingBalance - 10000)} stroke="#ef4444" strokeDasharray="4 4" strokeWidth="1" opacity="0.6" />
              <text x="45" y={getY(startingBalance - 10000) - 4} fill="#ef4444" fontSize="9" fontFamily="monospace">Max DD Limit: $90k</text>

              {/* Percentile Trajectories */}
              <path d={p90Path} fill="none" stroke="#34d399" strokeWidth="2.5" />
              <path d={p50Path} fill="none" stroke="#60a5fa" strokeWidth="2" />
              <path d={p10Path} fill="none" stroke="#f87171" strokeWidth="2" strokeDasharray="3 3" />
            </svg>
          </div>
        </div>

        {/* Institutional Risk Advice */}
        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-start gap-3 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-gray-300 text-[11px] leading-relaxed">
            <strong className="text-white">Quantitative Takeaway:</strong> With a <strong>{winRatePct}%</strong> win rate and <strong>1:{avgWinR} R:R</strong>, your system achieves an estimated Sharpe of <strong>{results.sharpeEstimate}</strong>. Your risk of ruin is constrained to <strong>{results.ruinProbability}%</strong> when sizing below <strong>{results.halfKellyFraction}%</strong> per trade.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
