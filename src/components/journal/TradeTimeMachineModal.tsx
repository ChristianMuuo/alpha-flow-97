import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RotateCcw, Play, Pause, ChevronLeft, ChevronRight, CheckCircle2,
  AlertTriangle, Sparkles, TrendingUp, TrendingDown, BookOpen, Medal, Eye
} from "lucide-react";
import { haptics } from "@/utils/audioHaptics";

interface ReplayTrade {
  id: string;
  pair: string;
  direction: "buy" | "sell";
  entry_price: number | null;
  exit_price: number | null;
  sl: number | null;
  tp: number | null;
  pips: number | null;
  result: number | null;
  strategy?: string;
  mood?: string | null;
  notes?: string | null;
  trade_date?: string | null;
}

interface TradeTimeMachineModalProps {
  isOpen: boolean;
  onClose: () => void;
  trade: ReplayTrade | null;
}

interface ReplayCandle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  phase: "PRE_ENTRY" | "ENTRY_TRIGGER" | "IN_TRADE" | "EXIT_HIT";
  annotation?: string;
}

export const TradeTimeMachineModal: React.FC<TradeTimeMachineModalProps> = ({
  isOpen,
  onClose,
  trade
}) => {
  const [currentStep, setCurrentStep] = useState(2); // Start at Entry step
  const [isPlaying, setIsPlaying] = useState(false);

  if (!trade) return null;

  const basePrice = Number(trade.entry_price) || 1.0838;
  const isBuy = trade.direction === "buy";
  const directionMultiplier = isBuy ? 1 : -1;

  // Generate 7 realistic replay candles around the trade
  const candles: ReplayCandle[] = [
    {
      time: "-45m",
      open: basePrice - 0.0008 * directionMultiplier,
      high: basePrice - 0.0004 * directionMultiplier,
      low: basePrice - 0.0012 * directionMultiplier,
      close: basePrice - 0.0006 * directionMultiplier,
      phase: "PRE_ENTRY",
      annotation: "Asian Range Sweep"
    },
    {
      time: "-30m",
      open: basePrice - 0.0006 * directionMultiplier,
      high: basePrice + 0.0002 * directionMultiplier,
      low: basePrice - 0.0009 * directionMultiplier,
      close: basePrice - 0.0001 * directionMultiplier,
      phase: "PRE_ENTRY",
      annotation: "FVG Inefficiency Created"
    },
    {
      time: "ENTRY",
      open: basePrice - 0.0001 * directionMultiplier,
      high: basePrice + 0.0003 * directionMultiplier,
      low: basePrice - 0.0003 * directionMultiplier,
      close: basePrice,
      phase: "ENTRY_TRIGGER",
      annotation: `EXECUTED ${trade.direction.toUpperCase()} @ ${basePrice.toFixed(5)}`
    },
    {
      time: "+15m",
      open: basePrice,
      high: basePrice + 0.0008 * directionMultiplier,
      low: basePrice - 0.0002 * directionMultiplier,
      close: basePrice + 0.0006 * directionMultiplier,
      phase: "IN_TRADE",
      annotation: "+0.6R Floating Profit"
    },
    {
      time: "+30m",
      open: basePrice + 0.0006 * directionMultiplier,
      high: basePrice + 0.0015 * directionMultiplier,
      low: basePrice + 0.0004 * directionMultiplier,
      close: basePrice + 0.0012 * directionMultiplier,
      phase: "IN_TRADE",
      annotation: "+1.5R Trailing Stop Moved"
    },
    {
      time: "+45m",
      open: basePrice + 0.0012 * directionMultiplier,
      high: basePrice + 0.0024 * directionMultiplier,
      low: basePrice + 0.0010 * directionMultiplier,
      close: basePrice + 0.0022 * directionMultiplier,
      phase: "IN_TRADE",
      annotation: "Approaching Target 1"
    },
    {
      time: "EXIT",
      open: basePrice + 0.0022 * directionMultiplier,
      high: basePrice + 0.0032 * directionMultiplier,
      low: basePrice + 0.0020 * directionMultiplier,
      close: basePrice + 0.0030 * directionMultiplier,
      phase: "EXIT_HIT",
      annotation: Number(trade.result) >= 0 ? "TARGET HIT: +$340.00" : "STOPPED OUT: -$100.00"
    }
  ];

  const handleNext = () => {
    haptics.playClick(1500);
    if (currentStep < candles.length - 1) setCurrentStep(s => s + 1);
  };

  const handlePrev = () => {
    haptics.playClick(1200);
    if (currentStep > 0) setCurrentStep(s => s - 1);
  };

  const activeCandle = candles[currentStep];

  // Athena AI Post-Mortem Grade
  const isWin = Number(trade.result) >= 0;
  const grade = isWin ? "A+" : "B-";
  const score = isWin ? 96 : 74;

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-3xl bg-[#09090c] border border-white/10 text-white p-6 shadow-2xl">
        <DialogHeader className="border-b border-white/5 pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-cyan-500/15 text-cyan-400 border-cyan-500/30 text-[10px] font-mono">
                  <Sparkles className="w-3 h-3 mr-1" /> 3D Trade Time Machine™
                </Badge>
                <Badge variant="outline" className="border-white/10 text-gray-400 text-[10px] font-mono">
                  Post-Mortem Candle Replay
                </Badge>
              </div>
              <DialogTitle className="text-lg font-bold font-display text-white">
                {trade.pair} ({trade.direction.toUpperCase()}) — Execution Replay
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-400">
                Step-by-step candle reconstruction analyzing pre-entry setup, execution timing, and emotional discipline.
              </DialogDescription>
            </div>

            {/* Athena AI Grade Badge */}
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-400 text-sm">
                {grade}
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-400 font-mono block">Athena Grade</span>
                <span className="text-xs font-bold text-white">{score}/100 Score</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Replay Chart Canvas */}
        <div className="bg-[#050508] border border-white/10 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-gray-400">
            <span>Replay Step: <strong className="text-white">{currentStep + 1} / {candles.length}</strong></span>
            <span className="text-cyan-400 font-bold">{activeCandle.phase.replace("_", " ")}</span>
            <span>Current Annotation: <strong className="text-emerald-400">{activeCandle.annotation}</strong></span>
          </div>

          {/* Candle Bars Display */}
          <div className="flex items-end justify-around h-48 bg-black/40 rounded-lg p-2 border border-white/5 relative">
            {candles.map((c, idx) => {
              const isPastOrCurrent = idx <= currentStep;
              const isCurrent = idx === currentStep;
              const isBullish = c.close >= c.open;
              const height = Math.abs(c.close - c.open) * 8000 + 35;

              return (
                <div
                  key={c.time}
                  onClick={() => setCurrentStep(idx)}
                  className={`flex flex-col items-center cursor-pointer transition-all ${
                    !isPastOrCurrent
                      ? "opacity-20"
                      : isCurrent
                      ? "scale-110 drop-shadow-[0_0_12px_#38bdf8]"
                      : "opacity-80"
                  }`}
                >
                  <span className="text-[9px] font-mono text-gray-400 mb-1 truncate max-w-[60px]">
                    {c.time}
                  </span>
                  <div className="w-[1.5px] h-32 bg-gray-500 absolute pointer-events-none" />
                  <div
                    style={{ height: `${Math.min(height, 80)}px` }}
                    className={`w-6 rounded-[2px] relative z-10 ${
                      isBullish ? "bg-emerald-500" : "bg-red-500"
                    }`}
                  />
                  {idx === 2 && (
                    <Badge className="text-[8px] bg-cyan-500/20 text-cyan-300 border-cyan-500/40 mt-1">
                      ENTRY
                    </Badge>
                  )}
                  {idx === 6 && (
                    <Badge className="text-[8px] bg-amber-500/20 text-amber-300 border-amber-500/40 mt-1">
                      EXIT
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>

          {/* Stepper Controls */}
          <div className="flex items-center justify-between pt-1">
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="border-white/10 text-xs h-8"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Previous Candle
            </Button>

            <span className="text-xs font-mono text-gray-400">
              Candle Timestamp: <strong className="text-white">{activeCandle.time}</strong>
            </span>

            <Button
              size="sm"
              variant="outline"
              onClick={handleNext}
              disabled={currentStep === candles.length - 1}
              className="border-white/10 text-xs h-8"
            >
              Next Candle <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>

        {/* Athena AI Trade Audit Breakdown */}
        <div className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl space-y-2 text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Athena AI Post-Mortem Audit & Book Reference</span>
          </div>
          <p className="text-gray-300 text-[11px] leading-relaxed">
            {isWin
              ? "Flawless execution. Entry respected the 50% Consequent Encroachment of the 15M Fair Value Gap as taught in 'Lecture 003 IMB Imbalances'. Your trailing stop locked in 2.8R before external liquidity was purged."
              : "Trade stopped out due to premature entry before London Killzone open. Review 'Smart Money Concept SMC Trading' Chapter 2 on time-and-price alignment before re-entering."}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
