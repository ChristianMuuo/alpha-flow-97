import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ShieldCheck, AlertCircle, Trophy, TrendingUp, Sparkles, CheckCircle2 } from "lucide-react";
import { playbookService, TraderProgression } from "@/services/playbookService";
import { MonteCarloModal } from "@/components/quant/MonteCarloModal";

export const PropFirmScorecard: React.FC = () => {
  const [progression, setProgression] = useState<TraderProgression>(playbookService.getProgression());
  const [showMonteCarlo, setShowMonteCarlo] = useState(false);

  useEffect(() => {
    setProgression(playbookService.getProgression());
  }, []);

  // $100,000 Prop Challenge Metrics
  const startingBalance = 100000;
  const currentEquity = 108450;
  const netProfit = currentEquity - startingBalance; // +$8,450
  const profitTarget = 10000; // $10,000 (10%)
  const profitPct = Math.min(Math.round((netProfit / profitTarget) * 100), 100);

  const dailyDrawdownLimit = 5000; // 5%
  const currentDailyDrawdown = 740;
  const dailyDrawdownPct = Math.round((currentDailyDrawdown / dailyDrawdownLimit) * 100);

  const maxTrailingDrawdown = 10000; // 10%
  const currentTrailingDrawdown = 1250;
  const maxDrawdownPct = Math.round((currentTrailingDrawdown / maxTrailingDrawdown) * 100);

  return (
    <Card className="bg-[#0e0e12] border-white/10 text-white shadow-2xl relative overflow-hidden">
      {/* Subtle Ambient Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <CardHeader className="pb-3 border-b border-white/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[11px] font-mono">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Institutional Prop Combine
              </Badge>
              <Badge variant="outline" className="text-[10px] border-white/10 text-gray-400 font-mono">
                $100,000 Evaluation • Phase 1
              </Badge>
            </div>
            <CardTitle className="text-xl font-bold font-display text-white">
              Funded Account Simulator
            </CardTitle>
            <CardDescription className="text-xs text-gray-400">
              Real-time drawdown, risk limits, and profit milestone tracking aligned with FTMO & institutional prop firm metrics.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowMonteCarlo(true)}
              size="sm"
              className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-xs gap-1.5 h-9"
            >
              <Sparkles className="w-3.5 h-3.5" /> Monte Carlo (10k Paths)
            </Button>

            {/* Trader Rank Pill */}
            <div className="flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-xl p-2.5 shrink-0">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="text-[9px] text-gray-400 font-mono uppercase">Trader Rank</div>
                <div className="text-xs font-bold text-white">{progression.rankTitle}</div>
                <div className="text-[9px] text-emerald-400 font-mono">Lvl {progression.level} • {progression.xp} XP</div>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-5 space-y-6">
        {/* Core Financial Status */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
            <span className="text-[10px] text-gray-400 font-mono uppercase">Simulated Equity</span>
            <div className="text-lg font-bold font-mono text-emerald-400">
              ${currentEquity.toLocaleString()}.00
            </div>
            <span className="text-[10px] text-emerald-500/80 font-mono">+8.45% Total</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
            <span className="text-[10px] text-gray-400 font-mono uppercase">Target Progress</span>
            <div className="text-lg font-bold font-mono text-white">
              {profitPct}%
            </div>
            <span className="text-[10px] text-gray-400 font-mono">${netProfit.toLocaleString()} / $10,000</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
            <span className="text-[10px] text-gray-400 font-mono uppercase">Daily DD Cushion</span>
            <div className="text-lg font-bold font-mono text-emerald-400">
              ${(dailyDrawdownLimit - currentDailyDrawdown).toLocaleString()}
            </div>
            <span className="text-[10px] text-gray-400 font-mono">{dailyDrawdownPct}% of limit used</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
            <span className="text-[10px] text-gray-400 font-mono uppercase">Max DD Cushion</span>
            <div className="text-lg font-bold font-mono text-emerald-400">
              ${(maxTrailingDrawdown - currentTrailingDrawdown).toLocaleString()}
            </div>
            <span className="text-[10px] text-gray-400 font-mono">{maxDrawdownPct}% of limit used</span>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-gray-300 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Profit Target Milestone ($10,000)
              </span>
              <span className="text-emerald-400 font-bold">{profitPct}% Completed</span>
            </div>
            <Progress value={profitPct} className="h-2 bg-white/5 [&>div]:bg-emerald-500" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-mono text-gray-400">
                <span>Daily Drawdown Limit: ${dailyDrawdownLimit}</span>
                <span className="text-emerald-400">{dailyDrawdownPct}%</span>
              </div>
              <Progress value={dailyDrawdownPct} className="h-1.5 bg-white/5 [&>div]:bg-emerald-400" />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-mono text-gray-400">
                <span>Maximum Trailing DD Limit: ${maxTrailingDrawdown}</span>
                <span className="text-emerald-400">{maxDrawdownPct}%</span>
              </div>
              <Progress value={maxDrawdownPct} className="h-1.5 bg-white/5 [&>div]:bg-emerald-400" />
            </div>
          </div>
        </div>

        {/* Rules & Badges Footer */}
        <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 text-gray-300">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Min Trading Days: <strong className="text-white">4 / 5</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Consistency Score: <strong className="text-white font-mono">92%</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {progression.badges.map((b) => (
              <Badge key={b} variant="secondary" className="bg-white/[0.05] text-[10px] text-gray-300 border-white/5">
                🏅 {b}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>

      <MonteCarloModal
        isOpen={showMonteCarlo}
        onClose={() => setShowMonteCarlo(false)}
        startingBalance={startingBalance}
        profitTarget={profitTarget}
      />
    </Card>
  );
};
