import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ShieldAlert, Volume2, Sparkles, AlertTriangle, CheckCircle2,
  Brain, Clock, RefreshCw
} from "lucide-react";
import { neuroSentinel, TiltEvaluation } from "@/services/quant/neuroTraderSentinel";
import { haptics } from "@/utils/audioHaptics";

interface NeuroSentinelWidgetProps {
  currentFormTrade?: any;
  recentTrades?: any[];
}

export const NeuroSentinelWidget: React.FC<NeuroSentinelWidgetProps> = ({
  currentFormTrade = {},
  recentTrades = []
}) => {
  const [evaluation, setEvaluation] = useState<TiltEvaluation>(
    neuroSentinel.evaluateBehavior(currentFormTrade, recentTrades)
  );

  useEffect(() => {
    setEvaluation(neuroSentinel.evaluateBehavior(currentFormTrade, recentTrades));
  }, [currentFormTrade, recentTrades]);

  const handleVoiceCoaching = () => {
    haptics.playClick(1600);
    neuroSentinel.playVoiceAlert(evaluation.interventionText);
  };

  const isCritical = evaluation.status === "CRITICAL_CIRCUIT_BREAKER";
  const isElevated = evaluation.status === "ELEVATED_TILT";

  return (
    <Card className="bg-[#0b0b0e] border border-white/10 text-white overflow-hidden relative shadow-xl">
      <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none ${isCritical ? "bg-red-500/10" : isElevated ? "bg-amber-500/10" : "bg-emerald-500/10"}`} />

      <CardHeader className="p-4 pb-2 border-b border-white/5 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className={`w-4 h-4 ${isCritical ? "text-red-400" : isElevated ? "text-amber-400" : "text-emerald-400"}`} />
          <CardTitle className="text-sm font-bold font-display text-white">
            NeuroTrader Sentinel™ <span className="text-[10px] text-gray-400 font-mono font-normal">Behavioral Tilt Radar</span>
          </CardTitle>
        </div>

        <div className="flex items-center gap-2">
          <Badge className={`text-[10px] font-mono ${
            isCritical
              ? "bg-red-500/20 text-red-400 border-red-500/40"
              : isElevated
              ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
              : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
          }`}>
            {evaluation.status.replace("_", " ")}
          </Badge>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleVoiceCoaching}
            className="h-7 w-7 text-gray-400 hover:text-emerald-400"
            title="Hear Athena AI Behavioral Briefing"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {/* Tilt Score Bar & Probability */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-gray-400">Tilt Risk Index</span>
            <span className={`font-bold ${isCritical ? "text-red-400" : isElevated ? "text-amber-400" : "text-emerald-400"}`}>
              {evaluation.tiltRiskScore}%
            </span>
          </div>
          <Progress
            value={evaluation.tiltRiskScore}
            className={`h-2 bg-white/5 ${
              isCritical
                ? "[&>div]:bg-red-500"
                : isElevated
                ? "[&>div]:bg-amber-500"
                : "[&>div]:bg-emerald-500"
            }`}
          />
        </div>

        {/* Behavioral Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
          <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
            <span className="text-gray-400 block">Loss Prob</span>
            <span className={`font-bold ${evaluation.empiricalLossProbability > 50 ? "text-red-400" : "text-emerald-400"}`}>
              {evaluation.empiricalLossProbability}%
            </span>
          </div>
          <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
            <span className="text-gray-400 block">Sizing Shift</span>
            <span className="text-white font-bold">{evaluation.factors.sizingVelocityScore > 0 ? "Accelerating" : "Baseline"}</span>
          </div>
          <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
            <span className="text-gray-400 block">Sentiment</span>
            <span className="text-white font-bold">{evaluation.factors.sentimentScore > 30 ? "Reactive" : "Disciplined"}</span>
          </div>
        </div>

        {/* Real-time Guidance Message */}
        <div className="text-[11px] text-gray-300 bg-white/[0.02] p-2.5 rounded-lg border border-white/5 flex items-start gap-2">
          {isCritical ? (
            <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
          )}
          <span className="leading-snug">{evaluation.recommendation}</span>
        </div>
      </CardContent>
    </Card>
  );
};
