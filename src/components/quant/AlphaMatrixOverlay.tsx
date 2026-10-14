import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { alphaMatrixForecaster, AlphaMatrixForecast } from "@/services/quant/alphaMatrixForecaster";
import { AlphaMatrixModal } from "./AlphaMatrixModal";
import { Sparkles, TrendingUp, Compass, Target, ShieldCheck, ChevronDown, ChevronUp, Maximize2, Zap } from "lucide-react";
import { haptics } from "@/utils/audioHaptics";

interface AlphaMatrixOverlayProps {
  currentPrice?: number;
  symbol?: string;
}

export const AlphaMatrixOverlay: React.FC<AlphaMatrixOverlayProps> = ({
  currentPrice = 1.0838,
  symbol = "EUR/USD"
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const forecast: AlphaMatrixForecast = alphaMatrixForecaster.calculateForecast(symbol, currentPrice);

  // Geometry for mini SVG fan in the overlay
  const miniSvgW = 480;
  const miniSvgH = 120;
  const cone = forecast.probabilityCone;
  const minP = Math.min(forecast.invalidationLevel, ...cone.map(c => c.p10)) * 0.9995;
  const maxP = Math.max(forecast.targets.t2.price, ...cone.map(c => c.p90)) * 1.0005;
  const pRange = Math.max(1e-5, maxP - minP);

  const getMiniX = (idx: number) => 15 + (idx / (cone.length - 1)) * (miniSvgW - 30);
  const getMiniY = (price: number) => 10 + miniSvgH - 20 - ((price - minP) / pRange) * (miniSvgH - 20);

  const fan90Path = `M ${getMiniX(0)} ${getMiniY(cone[0].p90)} ` +
    cone.slice(1).map((c, i) => `L ${getMiniX(i + 1)} ${getMiniY(c.p90)}`).join(" ") + " " +
    [...cone].reverse().map(c => `L ${getMiniX(c.step)} ${getMiniY(c.p10)}`).join(" ") + " Z";

  const fan75Path = `M ${getMiniX(0)} ${getMiniY(cone[0].p75)} ` +
    cone.slice(1).map((c, i) => `L ${getMiniX(i + 1)} ${getMiniY(c.p75)}`).join(" ") + " " +
    [...cone].reverse().map(c => `L ${getMiniX(c.step)} ${getMiniY(c.p25)}`).join(" ") + " Z";

  const medianPath = cone.map((c, i) => `${i === 0 ? "M" : "L"} ${getMiniX(i)} ${getMiniY(c.p50)}`).join(" ");

  return (
    <>
      <div className="bg-[#08080b]/95 border border-white/10 rounded-xl p-3.5 text-white space-y-3 backdrop-blur-md shadow-xl transition-all">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px] font-mono">
              <Sparkles className="w-3 h-3 mr-1" /> AlphaMatrix™ Quant Forecaster
            </Badge>
            <span className="text-[11px] font-mono text-gray-400">
              Confluence: <strong className="text-emerald-400 font-bold">{forecast.statisticalConfluenceScore}%</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-emerald-400 font-bold">
              +{forecast.expectedValuePerPip} EV/Pip
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                haptics.playClick(1300);
                setIsModalOpen(true);
              }}
              className="h-6 px-1.5 text-[10px] text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 font-mono gap-1"
            >
              <Maximize2 className="w-3 h-3" /> Full Terminal
            </Button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-white transition-colors p-1"
              aria-label="Toggle expansion"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Primary Probabilities Row */}
        <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
          <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
            <span className="text-gray-400 block">Asian High Sweep</span>
            <span className="text-emerald-400 font-bold text-xs">{forecast.asianHighSweepProb}% Odds</span>
          </div>
          <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
            <span className="text-gray-400 block">FVG Fill Retest</span>
            <span className="text-blue-400 font-bold text-xs">{forecast.fvgFillProbability}% Odds</span>
          </div>
          <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
            <span className="text-gray-400 block">Invalidation Level</span>
            <span className="text-red-400 font-bold text-xs">{forecast.invalidationLevel}</span>
          </div>
        </div>

        {/* Mini SVG Probabilistic Quantile Fan */}
        <div className="h-24 w-full bg-[#0a0e14] border border-white/5 rounded-lg overflow-hidden relative">
          <svg viewBox={`0 0 ${miniSvgW} ${miniSvgH}`} preserveAspectRatio="none" className="w-full h-full">
            <defs>
              <linearGradient id="miniFanGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
                <stop offset="50%" stopColor="#10b981" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {/* Grid step lines */}
            {cone.map((c, i) => (
              <line
                key={c.step}
                x1={getMiniX(i)}
                y1={0}
                x2={getMiniX(i)}
                y2={miniSvgH}
                stroke="#1c2636"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
            ))}

            {/* Fan 90 to 10 */}
            <path d={fan90Path} fill="url(#miniFanGrad)" stroke="#06b6d4" strokeWidth="1" strokeOpacity="0.4" />

            {/* Corridor 75 to 25 */}
            <path d={fan75Path} fill="#10b981" fillOpacity="0.25" stroke="#10b981" strokeWidth="1" />

            {/* Median Path */}
            <path d={medianPath} fill="none" stroke="#10b981" strokeWidth="2" />

            {/* Target 1 line */}
            <line
              x1={0}
              y1={getMiniY(forecast.targets.t1.price)}
              x2={miniSvgW}
              y2={getMiniY(forecast.targets.t1.price)}
              stroke="#10b981"
              strokeWidth="1"
              strokeDasharray="3 3"
            />

            {/* Current point node */}
            <circle cx={getMiniX(0)} cy={getMiniY(forecast.currentPrice)} r="3" fill="#ffffff" />
          </svg>

          <div className="absolute bottom-1 right-2 text-[9px] font-mono text-gray-400">
            Target 1: <span className="text-emerald-400 font-bold">{forecast.targets.t1.price}</span> ({forecast.targets.t1.prob}%)
          </div>
        </div>

        {/* Expanded Quantile Horizon Details */}
        {isExpanded && (
          <div className="pt-2 border-t border-white/5 space-y-2">
            <span className="text-[10px] font-mono text-gray-400 block uppercase">
              Quantile Horizon Distribution (15m to 2h Ahead)
            </span>

            <div className="space-y-1.5 font-mono text-[11px]">
              {forecast.probabilityCone.slice(1, 5).map(pt => (
                <div key={pt.step} className="flex items-center justify-between p-1.5 rounded bg-black/40 border border-white/5">
                  <span className="text-gray-400 w-12">{pt.label}</span>
                  <span className="text-red-400/80 text-[10px]">10%tile: {pt.p10}</span>
                  <span className="text-emerald-400 font-bold text-xs">Median: {pt.p50}</span>
                  <span className="text-cyan-400/80 text-[10px]">90%tile: {pt.p90}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 pt-1">
              <span>Hurst Exponent: <strong className="text-cyan-400">H={forecast.hurstExponent}</strong></span>
              <span>Kelly Sizing: <strong className="text-amber-400">{forecast.kellyRecommendedSize}%</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* Global Full Terminal Modal */}
      <AlphaMatrixModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialSymbol={symbol}
        initialPrice={currentPrice}
      />
    </>
  );
};
