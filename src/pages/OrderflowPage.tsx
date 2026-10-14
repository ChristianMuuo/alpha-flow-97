import React, { useState } from "react";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import { SessionHUD } from "@/components/SessionHUD";
import { LiquidHeatDOM } from "@/components/orderflow/LiquidHeatDOM";
import { AlphaMatrixTerminal } from "@/components/quant/AlphaMatrixTerminal";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, Sparkles, Activity, ShieldCheck, BookOpen, Layers, BarChart2 } from "lucide-react";
import { haptics } from "@/utils/audioHaptics";

export const OrderflowPage: React.FC = () => {
  const [activeView, setActiveView] = useState<"dom" | "alphamatrix" | "split">("alphamatrix");

  return (
    <div className="min-h-screen bg-[#07070a] text-white selection:bg-cyan-500/30">
      <SEO
        title="LiquidHeat & AlphaMatrix™ - Institutional Orderflow & Probabilistic Price Forecasting"
        description="Visualize institutional resting limit orders, iceberg absorption, and AlphaMatrix multi-horizon probabilistic quantile price fans."
      />

      <div className="pt-24 pb-16 px-4 container mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge className="bg-cyan-500/15 text-cyan-400 border-cyan-500/30 text-xs font-mono">
                <Flame className="w-3.5 h-3.5 mr-1 text-amber-400" /> Institutional Quant Desk
              </Badge>
              <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-xs font-mono">
                <Sparkles className="w-3.5 h-3.5 mr-1" /> AlphaMatrix™ Temporal Forecaster
              </Badge>
              <Badge variant="outline" className="text-xs border-white/10 text-gray-400 font-mono">
                Level-2 DOM + GARCH Quantiles
              </Badge>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold font-display text-white tracking-tight">
              Orderflow & <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-400">AlphaMatrix™ Quant</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-2xl mt-1">
              Combine microscopic Level-2 resting limit order depth with macroscopic quantile regression fan forecasts and Monte Carlo path simulations.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-black/60 border border-white/10 rounded-xl p-1 font-mono text-xs">
            <Button
              size="sm"
              variant={activeView === "alphamatrix" ? "default" : "ghost"}
              onClick={() => {
                setActiveView("alphamatrix");
                haptics.playClick(1100);
              }}
              className={`h-8 px-3 text-xs gap-1.5 ${
                activeView === "alphamatrix"
                  ? "bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> AlphaMatrix™ Fan
            </Button>

            <Button
              size="sm"
              variant={activeView === "dom" ? "default" : "ghost"}
              onClick={() => {
                setActiveView("dom");
                haptics.playClick(1000);
              }}
              className={`h-8 px-3 text-xs gap-1.5 ${
                activeView === "dom"
                  ? "bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Flame className="w-3.5 h-3.5" /> LiquidHeat DOM
            </Button>

            <Button
              size="sm"
              variant={activeView === "split" ? "default" : "ghost"}
              onClick={() => {
                setActiveView("split");
                haptics.playClick(1200);
              }}
              className={`h-8 px-3 text-xs gap-1.5 ${
                activeView === "split"
                  ? "bg-purple-500 text-white font-bold shadow-md shadow-purple-500/20"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Split Deck
            </Button>
          </div>
        </div>

        {/* Real-Time Session Overlap HUD & Market Regime Radar */}
        <SessionHUD />

        {/* Active Engine View */}
        {activeView === "alphamatrix" && (
          <div className="space-y-4">
            <AlphaMatrixTerminal initialSymbol="EUR/USD" />
          </div>
        )}

        {activeView === "dom" && (
          <div className="space-y-4">
            <LiquidHeatDOM />
          </div>
        )}

        {activeView === "split" && (
          <div className="space-y-8">
            <AlphaMatrixTerminal initialSymbol="EUR/USD" />
            <LiquidHeatDOM />
          </div>
        )}

        {/* Feature Explanations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <Card className="bg-[#0b0b0e] border border-white/10 text-white p-4 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400">
              <Layers className="w-4 h-4" />
              <h4 className="text-sm font-bold">Passive vs Aggressive Flow</h4>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Price moves when aggressive market orders overwhelm passive resting limit orders. The DOM ladder displays the exact contract depth waiting to absorb price.
            </p>
          </Card>

          <Card className="bg-[#0b0b0e] border border-white/10 text-white p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-400">
              <Sparkles className="w-4 h-4" />
              <h4 className="text-sm font-bold">AlphaMatrix™ Quantile Cones</h4>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Moving beyond lagging indicators, AlphaMatrix maps future price probabilities via fat-tailed GARCH volatility and multi-horizon quantile regression (10th to 90th percentiles).
            </p>
          </Card>

          <Card className="bg-[#0b0b0e] border border-white/10 text-white p-4 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400">
              <Activity className="w-4 h-4" />
              <h4 className="text-sm font-bold">Cumulative Volume Delta (CVD)</h4>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Delta measures aggressive buyers minus aggressive sellers. Divergences between price and CVD reveal exhaustion and imminent trend reversals.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderflowPage;
