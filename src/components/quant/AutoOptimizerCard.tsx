import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, CheckCircle2, ArrowRight, Zap, ShieldCheck } from "lucide-react";
import { autoPlaybookOptimizer, StrategyOptimizationResult } from "@/services/quant/autoPlaybookOptimizer";
import { haptics } from "@/utils/audioHaptics";
import { toast } from "sonner";

export const AutoOptimizerCard: React.FC = () => {
  const [optimizations, setOptimizations] = useState<StrategyOptimizationResult[]>(
    autoPlaybookOptimizer.getOptimizations()
  );
  const [appliedIds, setAppliedIds] = useState<string[]>([]);

  const handleApply = (id: string, name: string) => {
    haptics.playSuccess();
    autoPlaybookOptimizer.applyOptimization(id);
    setAppliedIds(prev => [...prev, id]);
    toast.success(`Quant Optimization Applied to ${name}! (+50 XP)`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px] font-mono">
              <Sparkles className="w-3 h-3 mr-1" /> Genetic Algorithm Parameter Tuning
            </Badge>
            <Badge variant="outline" className="border-white/10 text-gray-400 text-[10px] font-mono">
              Hypothesis Test (p &lt; 0.05)
            </Badge>
          </div>
          <h4 className="text-base font-bold font-display text-white">
            AutoPlaybook Quant Optimizations
          </h4>
          <p className="text-xs text-gray-400">
            Automated mathematical edge refinement discovered from your historical trading logs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {optimizations.map((opt) => {
          const isApplied = appliedIds.includes(opt.strategyId);

          return (
            <Card key={opt.strategyId} className="bg-[#0b0b0e] border border-white/10 text-white p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-sm text-white">{opt.strategyName}</h5>
                  <span className="text-[10px] font-mono text-emerald-400">
                    Statistically Significant (p = {opt.pValue.toFixed(3)})
                  </span>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-xs font-mono">
                  +{opt.maxDrawdownReductionPct}% Drawdown Cut
                </Badge>
              </div>

              {/* Sharpe & Winrate Shift */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 rounded bg-white/[0.02] border border-white/5">
                  <span className="text-gray-400 text-[10px] block">Sharpe Ratio</span>
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="text-gray-400">{opt.currentSharpe}</span>
                    <ArrowRight className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">{opt.optimizedSharpe}</span>
                  </div>
                </div>

                <div className="p-2 rounded bg-white/[0.02] border border-white/5">
                  <span className="text-gray-400 text-[10px] block">Win Rate</span>
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="text-gray-400">{opt.currentWinRate}%</span>
                    <ArrowRight className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">{opt.optimizedWinRate}%</span>
                  </div>
                </div>
              </div>

              {/* Description & Rule Tweaks */}
              <div className="space-y-1.5 text-xs text-gray-300">
                <span className="font-bold text-white block">{opt.recommendationTitle}</span>
                <p className="text-[11px] text-gray-400 leading-relaxed">{opt.recommendationDescription}</p>

                <div className="space-y-1 pt-1 font-mono text-[11px]">
                  {opt.parameterAdjustments.map((adj, i) => (
                    <div key={i} className="p-1.5 rounded bg-black/40 border border-white/5 flex items-center justify-between">
                      <span className="text-gray-400 text-[10px]">{adj.ruleName}</span>
                      <span className="text-emerald-400 text-[10px]">{adj.after}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => handleApply(opt.strategyId, opt.strategyName)}
                disabled={isApplied}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-xs h-9"
              >
                {isApplied ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-black" />
                    Optimized Rules Active
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 mr-1.5" />
                    Apply Optimization to Playbook (+50 XP)
                  </>
                )}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
