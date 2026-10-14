import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Flame, Play, Pause, RotateCcw, Zap, Sparkles, TrendingUp, TrendingDown,
  Layers, Crosshair, ArrowUpDown, ShieldCheck, CheckCircle2, AlertTriangle, BookOpen
} from "lucide-react";
import { haptics } from "@/utils/audioHaptics";
import { toast } from "sonner";

export interface DOMLevel {
  price: number;
  bidVol: number;
  askVol: number;
  profileVol: number;
  isIceberg?: boolean;
}

const BASE_PRICE = 1.08380;
const TICK_SIZE = 0.00010; // 1 pip per row
const NUM_LEVELS = 19;

export const LiquidHeatDOM: React.FC = () => {
  const [symbol, setSymbol] = useState("EUR/USD");
  const [currentPrice, setCurrentPrice] = useState(BASE_PRICE);
  const [isPlaying, setIsPlaying] = useState(true);
  const [viewMode, setViewMode] = useState<"HEATMAP" | "FOOTPRINT">("HEATMAP");
  const [speed, setSpeed] = useState<1 | 2 | 5>(1);
  const [position, setPosition] = useState<{ size: number; entry: number; pnl: number }>({ size: 0, entry: 0, pnl: 0 });
  const [icebergLevel, setIcebergLevel] = useState<number | null>(BASE_PRICE + TICK_SIZE * 4);
  const [cumulativeDelta, setCumulativeDelta] = useState(1480);

  // Canvas references for streaming heatmap
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const priceHistoryRef = useRef<{ time: number; price: number; absorption?: boolean }[]>([]);
  const heatDataRef = useRef<number[][]>([]); // 2D grid of liquidity depth

  // Generate DOM ladder levels around current price
  const domLevels: DOMLevel[] = Array.from({ length: NUM_LEVELS }, (_, i) => {
    const offset = Math.floor(NUM_LEVELS / 2) - i;
    const price = Number((currentPrice + offset * TICK_SIZE).toFixed(5));
    const isAbove = price > currentPrice;
    const isBelow = price < currentPrice;
    const isIceberg = price === icebergLevel;

    // Passive resting order volumes
    const askVol = isAbove ? (isIceberg ? 3850 : Math.floor(Math.abs(Math.sin(offset * 1.5)) * 900 + 150)) : 0;
    const bidVol = isBelow ? (isIceberg ? 4200 : Math.floor(Math.abs(Math.cos(offset * 1.3)) * 850 + 180)) : 0;
    const profileVol = Math.floor(Math.abs(Math.sin(offset * 0.8)) * 4800 + 800);

    return { price, bidVol, askVol, profileVol, isIceberg };
  });

  // Handle price drift and Canvas heatmap animation loop
  useEffect(() => {
    let animId: number;
    let lastTime = Date.now();

    const loop = () => {
      const now = Date.now();
      const dt = now - lastTime;

      if (isPlaying && dt > 250 / speed) {
        lastTime = now;

        // Random walk towards or repelling from iceberg wall
        setCurrentPrice(prev => {
          const delta = (Math.random() - 0.49) * 0.00008;
          let nextP = Number((prev + delta).toFixed(5));

          // If price touches iceberg wall, absorb contracts
          const isAbsorbing = icebergLevel !== null && Math.abs(nextP - icebergLevel) < 0.00005;
          if (isAbsorbing) {
            setCumulativeDelta(d => d + (nextP > prev ? 240 : -240));
            haptics.playClick(2400, 0.01);
          }

          priceHistoryRef.current.push({ time: now, price: nextP, absorption: isAbsorbing });
          if (priceHistoryRef.current.length > 200) {
            priceHistoryRef.current.shift();
          }

          // Update active position PnL if any
          if (position.size !== 0) {
            const pips = (nextP - position.entry) * (position.size > 0 ? 1 : -1) * 10000;
            const pnl = Number((pips * Math.abs(position.size) * 10).toFixed(2));
            setPosition(p => ({ ...p, pnl }));
          }

          return nextP;
        });
      }

      // Draw Heatmap Canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;

          // Background
          ctx.fillStyle = "#07070a";
          ctx.fillRect(0, 0, w, h);

          // Horizontal Liquidity Heat Bands
          const priceRange = TICK_SIZE * (NUM_LEVELS + 4);
          const minP = currentPrice - priceRange / 2;
          const maxP = currentPrice + priceRange / 2;

          domLevels.forEach((lvl) => {
            const y = h - ((lvl.price - minP) / (maxP - minP)) * h;
            const vol = lvl.askVol || lvl.bidVol;
            const intensity = Math.min(1, vol / 3500);

            if (lvl.isIceberg) {
              // Bright hot yellow/white institutional liquidity band
              const grad = ctx.createLinearGradient(0, y - 6, 0, y + 6);
              grad.addColorStop(0, "rgba(250, 204, 21, 0.05)");
              grad.addColorStop(0.5, "rgba(250, 204, 21, 0.85)");
              grad.addColorStop(1, "rgba(250, 204, 21, 0.05)");
              ctx.fillStyle = grad;
              ctx.fillRect(0, y - 6, w, 12);
            } else if (intensity > 0.2) {
              // Heatmap purple/blue/orange glow
              const isAsk = lvl.askVol > 0;
              ctx.fillStyle = isAsk
                ? `rgba(239, 68, 68, ${intensity * 0.45})`
                : `rgba(16, 185, 129, ${intensity * 0.45})`;
              ctx.fillRect(0, y - 4, w, 8);
            }
          });

          // Draw Historical Price Stream Line
          const history = priceHistoryRef.current;
          if (history.length > 1) {
            ctx.beginPath();
            history.forEach((pt, idx) => {
              const x = (idx / (history.length - 1)) * (w - 60);
              const y = h - ((pt.price - minP) / (maxP - minP)) * h;
              if (idx === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);

              // Draw Absorption flare sparks
              if (pt.absorption && idx % 3 === 0) {
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fill();
              }
            });
            ctx.strokeStyle = "#38bdf8";
            ctx.lineWidth = 2.5;
            ctx.shadowColor = "#38bdf8";
            ctx.shadowBlur = 10;
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Current Price Head Marker
            const lastPt = history[history.length - 1];
            const lastY = h - ((lastPt.price - minP) / (maxP - minP)) * h;
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(w - 60, lastY, 4, 0, Math.PI * 2);
            ctx.fill();

            // Right-hand Price Tag
            ctx.fillStyle = "#10b981";
            ctx.fillRect(w - 55, lastY - 9, 52, 18);
            ctx.fillStyle = "#000000";
            ctx.font = "bold 10px monospace";
            ctx.fillText(currentPrice.toFixed(5), w - 50, lastY + 4);
          }
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, speed, currentPrice, icebergLevel, position]);

  // Order Execution Handlers
  const handleMarketBuy = () => {
    haptics.playTrade();
    setPosition({ size: 1, entry: currentPrice, pnl: 0 });
    toast.success(`Bought 1.0 Lot @ ${currentPrice.toFixed(5)}`);
  };

  const handleMarketSell = () => {
    haptics.playTrade();
    setPosition({ size: -1, entry: currentPrice, pnl: 0 });
    toast.success(`Sold 1.0 Lot @ ${currentPrice.toFixed(5)}`);
  };

  const handleFlatten = () => {
    haptics.playClick(1000);
    setPosition({ size: 0, entry: 0, pnl: 0 });
    toast.info("Position flattened / orders closed");
  };

  const handleInjectIceberg = () => {
    haptics.playSuccess();
    const target = Number((currentPrice + TICK_SIZE * 3).toFixed(5));
    setIcebergLevel(target);
    toast.success(`Institutional Iceberg (+3,850 Lots) injected at ${target}!`);
  };

  return (
    <div className="bg-[#08080b] border border-white/10 rounded-2xl p-4 sm:p-6 text-white space-y-4 shadow-2xl relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
            <h3 className="text-xl font-bold font-display text-white tracking-tight">
              LiquidHeat 3D™ <span className="text-xs font-mono text-cyan-400 font-normal">Level-2 DOM & Footprint</span>
            </h3>
          </div>

          <Badge className="bg-cyan-500/15 text-cyan-300 border-cyan-500/30 text-xs font-mono">
            {symbol} • Depth of Market
          </Badge>

          <Badge variant="outline" className="text-[10px] border-white/10 text-gray-400 font-mono">
            Spread: 0.8 Pip
          </Badge>
        </div>

        {/* Play / Pause / Replay Speed */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white/[0.03] border border-white/10 rounded-lg p-0.5">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsPlaying(!isPlaying)}
              className="h-7 px-2.5 text-xs text-gray-300 hover:text-white"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 mr-1 text-amber-400" /> : <Play className="w-3.5 h-3.5 mr-1 text-emerald-400" />}
              {isPlaying ? "Pause" : "Stream"}
            </Button>
            {([1, 2, 5] as const).map(s => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`text-[10px] font-mono px-2 py-1 rounded transition-colors ${speed === s ? "bg-cyan-500 text-black font-bold" : "text-gray-400 hover:text-white"}`}
              >
                {s}x
              </button>
            ))}
          </div>

          <Button
            size="sm"
            onClick={handleInjectIceberg}
            className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs h-8 gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.25)]"
          >
            <Sparkles className="w-3.5 h-3.5" /> Inject Iceberg Wall
          </Button>

          <div className="flex bg-white/[0.04] p-0.5 rounded-lg border border-white/10">
            <button
              onClick={() => setViewMode("HEATMAP")}
              className={`px-3 py-1 text-xs rounded font-medium transition-all ${viewMode === "HEATMAP" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "text-gray-400"}`}
            >
              Heatmap DOM
            </button>
            <button
              onClick={() => setViewMode("FOOTPRINT")}
              className={`px-3 py-1 text-xs rounded font-medium transition-all ${viewMode === "FOOTPRINT" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "text-gray-400"}`}
            >
              Footprint Delta
            </button>
          </div>
        </div>
      </div>

      {/* Main Terminal Body: Split between DOM Price Ladder & Canvas Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Col: Interactive Level-2 DOM Price Ladder (5 cols) */}
        <div className="lg:col-span-5 bg-[#050508] border border-white/10 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-gray-400 border-b border-white/5 pb-2 mb-2">
            <span className="w-16">Profile</span>
            <span className="w-16 text-emerald-400">Bid (L2)</span>
            <span className="w-20 text-center font-bold text-white">Price</span>
            <span className="w-16 text-right text-red-400">Ask (L2)</span>
            <span className="w-12 text-right">Trade</span>
          </div>

          {/* DOM Ladder Rows */}
          <div className="space-y-[2px] font-mono text-xs select-none">
            {domLevels.map((lvl) => {
              const isCurrent = Math.abs(lvl.price - currentPrice) < TICK_SIZE / 2;
              const maxVol = 4000;
              const bidWidth = Math.min(100, (lvl.bidVol / maxVol) * 100);
              const askWidth = Math.min(100, (lvl.askVol / maxVol) * 100);
              const profileWidth = Math.min(100, (lvl.profileVol / 5000) * 100);

              return (
                <div
                  key={lvl.price}
                  className={`flex items-center justify-between p-1 rounded transition-colors relative overflow-hidden ${
                    isCurrent
                      ? "bg-cyan-500/20 border border-cyan-500/50 shadow-[0_0_12px_rgba(56,189,248,0.2)]"
                      : lvl.isIceberg
                      ? "bg-amber-500/15 border border-amber-500/40"
                      : "hover:bg-white/[0.03]"
                  }`}
                >
                  {/* Volume Profile Bar Background */}
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-white/[0.03] pointer-events-none"
                    style={{ width: `${profileWidth}%` }}
                  />

                  {/* Profile Vol Text */}
                  <span className="w-16 text-[10px] text-gray-500 relative z-10">{lvl.profileVol}</span>

                  {/* Bid Bar & Text */}
                  <div className="w-16 relative flex items-center">
                    {lvl.bidVol > 0 && (
                      <div
                        className="absolute right-0 h-4 bg-emerald-500/30 rounded-sm"
                        style={{ width: `${bidWidth}%` }}
                      />
                    )}
                    <span className="relative z-10 text-[11px] text-emerald-400 font-bold ml-1">
                      {lvl.bidVol > 0 ? lvl.bidVol : "-"}
                    </span>
                  </div>

                  {/* Price Cell */}
                  <span
                    className={`w-20 text-center font-bold relative z-10 ${
                      isCurrent
                        ? "text-cyan-300 scale-105"
                        : lvl.isIceberg
                        ? "text-amber-400 underline decoration-amber-500"
                        : "text-gray-300"
                    }`}
                  >
                    {lvl.price.toFixed(5)}
                    {lvl.isIceberg && <span className="text-[9px] text-amber-400 ml-1">🧊</span>}
                  </span>

                  {/* Ask Bar & Text */}
                  <div className="w-16 relative flex items-center justify-end">
                    {lvl.askVol > 0 && (
                      <div
                        className="absolute left-0 h-4 bg-red-500/30 rounded-sm"
                        style={{ width: `${askWidth}%` }}
                      />
                    )}
                    <span className="relative z-10 text-[11px] text-red-400 font-bold mr-1">
                      {lvl.askVol > 0 ? lvl.askVol : "-"}
                    </span>
                  </div>

                  {/* 1-Click Limit Order Button */}
                  <button
                    onClick={() => {
                      haptics.playClick(1500);
                      toast.info(`Limit order set @ ${lvl.price.toFixed(5)}`);
                    }}
                    className="w-12 text-right text-[10px] text-gray-500 hover:text-cyan-400 font-mono transition-colors"
                  >
                    Limit
                  </button>
                </div>
              );
            })}
          </div>

          {/* Quick Execution Toolbar */}
          <div className="pt-3 border-t border-white/5 space-y-2 mt-3">
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleMarketBuy}
                className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs h-9"
              >
                Buy Market
              </Button>
              <Button
                onClick={handleMarketSell}
                className="bg-red-500 hover:bg-red-600 text-white font-bold text-xs h-9"
              >
                Sell Market
              </Button>
            </div>

            <div className="flex items-center justify-between text-xs font-mono bg-white/[0.02] p-2 rounded-lg border border-white/5">
              <div>
                <span className="text-gray-400 text-[10px] block">Position</span>
                <span className={position.size > 0 ? "text-emerald-400 font-bold" : position.size < 0 ? "text-red-400 font-bold" : "text-gray-400"}>
                  {position.size === 0 ? "Flat" : `${position.size > 0 ? "+1.0" : "-1.0"} Lot`}
                </span>
              </div>
              <div>
                <span className="text-gray-400 text-[10px] block">Unrealized P&L</span>
                <span className={`font-bold ${position.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  ${position.pnl >= 0 ? `+${position.pnl}` : position.pnl}
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleFlatten}
                disabled={position.size === 0}
                className="h-7 text-xs border-white/10 hover:bg-white/10"
              >
                Flatten
              </Button>
            </div>
          </div>
        </div>

        {/* Right Col: High-Performance Canvas Liquidity Heatmap (7 cols) */}
        <div className="lg:col-span-7 bg-[#050508] border border-white/10 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-gray-300 font-bold">Real-Time Depth Heatmap</span>
              <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-400 font-mono">
                {icebergLevel ? `Resting Iceberg at ${icebergLevel}` : "Standard Flow"}
              </Badge>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 text-[10px] font-mono text-gray-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-amber-400 inline-block shadow-[0_0_6px_#f59e0b]" /> Iceberg Wall</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-red-500 inline-block" /> Ask Depth</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-500 inline-block" /> Bid Depth</span>
            </div>
          </div>

          {/* Canvas Viewport */}
          <div className="w-full h-80 rounded-lg overflow-hidden border border-white/5 relative bg-[#07070a]">
            {viewMode === "HEATMAP" ? (
              <canvas
                ref={canvasRef}
                width={640}
                height={320}
                className="w-full h-full block"
              />
            ) : (
              /* Footprint Cluster View */
              <div className="w-full h-full p-4 overflow-x-auto flex items-center justify-around font-mono text-xs select-none">
                {[1, 2, 3, 4, 5].map((candleIndex) => (
                  <div key={candleIndex} className="flex flex-col items-center bg-white/[0.02] border border-white/5 p-2 rounded-lg w-28 space-y-1">
                    <span className="text-[10px] text-gray-400">Bar #{candleIndex}</span>
                    <div className="text-[10px] space-y-0.5 w-full">
                      <div className="flex justify-between p-0.5 rounded bg-emerald-500/20 text-emerald-300">
                        <span>420</span><span>×</span><span className="font-bold">1,840</span>
                      </div>
                      <div className="flex justify-between p-0.5 rounded bg-white/[0.02] text-gray-300">
                        <span>310</span><span>×</span><span>340</span>
                      </div>
                      <div className="flex justify-between p-0.5 rounded bg-red-500/20 text-red-300">
                        <span className="font-bold">1,250</span><span>×</span><span>180</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[9px] border-emerald-500/30 text-emerald-400 mt-1">
                      +1.1k Delta
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Orderflow Telemetry */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5 mt-3 text-xs font-mono">
            <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-gray-400 text-[10px] block">Cumulative Delta</span>
              <span className="text-emerald-400 font-bold text-sm">+{cumulativeDelta} Lots</span>
            </div>
            <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-gray-400 text-[10px] block">Point of Control (POC)</span>
              <span className="text-white font-bold text-sm">{(BASE_PRICE - 0.00020).toFixed(5)}</span>
            </div>
            <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-gray-400 text-[10px] block">Absorption State</span>
              <span className="text-amber-400 font-bold text-sm">Active at Highs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Institutional Book Cross-Reference Citation */}
      <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-start gap-3 text-xs">
        <BookOpen className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-gray-300 text-[11px] leading-relaxed">
          <strong className="text-white">Orderflow Knowledge Cross-Reference:</strong> As taught in{" "}
          <span className="text-cyan-400 font-medium">"Volume Profile, Market Profile & Order Flow"</span> (from your 95-book library), when aggressive market orders fail to push past high-intensity yellow resting limit walls, smart money is absorbing inventory. Watch for Delta exhaustion before entering trend continuation.
        </div>
      </div>
    </div>
  );
};
