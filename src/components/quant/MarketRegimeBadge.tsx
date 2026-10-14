import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { marketRegimeRadar, MarketRegimeInfo } from "@/services/quant/marketRegimeRadar";
import { Activity, ShieldCheck, Zap, Sparkles } from "lucide-react";

export const MarketRegimeBadge: React.FC = () => {
  const [open, setOpen] = useState(false);
  const regime: MarketRegimeInfo = marketRegimeRadar.detectCurrentRegime();
  const allRegimes = marketRegimeRadar.getAllRegimes();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border transition-all cursor-pointer hover:scale-105 ${regime.badgeColor} ${regime.badgeBorder} ${regime.textColor}`}
        title="Click to view Market Regime Radar & Playbook Alignment"
      >
        <Activity className="w-3 h-3 animate-pulse" />
        <span>{regime.title.split(" ")[0]} Regime</span>
        <span className="text-[10px] text-gray-400 opacity-80">({regime.volatilityIndex}% Vol)</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl bg-[#0a0a0d] border border-white/10 text-white p-6 shadow-2xl">
          <DialogHeader className="border-b border-white/5 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px] font-mono">
                <Sparkles className="w-3 h-3 mr-1" /> Unsupervised Volatility & Trend Clustering
              </Badge>
            </div>
            <DialogTitle className="text-lg font-bold font-display text-white">
              Institutional Market Regime Radar
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-400">
              Macro regime classification mapping active market dynamics to statistically optimal setups.
            </DialogDescription>
          </DialogHeader>

          {/* Active Regime Detail */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3 mt-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 font-mono uppercase">Detected State</span>
                <h4 className={`text-base font-bold ${regime.textColor}`}>{regime.title}</h4>
              </div>
              <Badge className={`${regime.badgeColor} ${regime.badgeBorder} ${regime.textColor} text-xs font-mono`}>
                Risk Multiplier: {regime.riskMultiplier}x
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                <span className="text-gray-400 block text-[10px]">Volatility Index</span>
                <span className="text-white font-bold">{regime.volatilityIndex} / 100</span>
              </div>
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                <span className="text-gray-400 block text-[10px]">Trend Strength</span>
                <span className="text-white font-bold">{regime.trendStrength} / 100</span>
              </div>
            </div>

            <div className="text-xs space-y-1">
              <span className="text-gray-400 block font-mono text-[10px]">Recommended Playbook Setups</span>
              <div className="flex flex-wrap gap-1.5">
                {regime.recommendedStrategies.map(s => (
                  <Badge key={s} variant="outline" className="text-xs border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                    ✓ {s}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="text-[11px] text-gray-300 p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
              <strong className="text-emerald-400">Institutional Execution Rule:</strong> {regime.keyRule}
            </div>
          </div>

          {/* 4 Macro Regimes Overview */}
          <div className="space-y-2 mt-2">
            <span className="text-xs font-mono text-gray-400 block">All 4 Institutional Regimes</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {allRegimes.map(r => (
                <div key={r.id} className={`p-2.5 rounded-lg border bg-white/[0.01] ${r.id === regime.id ? "border-emerald-500/50 bg-emerald-500/5" : "border-white/5"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-bold text-xs ${r.textColor}`}>{r.title.split(" ")[0]}</span>
                    {r.id === regime.id && <span className="text-[10px] text-emerald-400 font-mono">● Active</span>}
                  </div>
                  <p className="text-[10px] text-gray-400 leading-tight">{r.riskGuidance}</p>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
