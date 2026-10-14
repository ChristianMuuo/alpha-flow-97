import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import {
  TrendingUp, TrendingDown, Play, CheckCircle2, AlertTriangle,
  RotateCcw, Sliders, Volume2, BookmarkPlus, Sparkles, X, Flame
} from "lucide-react";
import { haptics } from "@/utils/audioHaptics";
import { playbookService } from "@/services/playbookService";
import { toast } from "sonner";
import { AlphaMatrixOverlay } from "@/components/quant/AlphaMatrixOverlay";

interface ChartSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookTitle?: string;
  category?: string;
}

interface SimulatedCandle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  annotation?: string;
}

const SAMPLE_SMC_CANDLES: SimulatedCandle[] = [
  { time: "07:00", open: 1.0850, high: 1.0862, low: 1.0845, close: 1.0860, annotation: "Asian High Sweep" },
  { time: "07:15", open: 1.0860, high: 1.0865, low: 1.0840, close: 1.0842, annotation: "Bearish Displacement" },
  { time: "07:30", open: 1.0842, high: 1.0848, low: 1.0825, close: 1.0828, annotation: "FVG Formed" },
  { time: "07:45", open: 1.0828, high: 1.0840, low: 1.0826, close: 1.0838, annotation: "Mitigation Entry" },
  { time: "08:00", open: 1.0838, high: 1.0841, low: 1.0810, close: 1.0812, annotation: "Target 1 Hit" },
  { time: "08:15", open: 1.0812, high: 1.0815, low: 1.0790, close: 1.0795, annotation: "Full TP Smashed" },
];

