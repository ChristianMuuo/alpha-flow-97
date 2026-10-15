import React, { useState, useEffect } from "react";
import {
  approvalBus,
  PendingActionTicket,
} from "@/services/agentPlatform/approvalBus";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

export const HumanApprovalDialog: React.FC = () => {
  const [tickets, setTickets] = useState<PendingActionTicket[]>([]);
  const [activeTicketIndex, setActiveTicketIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(60);

  useEffect(() => {
    // Subscribe to approval bus updates
    const unsub = approvalBus.subscribe((pending) => {
      setTickets([...pending]);
      if (pending.length === 0) {
        setActiveTicketIndex(0);
      }
    });

    // Initial check
    setTickets(approvalBus.getPendingTickets());

    return unsub;
  }, []);

  // Countdown timer for active ticket
  useEffect(() => {
    if (tickets.length === 0) return;
    const current = tickets[activeTicketIndex] || tickets[0];
    if (!current) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.round((current.expiresAt - Date.now()) / 1000));
      setSecondsRemaining(remaining);
      if (remaining <= 0) {
        // Force refresh from bus
        setTickets(approvalBus.getPendingTickets());
      }
    }, 500);

    return () => clearInterval(interval);
  }, [tickets, activeTicketIndex]);

  if (tickets.length === 0) {
    return null;
  }

  const currentTicket = tickets[activeTicketIndex] || tickets[0];
  const payload = currentTicket.payload;

  const handleApprove = () => {
    approvalBus.approve(currentTicket.id);
  };

  const handleReject = () => {
    approvalBus.reject(currentTicket.id);
  };

  const isBuy = String(payload.direction || "").toUpperCase() === "BUY";
  const symbol = String(payload.symbol || "EURUSD");
  const lotSize = Number(payload.lotSize || 0.1);
  const entryPrice = Number(payload.entryPrice || 0);
  const stopLoss = Number(payload.stopLoss || 0);
  const takeProfit = Number(payload.takeProfit || 0);

  const riskDistance = Math.abs(entryPrice - stopLoss);
  const rewardDistance = Math.abs(takeProfit - entryPrice);
  const rrRatio = riskDistance > 0 ? (rewardDistance / riskDistance).toFixed(2) : "1.50";

  const progressPercent = Math.min(100, Math.max(0, (secondsRemaining / 60) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0d0e15] border border-amber-500/40 shadow-2xl shadow-amber-500/10 overflow-hidden text-white">
        {/* Glow Header */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-500" />

        {/* Progress Bar Timer */}
        <div className="w-full bg-white/5 h-1">
          <div
            className="h-full bg-amber-400 transition-all duration-500 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="p-6 space-y-5">
          {/* Top Title & Origin */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px] font-mono flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 text-amber-400 animate-pulse" />
                  HUMAN-IN-THE-LOOP SAFEGUARD
                </Badge>
                {tickets.length > 1 && (
                  <Badge variant="outline" className="text-[10px] text-white/50 border-white/20">
                    Ticket {activeTicketIndex + 1} of {tickets.length}
                  </Badge>
                )}
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Agent Action Approval Requested
              </h3>
            </div>

            <div className="flex items-center gap-1 text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md">
              <Clock className="w-3.5 h-3.5 animate-spin" />
              <span>{secondsRemaining}s</span>
            </div>
          </div>

          {/* Agent Meta Badge */}
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                <Cpu className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <div className="text-[10px] text-white/40 uppercase tracking-wider font-mono">
                  Originating Agent
                </div>
                <div className="font-semibold text-white">{currentTicket.agentName}</div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] text-white/40 uppercase tracking-wider font-mono">
                Requested Tool
              </div>
              <div className="font-mono text-amber-300 text-xs">{currentTicket.toolId}</div>
            </div>
          </div>

          {/* Proposed Execution Details */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                {isBuy ? (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-xs font-bold flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" /> BUY
                  </Badge>
                ) : (
                  <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/40 text-xs font-bold flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5" /> SELL
                  </Badge>
                )}
                <span className="font-mono font-bold text-base text-white">{symbol}</span>
              </div>
              <span className="font-mono text-sm text-white/80 font-semibold">{lotSize} Lots</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 rounded bg-white/[0.02] border border-white/5">
                <span className="text-[10px] text-white/40 block font-mono">ENTRY</span>
                <span className="font-mono font-medium text-white">{entryPrice > 0 ? entryPrice.toFixed(5) : "Market"}</span>
              </div>
              <div className="p-2 rounded bg-rose-500/5 border border-rose-500/15">
                <span className="text-[10px] text-rose-400 block font-mono">STOP LOSS</span>
                <span className="font-mono font-medium text-rose-300">{stopLoss > 0 ? stopLoss.toFixed(5) : "None"}</span>
              </div>
              <div className="p-2 rounded bg-emerald-500/5 border border-emerald-500/15">
                <span className="text-[10px] text-emerald-400 block font-mono">TAKE PROFIT</span>
                <span className="font-mono font-medium text-emerald-300">{takeProfit > 0 ? takeProfit.toFixed(5) : "None"}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-white/60 pt-1 font-mono">
              <span>Risk : Reward Ratio</span>
              <span className="text-emerald-400 font-bold">1 : {rrRatio}</span>
            </div>
          </div>

          {/* Paper Safeguard Banner */}
          <div className="flex items-center gap-2 text-[11px] text-amber-300/80 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              Action will execute in <strong>Paper Simulation Mode</strong>. Live capital is protected by protocol mandate.
            </span>
          </div>

          {/* Action CTAs */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleReject}
              className="border-rose-500/30 text-rose-300 hover:bg-rose-500/10 hover:text-rose-200 h-11"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject & Veto
            </Button>

            <Button
              onClick={handleApprove}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold h-11 shadow-lg shadow-emerald-600/25"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Approve Execution
            </Button>
          </div>

          {/* Multiple Ticket Navigation */}
          {tickets.length > 1 && (
            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-white/50">
              <span>{tickets.length} total actions pending review</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={activeTicketIndex === 0}
                  onClick={() => setActiveTicketIndex((i) => Math.max(0, i - 1))}
                  className="h-7 text-xs text-white/70"
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={activeTicketIndex >= tickets.length - 1}
                  onClick={() => setActiveTicketIndex((i) => Math.min(tickets.length - 1, i + 1))}
                  className="h-7 text-xs text-white/70"
                >
                  Next <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
