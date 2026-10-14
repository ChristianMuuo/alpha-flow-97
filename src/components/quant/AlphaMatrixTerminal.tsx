import React, { useState, useMemo, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  alphaMatrixForecaster,
  AlphaMatrixForecast,
  AlphaMatrixRegime,
  OrderflowSkew,
  TimeframeHorizon,
  SUPPORTED_PAIRS
} from "@/services/quant/alphaMatrixForecaster";
import { haptics } from "@/utils/audioHaptics";
import { playbookService } from "@/services/playbookService";
import { toast } from "sonner";
import {
  Sparkles, TrendingUp, TrendingDown, Target, ShieldCheck, Compass,
  RefreshCw, BookmarkPlus, Zap, Activity, Info, BarChart2,
  Sliders, ArrowUpRight, Crosshair, CheckCircle2, AlertTriangle, Layers
} from "lucide-react";

interface AlphaMatrixTerminalProps {
  initialSymbol?: string;
  initialPrice?: number;
  compact?: boolean;
  onTradeSimulate?: (setup: { symbol: string; entry: number; sl: number; tp: number; rr: number }) => void;
}

export const AlphaMatrixTerminal: React.FC<AlphaMatrixTerminalProps> = ({
  initialSymbol = "EUR/USD",
  initialPrice,
  compact = false,
  onTradeSimulate
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState(initialSymbol);
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeHorizon>("15M");
  const [selectedRegime, setSelectedRegime] = useState<AlphaMatrixRegime>("LONDON_KILLZONE");
  const [selectedSkew, setSelectedSkew] = useState<OrderflowSkew>("BEARISH");
  const [showMonteCarlo, setShowMonteCarlo] = useState(true);
  const [hoveredStepIndex, setHoveredStepIndex] = useState<number | null>(null);
  const [simSeed, setSimSeed] = useState(42);
  const [isSimulating, setIsSimulating] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Calculate live forecast using the quant engine
  const forecast: AlphaMatrixForecast = useMemo(() => {
    return alphaMatrixForecaster.calculateForecast(
      selectedSymbol,
      initialPrice,
      {
        timeframe: selectedTimeframe,
        regime: selectedRegime,
        orderflowSkew: selectedSkew,
        seed: simSeed
      }
    );
  }, [selectedSymbol, initialPrice, selectedTimeframe, selectedRegime, selectedSkew, simSeed]);

  const handleReSeed = () => {
    haptics.playClick(1400);
    setIsSimulating(true);
    setTimeout(() => {
      setSimSeed(prev => prev + 17);
      setIsSimulating(false);
      haptics.playSuccess();
    }, 250);
  };

  const handleSaveToPlaybook = () => {
    haptics.playSuccess();
    playbookService.saveStrategy({
      name: `AlphaMatrix™ ${forecast.symbol} ${forecast.timeframe} Quant Forecast`,
      sourceBookTitle: "AlphaMatrix Probabilistic Physics",
      category: "Smart Money Concepts",
      timeframe: `${forecast.timeframe} Horizon`,
      rules: [
        `1. Volatility Regime: ${forecast.regime.replace(/_/g, " ")}.`,
        `2. Orderflow Cumulative Delta: ${forecast.orderflowSkew} bias.`,
        `3. Institutional Confluence Score: ${forecast.statisticalConfluenceScore}% with Hurst Exponent H=${forecast.hurstExponent}.`,
        `4. Primary Target: ${forecast.targets.t1.price} (${forecast.targets.t1.prob}% probability). Invalidation at ${forecast.invalidationLevel}.`
      ],
      invalidation: `Price breaks past ${forecast.invalidationLevel}`,
      targetRR: `1:${(forecast.targets.t2.distancePips / (Math.abs(forecast.currentPrice - forecast.invalidationLevel) / (SUPPORTED_PAIRS[selectedSymbol]?.pipSize || 0.0001))).toFixed(1)}`,
      winRateEstimate: forecast.targets.t1.prob,
      tags: ["AlphaMatrix", "QuantileRegression", forecast.symbol]
    });
    toast.success(`Saved ${forecast.symbol} Quant Forecast to your Trading Playbook!`);
  };

  // SVG Chart Geometry
  const svgWidth = 820;
  const svgHeight = 320;
  const padLeft = 45;
  const padRight = 85;
  const padTop = 30;
  const padBottom = 40;

  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;

  // Calculate Y min and max across all quantile points and targets
  const allPrices = useMemo(() => {
    const prices: number[] = [forecast.currentPrice, forecast.invalidationLevel, forecast.targets.t1.price, forecast.targets.t2.price];
    forecast.probabilityCone.forEach(pt => {
      prices.push(pt.p10, pt.p90, pt.p50);
    });
    if (showMonteCarlo) {
      forecast.monteCarloPaths.forEach(p => {
        p.points.forEach(pt => prices.push(pt.price));
      });
    }
    return prices;
  }, [forecast, showMonteCarlo]);

  const minP = useMemo(() => Math.min(...allPrices) * 0.9992, [allPrices]);
  const maxP = useMemo(() => Math.max(...allPrices) * 1.0008, [allPrices]);
  const priceRange = Math.max(1e-5, maxP - minP);

  const getX = (stepIndex: number) => {
    const totalSteps = forecast.probabilityCone.length - 1;
    return padLeft + (stepIndex / (totalSteps || 1)) * chartW;
  };

  const getY = (price: number) => {
    return padTop + chartH - ((price - minP) / priceRange) * chartH;
  };

  // Generate smooth polygon paths for quantile cones
  const cone90to10Path = useMemo(() => {
    const cone = forecast.probabilityCone;
    if (cone.length < 2) return "";

    let topPath = `M ${getX(0)} ${getY(cone[0].p90)}`;
    for (let i = 1; i < cone.length; i++) {
      topPath += ` L ${getX(i)} ${getY(cone[i].p90)}`;
    }

    let bottomPath = "";
    for (let i = cone.length - 1; i >= 0; i--) {
      bottomPath += ` L ${getX(i)} ${getY(cone[i].p10)}`;
    }

    return `${topPath} ${bottomPath} Z`;
  }, [forecast, minP, priceRange]);

  const corridor75to25Path = useMemo(() => {
    const cone = forecast.probabilityCone;
    if (cone.length < 2) return "";

    let topPath = `M ${getX(0)} ${getY(cone[0].p75)}`;
    for (let i = 1; i < cone.length; i++) {
      topPath += ` L ${getX(i)} ${getY(cone[i].p75)}`;
    }

    let bottomPath = "";
    for (let i = cone.length - 1; i >= 0; i--) {
      bottomPath += ` L ${getX(i)} ${getY(cone[i].p25)}`;
    }

    return `${topPath} ${bottomPath} Z`;
  }, [forecast, minP, priceRange]);

  const medianPath = useMemo(() => {
    const cone = forecast.probabilityCone;
    return cone.map((pt, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(pt.p50)}`).join(" ");
  }, [forecast, minP, priceRange]);

  // Handle SVG Mouse Move for Scrubber
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const chartX = (clientX / rect.width) * svgWidth;

    const totalSteps = forecast.probabilityCone.length - 1;
    let closestIdx = 0;
    let minDiff = Infinity;

    forecast.probabilityCone.forEach((_, idx) => {
      const stepX = getX(idx);
      const diff = Math.abs(chartX - stepX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });

    setHoveredStepIndex(closestIdx);
  };

  const activeHoverPoint = hoveredStepIndex !== null ? forecast.probabilityCone[hoveredStepIndex] : null;

  return (
    <div className="bg-[#09090d] border border-white/10 rounded-2xl p-4 md:p-6 text-white space-y-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Terminal Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-xs font-mono px-2.5 py-0.5">
              <Sparkles className="w-3.5 h-3.5 mr-1" /> AlphaMatrix™ Quant Forecaster
            </Badge>
            <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-400 font-mono">
              Temporal Fusion Quantiles
            </Badge>
            <Badge variant="outline" className="text-xs border-white/10 text-gray-400 font-mono">
              Fat-Tailed GARCH Vol
            </Badge>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <h2 className="text-2xl md:text-3xl font-extrabold font-display text-white tracking-tight">
              {forecast.symbol} Probabilistic Fan
            </h2>
            <div className="flex items-center gap-1.5 bg-black/60 border border-white/10 rounded-lg px-2.5 py-1 font-mono text-sm">
              <span className="text-gray-400 text-xs">Spot:</span>
              <span className="text-emerald-400 font-bold">{forecast.currentPrice}</span>
            </div>
          </div>
        </div>

        {/* Action Controls & Playbook Export */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleReSeed}
            disabled={isSimulating}
            className="border-white/10 text-gray-300 hover:text-white hover:bg-white/5 text-xs h-9 gap-1.5 font-mono"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? "animate-spin text-emerald-400" : ""}`} />
            Re-Simulate (Seed #{simSeed})
          </Button>

          <Button
            size="sm"
            variant="default"
            onClick={handleSaveToPlaybook}
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs h-9 gap-1.5 shadow-lg shadow-emerald-500/20"
          >
            <BookmarkPlus className="w-3.5 h-3.5" /> Save to Playbook
          </Button>
        </div>
      </div>

      {/* Selectors Bar: Pair, Timeframe, Regime, Skew */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Pair Selector */}
        <div className="bg-[#121217] border border-white/5 rounded-xl p-2.5 space-y-1.5">
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Target Instrument</span>
          <div className="flex flex-wrap gap-1">
            {Object.keys(SUPPORTED_PAIRS).map(pair => (
              <button
                key={pair}
                onClick={() => {
                  setSelectedSymbol(pair);
                  haptics.playClick(1200);
                }}
                className={`text-xs font-mono px-2 py-1 rounded transition-all ${
                  selectedSymbol === pair
                    ? "bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20"
                    : "bg-black/40 text-gray-400 hover:text-white hover:bg-white/5 border border-white/5"
                }`}
              >
                {pair}
              </button>
            ))}
          </div>
        </div>

        {/* Timeframe Horizon */}
        <div className="bg-[#121217] border border-white/5 rounded-xl p-2.5 space-y-1.5">
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Forecast Horizon</span>
          <div className="grid grid-cols-4 gap-1">
            {(["15M", "1H", "4H", "1D"] as TimeframeHorizon[]).map(tf => (
              <button
                key={tf}
                onClick={() => {
                  setSelectedTimeframe(tf);
                  haptics.playClick(1000);
                }}
                className={`text-xs font-mono py-1 rounded text-center transition-all ${
                  selectedTimeframe === tf
                    ? "bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20"
                    : "bg-black/40 text-gray-400 hover:text-white hover:bg-white/5 border border-white/5"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Volatility Regime */}
        <div className="bg-[#121217] border border-white/5 rounded-xl p-2.5 space-y-1.5">
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Session GARCH Regime</span>
          <div className="grid grid-cols-2 gap-1 text-[11px] font-mono">
            {[
              { id: "ASIAN_RANGE", label: "Asian (Tight)" },
              { id: "LONDON_KILLZONE", label: "London (Sweep)" },
              { id: "NY_OVERLAP", label: "NY Overlap (Max)" },
              { id: "FOMC_SHOCK", label: "Shock (Kurtosis)" },
            ].map(reg => (
              <button
                key={reg.id}
                onClick={() => {
                  setSelectedRegime(reg.id as AlphaMatrixRegime);
                  haptics.playClick(1100);
                }}
                className={`py-1 px-1.5 rounded truncate transition-all text-left ${
                  selectedRegime === reg.id
                    ? "bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20"
                    : "bg-black/40 text-gray-400 hover:text-white hover:bg-white/5 border border-white/5"
                }`}
              >
                {reg.label}
              </button>
            ))}
          </div>
        </div>

        {/* Orderflow Skew */}
        <div className="bg-[#121217] border border-white/5 rounded-xl p-2.5 space-y-1.5">
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Institutional CVD Bias</span>
          <div className="grid grid-cols-3 gap-1">
            {[
              { id: "BULLISH", label: "+CVD Absorption", color: "bg-emerald-500 text-black font-bold" },
              { id: "NEUTRAL", label: "0 Equilibrium", color: "bg-blue-500 text-white font-bold" },
              { id: "BEARISH", label: "-CVD Distribution", color: "bg-red-500 text-white font-bold" },
            ].map(skew => (
              <button
                key={skew.id}
                onClick={() => {
                  setSelectedSkew(skew.id as OrderflowSkew);
                  haptics.playClick(900);
                }}
                className={`text-[10px] font-mono py-1 rounded text-center truncate transition-all ${
                  selectedSkew === skew.id
                    ? skew.color
                    : "bg-black/40 text-gray-400 hover:text-white hover:bg-white/5 border border-white/5"
                }`}
              >
                {skew.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-gray-400 px-1">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              Median Path (p50)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400/50" />
              IQR Corridor (25% - 75%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/20" />
              Quantile Fan (10% - 90%)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMonteCarlo(!showMonteCarlo)}
              className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
                showMonteCarlo
                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                  : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
              }`}
            >
              18 Monte Carlo Paths: {showMonteCarlo ? "ON" : "OFF"}
            </button>
          </div>
        </div>

        {/* SVG Interactive Canvas */}
        <div className="h-80 w-full bg-[#0a0e14] border border-white/10 rounded-2xl relative overflow-hidden group select-none">
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#1c2636_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

          <svg
            ref={svgRef}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            preserveAspectRatio="none"
            className="w-full h-full cursor-crosshair relative z-10"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredStepIndex(null)}
          >
            <defs>
              <linearGradient id="fan90Grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.22" />
                <stop offset="50%" stopColor="#10b981" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.18" />
              </linearGradient>

              <linearGradient id="corridor75Grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.25" />
              </linearGradient>

              <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Horizontal Grid Price Lines */}
            {[0.2, 0.4, 0.6, 0.8].map((pct, i) => {
              const pVal = minP + pct * priceRange;
              const yPos = getY(pVal);
              return (
                <g key={i}>
                  <line
                    x1={padLeft}
                    y1={yPos}
                    x2={svgWidth - padRight}
                    y2={yPos}
                    stroke="#1c2636"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={svgWidth - padRight + 6}
                    y={yPos + 3}
                    fill="#64748b"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    {pVal.toFixed(SUPPORTED_PAIRS[selectedSymbol]?.decimals || 5)}
                  </text>
                </g>
              );
            })}

            {/* Vertical Interval Step Guidelines */}
            {forecast.probabilityCone.map((pt, idx) => {
              const xPos = getX(idx);
              return (
                <g key={pt.step}>
                  <line
                    x1={xPos}
                    y1={padTop}
                    x2={xPos}
                    y2={svgHeight - padBottom}
                    stroke="#141a24"
                    strokeWidth="1"
                  />
                  <text
                    x={xPos}
                    y={svgHeight - padBottom + 16}
                    fill="#94a3b8"
                    fontSize="10"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {pt.label}
                  </text>
                </g>
              );
            })}

            {/* 10th to 90th Percentile Fan Area */}
            {cone90to10Path && (
              <path
                d={cone90to10Path}
                fill="url(#fan90Grad)"
                stroke="#06b6d4"
                strokeWidth="1"
                strokeOpacity="0.4"
              />
            )}

            {/* 25th to 75th Percentile Interquartile Corridor Area */}
            {corridor75to25Path && (
              <path
                d={corridor75to25Path}
                fill="url(#corridor75Grad)"
                stroke="#10b981"
                strokeWidth="1.2"
                strokeOpacity="0.6"
              />
            )}

            {/* Monte Carlo 18 Stochastic Random Walk Trajectories */}
            {showMonteCarlo &&
              forecast.monteCarloPaths.map(mc => {
                const pointsStr = mc.points
                  .map((p, idx) => `${idx === 0 ? "M" : "L"} ${getX(p.step)} ${getY(p.price)}`)
                  .join(" ");

                return (
                  <path
                    key={mc.id}
                    d={pointsStr}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="1"
                    strokeOpacity="0.22"
                  />
                );
              })}

            {/* 50th Percentile Median Path Line */}
            {medianPath && (
              <path
                d={medianPath}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                filter="url(#glowEffect)"
              />
            )}

            {/* Target 1 Reference Line */}
            <line
              x1={padLeft}
              y1={getY(forecast.targets.t1.price)}
              x2={svgWidth - padRight}
              y2={getY(forecast.targets.t1.price)}
              stroke="#10b981"
              strokeWidth="1"
              strokeDasharray="4 4"
              strokeOpacity="0.7"
            />

            {/* Target 2 Reference Line */}
            <line
              x1={padLeft}
              y1={getY(forecast.targets.t2.price)}
              x2={svgWidth - padRight}
              y2={getY(forecast.targets.t2.price)}
              stroke="#06b6d4"
              strokeWidth="1"
              strokeDasharray="4 4"
              strokeOpacity="0.7"
            />

            {/* Invalidation Stop Loss Reference Line */}
            <line
              x1={padLeft}
              y1={getY(forecast.invalidationLevel)}
              x2={svgWidth - padRight}
              y2={getY(forecast.invalidationLevel)}
              stroke="#ef4444"
              strokeWidth="1"
              strokeDasharray="4 4"
              strokeOpacity="0.7"
            />

            {/* Target Badge Labels on Right Edge */}
            <g transform={`translate(${svgWidth - padRight + 4}, ${getY(forecast.targets.t1.price)})`}>
              <text fill="#10b981" fontSize="9" fontWeight="bold" fontFamily="monospace">
                T1: {forecast.targets.t1.price}
              </text>
            </g>
            <g transform={`translate(${svgWidth - padRight + 4}, ${getY(forecast.targets.t2.price)})`}>
              <text fill="#06b6d4" fontSize="9" fontWeight="bold" fontFamily="monospace">
                T2: {forecast.targets.t2.price}
              </text>
            </g>
            <g transform={`translate(${svgWidth - padRight + 4}, ${getY(forecast.invalidationLevel)})`}>
              <text fill="#ef4444" fontSize="9" fontWeight="bold" fontFamily="monospace">
                SL: {forecast.invalidationLevel}
              </text>
            </g>

            {/* Median Path Step Nodes */}
            {forecast.probabilityCone.map((pt, idx) => {
              const xPos = getX(idx);
              const yPos = getY(pt.p50);
              const isSelected = hoveredStepIndex === idx;

              return (
                <circle
                  key={pt.step}
                  cx={xPos}
                  cy={yPos}
                  r={isSelected ? 6 : 3.5}
                  fill={isSelected ? "#ffffff" : "#10b981"}
                  stroke="#09090d"
                  strokeWidth="2"
                  className="transition-all duration-150"
                />
              );
            })}

            {/* Interactive Vertical Scrubber Scanner Reticle */}
            {hoveredStepIndex !== null && (
              <g>
                <line
                  x1={getX(hoveredStepIndex)}
                  y1={padTop}
                  x2={getX(hoveredStepIndex)}
                  y2={svgHeight - padBottom}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                  strokeOpacity="0.8"
                />
              </g>
            )}
          </svg>

          {/* Floating Live Scrubber HUD Card */}
          {activeHoverPoint && (
            <div
              style={{
                left: `${Math.min(72, Math.max(8, (getX(hoveredStepIndex!) / svgWidth) * 100))}%`,
                top: "16px"
              }}
              className="absolute z-20 pointer-events-none transform -translate-x-1/2 bg-black/90 border border-white/20 rounded-xl p-3 shadow-2xl backdrop-blur-md font-mono text-xs w-64 space-y-1.5 transition-all"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-1">
                <span className="font-bold text-emerald-400">{activeHoverPoint.label} Projection</span>
                <span className="text-[10px] text-gray-400">Step #{activeHoverPoint.step}</span>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[11px]">
                <div>
                  <span className="text-gray-400 block text-[9px]">90% Expansion</span>
                  <span className="text-cyan-400 font-bold">{activeHoverPoint.p90}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[9px]">75% Premium Target</span>
                  <span className="text-emerald-400 font-bold">{activeHoverPoint.p75}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[9px]">50% Median (POC)</span>
                  <span className="text-white font-bold">{activeHoverPoint.p50}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[9px]">25% Discount Support</span>
                  <span className="text-blue-400 font-bold">{activeHoverPoint.p25}</span>
                </div>
              </div>
              <div className="border-t border-white/10 pt-1 flex items-center justify-between text-[10px]">
                <span className="text-red-400">10% Liquidity Invalidation:</span>
                <span className="text-red-400 font-bold">{activeHoverPoint.p10}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quantitative Institutional Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Confluence Score */}
        <Card className="bg-[#121217] border border-white/10 text-white p-3 space-y-1">
          <div className="flex items-center justify-between text-gray-400 text-[10px] font-mono">
            <span>Confluence Score</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            {forecast.statisticalConfluenceScore}%
          </div>
          <span className="text-[9px] text-gray-500 font-mono block">Orderflow + Market Structure</span>
        </Card>

        {/* Expected Value per Pip */}
        <Card className="bg-[#121217] border border-white/10 text-white p-3 space-y-1">
          <div className="flex items-center justify-between text-gray-400 text-[10px] font-mono">
            <span>Statistical EV</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-400">
            +{forecast.expectedValuePerPip} EV
          </div>
          <span className="text-[9px] text-gray-500 font-mono block">Per unit risked</span>
        </Card>

        {/* Hurst Exponent */}
        <Card className="bg-[#121217] border border-white/10 text-white p-3 space-y-1">
          <div className="flex items-center justify-between text-gray-400 text-[10px] font-mono">
            <span>Hurst Exponent (H)</span>
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-cyan-400">
            H = {forecast.hurstExponent}
          </div>
          <span className="text-[9px] text-gray-500 font-mono block">
            {forecast.hurstExponent > 0.5 ? "Persistent Drift" : "Mean-Reverting"}
          </span>
        </Card>

        {/* GARCH Volatility */}
        <Card className="bg-[#121217] border border-white/10 text-white p-3 space-y-1">
          <div className="flex items-center justify-between text-gray-400 text-[10px] font-mono">
            <span>GARCH Volatility</span>
            <BarChart2 className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xl font-bold font-mono text-purple-400">
            {forecast.garchVolatility}%
          </div>
          <span className="text-[9px] text-gray-500 font-mono block">Fat-tail cluster</span>
        </Card>

        {/* Kelly Sizing */}
        <Card className="bg-[#121217] border border-white/10 text-white p-3 space-y-1">
          <div className="flex items-center justify-between text-gray-400 text-[10px] font-mono">
            <span>Kelly Sizing</span>
            <Target className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-bold font-mono text-blue-400">
            {forecast.kellyRecommendedSize}%
          </div>
          <span className="text-[9px] text-gray-500 font-mono block">Fractional allocation</span>
        </Card>

        {/* Asian Sweep Odds */}
        <Card className="bg-[#121217] border border-white/10 text-white p-3 space-y-1">
          <div className="flex items-center justify-between text-gray-400 text-[10px] font-mono">
            <span>Asian High Sweep</span>
            <Crosshair className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div className="text-xl font-bold font-mono text-red-400">
            {forecast.asianHighSweepProb}%
          </div>
          <span className="text-[9px] text-gray-500 font-mono block">London purge odds</span>
        </Card>
      </div>

      {/* Target Breakdown & Execution Blueprint */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Target 1 Card */}
        <div className="bg-[#121217] border border-emerald-500/20 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-emerald-400 font-bold">Primary Target 1</span>
            <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px] font-mono">
              {forecast.targets.t1.prob}% Probability
            </Badge>
          </div>
          <div className="text-xl font-mono font-bold text-white">
            {forecast.targets.t1.price}
          </div>
          <p className="text-[11px] text-gray-400 font-mono">
            {forecast.targets.t1.label} • {forecast.targets.t1.distancePips} Pips
          </p>
        </div>

        {/* Target 2 Card */}
        <div className="bg-[#121217] border border-cyan-500/20 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-cyan-400 font-bold">Expansion Target 2</span>
            <Badge className="bg-cyan-500/15 text-cyan-400 border-cyan-500/30 text-[10px] font-mono">
              {forecast.targets.t2.prob}% Probability
            </Badge>
          </div>
          <div className="text-xl font-mono font-bold text-white">
            {forecast.targets.t2.price}
          </div>
          <p className="text-[11px] text-gray-400 font-mono">
            {forecast.targets.t2.label} • {forecast.targets.t2.distancePips} Pips
          </p>
        </div>

        {/* Invalidation Card */}
        <div className="bg-[#121217] border border-red-500/20 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-red-400 font-bold">Invalidation Threshold (SL)</span>
            <Badge className="bg-red-500/15 text-red-400 border-red-500/30 text-[10px] font-mono">
              10% Quantile Cut
            </Badge>
          </div>
          <div className="text-xl font-mono font-bold text-white">
            {forecast.invalidationLevel}
          </div>
          <p className="text-[11px] text-gray-400 font-mono">
            Structural invalidation beyond liquidity sweep wick
          </p>
        </div>
      </div>
    </div>
  );
};