export const ChartSimulatorModal: React.FC<ChartSimulatorModalProps> = ({
  isOpen,
  onClose,
  bookTitle = "SMC Strategy Master",
  category = "Smart Money Concepts"
}) => {
  const [selectedDirection, setSelectedDirection] = useState<"BUY" | "SELL">("SELL");
  const [activeStep, setActiveStep] = useState(0);
  const [entryPrice, setEntryPrice] = useState("1.0838");
  const [stopLoss, setStopLoss] = useState("1.0852");
  const [takeProfit, setTakeProfit] = useState("1.0795");
  const [simulatedPnL, setSimulatedPnL] = useState<number | null>(null);
  const [tradeExecuted, setTradeExecuted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveStep(3); // Start near entry point
      setTradeExecuted(false);
      setSimulatedPnL(null);
    }
  }, [isOpen]);

  const handleExecute = () => {
    haptics.playExecute();
    setTradeExecuted(true);

    // Calculate simulated outcome based on setup
    const entry = parseFloat(entryPrice) || 1.0838;
    const tp = parseFloat(takeProfit) || 1.0795;
    const sl = parseFloat(stopLoss) || 1.0852;

    const risk = Math.abs(entry - sl);
    const reward = Math.abs(entry - tp);
    const rr = (reward / (risk || 1)).toFixed(1);

    setTimeout(() => {
      haptics.playSuccess();
      const profit = Math.round(parseFloat(rr) * 350);
      setSimulatedPnL(profit);
      playbookService.addXP(50, "Executed Simulated Strategy Trade");
      toast.success(`🎯 Simulated Setup Succeeded! +$${profit} (+${rr}R) | +50 XP`);
    }, 1200);
  };

  const handleSaveToPlaybook = () => {
    haptics.playSuccess();
    playbookService.saveStrategy({
      name: `${category} Live Execution Setup`,
      sourceBookTitle: bookTitle,
      category: (category as any) || "Smart Money Concepts",
      timeframe: "15M / 5M Entry",
      rules: [
        "1. Identify Asian session high/low sweep during London Killzone.",
        "2. Wait for aggressive displacement candle leaving Fair Value Gap.",
        "3. Place limit order at 50% mitigation point.",
        "4. Place SL above invalidation wick and target previous swing low."
      ],
      invalidation: "Candle closes beyond sweep high.",
      targetRR: "1:3.2 Minimum",
      winRateEstimate: 71,
      tags: ["Simulated", "SMC", "Displacement"]
    });
    toast.success("Saved strategy setup to your Trading Playbook!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0a0a0c] border border-white/10 text-white p-0 gap-0 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 via-transparent to-transparent">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs font-mono">
                <Sparkles className="w-3 h-3 mr-1" /> Practice Simulator
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">15M Chart • EUR/USD</span>
            </div>
            <DialogTitle className="text-xl font-bold font-display text-white">
              {bookTitle} — Strategy Backtest Bridge
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-400">
              Interactive sandbox demonstrating the core execution setup taught in this book.
            </DialogDescription>
          </div>

          <Link to="/orderflow" onClick={onClose}>
            <Button size="sm" variant="outline" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 text-xs gap-1.5 h-8">
              <Flame className="w-3.5 h-3.5 text-amber-400" /> Open LiquidHeat DOM →
            </Button>
          </Link>
        </div>

        {/* Content Body */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Canvas Area */}
          <div className="lg:col-span-2 space-y-4">
            <div className="h-72 w-full bg-[#121216] border border-white/10 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
              {/* Background Session Grid */}
              <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />

              {/* Chart Top Indicators */}
              <div className="flex items-center justify-between text-xs z-10">
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400 font-mono font-bold">EURUSD 15M</span>
                  <span className="text-gray-400">O: 1.0838 H: 1.0841 L: 1.0810 C: 1.0812</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-300 border-emerald-500/30">
                    SMC Orderflow Active
                  </Badge>
                </div>
              </div>

              {/* Visualized Candle Bars */}
              <div className="flex items-end justify-around h-44 z-10 py-2">
                {SAMPLE_SMC_CANDLES.map((c, idx) => {
                  const isBullish = c.close >= c.open;
                  const height = Math.abs(c.close - c.open) * 4500 + 35;
                  const isHighlighted = idx === activeStep;

                  return (
                    <div
                      key={c.time}
                      onClick={() => setActiveStep(idx)}
                      className={`flex flex-col items-center cursor-pointer transition-all ${
                        isHighlighted ? "scale-110 drop-shadow-[0_0_12px_#10b981]" : "opacity-80 hover:opacity-100"
                      }`}
                    >
                      {/* Annotation bubble */}
                      <span className="text-[9px] font-mono text-emerald-300 mb-1 max-w-[70px] text-center leading-tight truncate">
                        {c.annotation}
                      </span>
                      {/* High-Low Wick */}
                      <div className="w-[1.5px] h-36 bg-gray-500 absolute pointer-events-none" />
                      {/* Candle Body */}
                      <div
                        style={{ height: `${Math.min(height, 100)}px` }}
                        className={`w-5 rounded-[2px] transition-all relative z-10 ${
                          isBullish ? "bg-emerald-500" : "bg-red-500"
                        }`}
                      />
                      <span className="text-[9px] font-mono text-gray-500 mt-2">{c.time}</span>
                    </div>
                  );
                })}
              </div>

              {/* Setup Overlay Banner */}
              <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-lg p-2.5 flex items-center justify-between text-xs z-10">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-gray-300 font-medium">
                    Trigger: <span className="text-white">{SAMPLE_SMC_CANDLES[activeStep]?.annotation}</span>
                  </span>
                </div>
                <span className="text-emerald-400 font-mono font-bold">R:R 1:3.6 Setup</span>
              </div>
            </div>

            {/* AlphaMatrix Quant Forecaster & Probability Surface */}
            <AlphaMatrixOverlay currentPrice={Number(entryPrice) || 1.0838} symbol="EUR/USD" />

            {/* Strategy Step Explanation */}
            <div className="bg-[#121216]/60 border border-white/10 rounded-xl p-4 space-y-2">
              <h5 className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" /> Institutional Execution Rules
              </h5>
              <p className="text-xs text-gray-300 leading-relaxed">
                As detailed in <span className="text-white font-medium">"{bookTitle}"</span>, wait for the liquidity sweep candle to close, then observe the fair value gap retest. Never enter market orders prematurely before the 50% equilibrium box is tagged.
              </p>
            </div>
          </div>

          {/* Trade Execution Controller */}
          <div className="bg-[#121216] border border-white/10 rounded-xl p-5 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-white">Execution Terminal</h4>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant={selectedDirection === "BUY" ? "default" : "outline"}
                    onClick={() => setSelectedDirection("BUY")}
                    className={`h-7 px-3 text-xs ${
                      selectedDirection === "BUY" ? "bg-emerald-500 text-black font-bold" : "border-white/10 text-gray-400"
                    }`}
                  >
                    Buy
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedDirection === "SELL" ? "default" : "outline"}
                    onClick={() => setSelectedDirection("SELL")}
                    className={`h-7 px-3 text-xs ${
                      selectedDirection === "SELL" ? "bg-red-500 text-white font-bold" : "border-white/10 text-gray-400"
                    }`}
                  >
                    Sell
                  </Button>
                </div>
              </div>

              {/* Order Inputs */}
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <label className="text-[10px] text-gray-400 uppercase">Limit Entry Price</label>
                  <Input
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(e.target.value)}
                    className="h-8 bg-black/50 border-white/15 text-emerald-400 font-mono text-xs mt-1"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 uppercase">Stop Loss (Invalidation)</label>
                  <Input
                    value={stopLoss}
                    onChange={(e) => setStopLoss(e.target.value)}
                    className="h-8 bg-black/50 border-white/15 text-red-400 font-mono text-xs mt-1"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 uppercase">Take Profit (Target Pool)</label>
                  <Input
                    value={takeProfit}
                    onChange={(e) => setTakeProfit(e.target.value)}
                    className="h-8 bg-black/50 border-white/15 text-emerald-400 font-mono text-xs mt-1"
                  />
                </div>
              </div>

              {/* Simulated Result Box */}
              {tradeExecuted && (
                <div className="bg-black/60 border border-emerald-500/30 rounded-lg p-3 text-center space-y-1 animate-in fade-in">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">Simulation Outcome</span>
                  <div className="text-xl font-bold font-mono text-emerald-400">
                    {simulatedPnL !== null ? `+$${simulatedPnL}.00` : "Simulating Tick..."}
                  </div>
                  <span className="text-[11px] text-emerald-300">Target Reached • +50 Trader XP</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <Button
                onClick={handleExecute}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold h-9 text-xs shadow-lg shadow-emerald-500/20"
              >
                <Play className="w-3.5 h-3.5 mr-1.5 fill-current" /> Execute Simulated Trade
              </Button>

              <Button
                variant="outline"
                onClick={handleSaveToPlaybook}
                className="w-full border-white/10 hover:bg-white/5 text-gray-300 text-xs h-8"
              >
                <BookmarkPlus className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> Save to My Playbook
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
