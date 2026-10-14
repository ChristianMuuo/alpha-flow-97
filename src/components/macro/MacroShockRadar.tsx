import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar, AlertTriangle, ShieldCheck, Zap, TrendingUp, Clock,
  ArrowUpRight, Flame, Sparkles, CheckCircle2
} from "lucide-react";

export interface MacroEvent {
  id: string;
  time: string;
  currency: string;
  impact: "HIGH" | "MEDIUM" | "LOW";
  event: string;
  forecast: string;
  previous: string;
  expectedShockPips: number;
  spreadRisk: "EXTREME" | "MODERATE" | "LOW";
  standDownRecommended: boolean;
}

const UPCOMING_EVENTS: MacroEvent[] = [
  {
    id: "us-cpi",
    time: "13:30 UTC",
    currency: "USD",
    impact: "HIGH",
    event: "US Consumer Price Index (CPI YoY)",
    forecast: "2.9%",
    previous: "3.1%",
    expectedShockPips: 48,
    spreadRisk: "EXTREME",
    standDownRecommended: true
  },
  {
    id: "us-nfp",
    time: "Tomorrow 13:30 UTC",
    currency: "USD",
    impact: "HIGH",
    event: "Non-Farm Payrolls (NFP)",
    forecast: "165K",
    previous: "142K",
    expectedShockPips: 62,
    spreadRisk: "EXTREME",
    standDownRecommended: true
  },
  {
    id: "ecb-rate",
    time: "Thursday 12:15 UTC",
    currency: "EUR",
    impact: "HIGH",
    event: "ECB Interest Rate Decision",
    forecast: "3.50%",
    previous: "3.75%",
    expectedShockPips: 36,
    spreadRisk: "EXTREME",
    standDownRecommended: true
  },
  {
    id: "uk-gdp",
    time: "Friday 07:00 UTC",
    currency: "GBP",
    impact: "MEDIUM",
    event: "UK Gross Domestic Product (MoM)",
    forecast: "0.2%",
    previous: "0.0%",
    expectedShockPips: 24,
    spreadRisk: "MODERATE",
    standDownRecommended: false
  }
];

export const MacroShockRadar: React.FC = () => {
  const [standDownActive, setStandDownActive] = useState(true);

  return (
    <Card className="bg-[#09090c] border border-white/10 text-white rounded-2xl shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

      <CardHeader className="border-b border-white/5 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-red-500/20 text-red-400 border-red-500/40 text-[10px] font-mono">
                <Flame className="w-3 h-3 mr-1 text-amber-400" /> Red Folder Volatility Predictor
              </Badge>
              <Badge variant="outline" className="border-white/10 text-gray-400 text-[10px] font-mono">
                Economic Shock Radar
              </Badge>
            </div>
            <CardTitle className="text-xl font-bold font-display text-white">
              MacroShock Radar™ <span className="text-xs text-gray-400 font-sans font-normal">Economic Calendar</span>
            </CardTitle>
            <CardDescription className="text-xs text-gray-400">
              Institutional forecast of upcoming macroeconomic releases, expected pip expansion cones, and spread risks.
            </CardDescription>
          </div>

          {/* Stand Down Protocol Toggle */}
          <div className="flex items-center gap-2 bg-white/[0.03] border border-white/10 p-2 rounded-xl">
            <ShieldCheck className={`w-4 h-4 ${standDownActive ? "text-emerald-400" : "text-gray-400"}`} />
            <div className="text-left">
              <span className="text-[10px] font-mono text-gray-400 block">Prop Firm Shield</span>
              <span className={`text-xs font-bold font-mono ${standDownActive ? "text-emerald-400" : "text-gray-400"}`}>
                {standDownActive ? "Auto Stand-Down Active" : "Shield Paused"}
              </span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setStandDownActive(!standDownActive)}
              className="text-[10px] h-7 px-2 text-gray-400 hover:text-white"
            >
              Toggle
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* Active Warning Banner */}
        {standDownActive && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-xs">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="text-gray-300 text-[11px] leading-relaxed">
              <strong className="text-white">Active Prop Firm Protection Warning:</strong> High-impact US CPI release scheduled in <strong>45 minutes</strong>. Spreads typically widen by 400% during this window. Automated trading limit orders should be cancelled to prevent slippage drawdown violations.
            </div>
          </div>
        )}

        {/* Event List */}
        <div className="space-y-2.5">
          {UPCOMING_EVENTS.map((ev) => (
            <div
              key={ev.id}
              className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.04] transition-all"
            >
              <div className="flex items-center gap-3">
                <Badge className={`text-xs font-mono font-bold w-12 text-center justify-center ${
                  ev.impact === "HIGH"
                    ? "bg-red-500/20 text-red-400 border-red-500/40"
                    : "bg-amber-500/20 text-amber-400 border-amber-500/40"
                }`}>
                  {ev.currency}
                </Badge>
                <div>
                  <h5 className="font-bold text-sm text-white">{ev.event}</h5>
                  <div className="flex items-center gap-3 text-[11px] font-mono text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-500" /> {ev.time}
                    </span>
                    <span>Forecast: <strong className="text-white">{ev.forecast}</strong></span>
                    <span>Prev: <strong className="text-gray-300">{ev.previous}</strong></span>
                  </div>
                </div>
              </div>

              {/* Volatility Shock Metrics */}
              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 block">Shock Cone</span>
                  <span className="text-amber-400 font-bold">±{ev.expectedShockPips} Pips</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 block">Spread Risk</span>
                  <Badge variant="outline" className={`text-[10px] ${
                    ev.spreadRisk === "EXTREME"
                      ? "border-red-500/30 text-red-400 bg-red-500/10"
                      : "border-amber-500/30 text-amber-400"
                  }`}>
                    {ev.spreadRisk}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
