import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Swords, Trophy, Play, RotateCcw, Clock, Target, TrendingUp, TrendingDown,
  ShieldAlert, Sparkles, CheckCircle2, User, Bot, Zap, Medal
} from "lucide-react";
import { haptics } from "@/utils/audioHaptics";
import { playbookService } from "@/services/playbookService";
import { toast } from "sonner";

interface DuelPlayer {
  name: string;
  avatar: string;
  isBot?: boolean;
  elo: number;
  position: "FLAT" | "LONG" | "SHORT";
  entryPrice: number;
  pnl: number;
  winCount: number;
}

const ARENA_SCENARIOS = [
  {
    id: "london-sweep",
    title: "EUR/USD London Open Liquidity Purge",
    timeframe: "5M Chart",
    description: "Asian range high was swept at 07:05 UTC. Price prints an aggressive displacement lower leaving a Fair Value Gap. Execute before the 3-minute timer expires!"
  },
  {
    id: "gold-nfp",
    title: "Gold (XAU/USD) NFP Volatility Expansion",
    timeframe: "1M Fast Replay",
    description: "High-impact non-farm payrolls shock. Spread widens by 4 pips followed by an immediate institutional V-reversal off the 4H Order Block."
  }
];

export const AlphaArenaDuel: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState(ARENA_SCENARIOS[0]);
  const [matchState, setMatchState] = useState<"READY" | "LIVE" | "FINISHED">("READY");
  const [timeLeft, setTimeLeft] = useState(60); // 60-second rapid blitz duel
  const [currentTickPrice, setCurrentTickPrice] = useState(1.08380);

  const [player, setPlayer] = useState<DuelPlayer>({
    name: "You (Alpha Trader)",
    avatar: "👤",
    elo: 1450,
    position: "FLAT",
    entryPrice: 0,
    pnl: 0,
    winCount: 14
  });

  const [opponent, setOpponent] = useState<DuelPlayer>({
    name: "Apex Quant Ghost (AI)",
    avatar: "🤖",
    isBot: true,
    elo: 1485,
    position: "SHORT",
    entryPrice: 1.08390,
    pnl: 0,
    winCount: 22
  });

  const [winner, setWinner] = useState<string | null>(null);

  // Match Simulation Loop
  useEffect(() => {
    let timer: any;
    if (matchState === "LIVE") {
      timer = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            handleEndMatch();
            return 0;
          }
          return t - 1;
        });

        // Price oscillations
        setCurrentTickPrice((prev) => {
          const delta = (Math.random() - 0.52) * 0.00010;
          const next = Number((prev + delta).toFixed(5));

          // Update player PnL
          setPlayer((p) => {
            if (p.position === "FLAT") return p;
            const diff = (next - p.entryPrice) * (p.position === "LONG" ? 1 : -1) * 10000;
            return { ...p, pnl: Number((diff * 25).toFixed(2)) };
          });

          // Update opponent AI PnL
          setOpponent((o) => {
            if (o.position === "FLAT") return o;
            const diff = (next - o.entryPrice) * (o.position === "LONG" ? 1 : -1) * 10000;
            return { ...o, pnl: Number((diff * 25).toFixed(2)) };
          });

          return next;
        });
      }, 500);
    }
    return () => clearInterval(timer);
  }, [matchState]);

  const handleStartMatch = () => {
    haptics.playTrade();
    setMatchState("LIVE");
    setTimeLeft(60);
    setCurrentTickPrice(1.08380);
    setPlayer((p) => ({ ...p, position: "FLAT", pnl: 0 }));
    setOpponent((o) => ({ ...o, position: "SHORT", entryPrice: 1.08385, pnl: 0 }));
    setWinner(null);
    toast.success("Duel Started! 60 Seconds on the Clock.");
  };

  const handleEndMatch = () => {
    setMatchState("FINISHED");
    // Determine winner based on final PnL
    setPlayer((currP) => {
      setOpponent((currO) => {
        const isPlayerWin = currP.pnl >= currO.pnl;
        setWinner(isPlayerWin ? currP.name : currO.name);

        if (isPlayerWin) {
          haptics.playSuccess();
          playbookService.awardXP(100, "Won AlphaArena 1v1 PVP Trader Duel");
          toast.success("VICTORY! You outperformed the Apex Quant Ghost (+100 XP)!");
        } else {
          haptics.playError();
          toast.error("DEFEAT! Quant Bot took the round. Practice setup in Library.");
        }
        return currO;
      });
      return currP;
    });
  };

  const handlePlayerBuy = () => {
    haptics.playClick(1600);
    setPlayer((p) => ({ ...p, position: "LONG", entryPrice: currentTickPrice }));
    toast.info(`Entered LONG @ ${currentTickPrice.toFixed(5)}`);
  };

  const handlePlayerSell = () => {
    haptics.playClick(1400);
    setPlayer((p) => ({ ...p, position: "SHORT", entryPrice: currentTickPrice }));
    toast.info(`Entered SHORT @ ${currentTickPrice.toFixed(5)}`);
  };

  const handlePlayerClose = () => {
    haptics.playClick(1000);
    setPlayer((p) => ({ ...p, position: "FLAT" }));
    toast.info("Closed position - Locked in PnL");
  };

  return (
    <div className="bg-[#09090c] border border-white/10 rounded-2xl p-4 sm:p-6 text-white space-y-6 shadow-2xl relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-1/3 w-80 h-80 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-red-500/20 text-red-400 border-red-500/40 text-xs font-mono">
              <Swords className="w-3.5 h-3.5 mr-1" /> AlphaArena™ 1v1 PVP Combine
            </Badge>
            <Badge variant="outline" className="text-xs border-white/10 text-gray-400 font-mono">
              Live Replay Duel
            </Badge>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
            {activeScenario.title}
          </h3>
          <p className="text-xs text-gray-400 max-w-xl mt-1">
            {activeScenario.description}
          </p>
        </div>

        {/* Timer & Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/[0.03] border border-white/10 px-3 py-1.5 rounded-xl font-mono text-sm">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className={timeLeft <= 10 ? "text-red-400 font-bold animate-pulse" : "text-white font-bold"}>
              {timeLeft}s
            </span>
          </div>

          {matchState === "READY" && (
            <Button
              onClick={handleStartMatch}
              className="bg-red-500 hover:bg-red-600 text-white font-bold text-xs h-9 gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
            >
              <Play className="w-3.5 h-3.5" /> Start Duel
            </Button>
          )}

          {matchState === "LIVE" && (
            <Button
              onClick={handleEndMatch}
              variant="outline"
              size="sm"
              className="border-red-500/30 text-red-400 text-xs h-9"
            >
              Surrender / Finalize
            </Button>
          )}

          {matchState === "FINISHED" && (
            <Button
              onClick={handleStartMatch}
              className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs h-9 gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Rematch
            </Button>
          )}
        </div>
      </div>

      {/* Versus Scoreboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Player Card */}
        <Card className="bg-gradient-to-br from-emerald-500/10 via-[#0b0b0e] to-black border border-emerald-500/30 text-white p-4 rounded-xl space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl p-2 bg-white/[0.05] rounded-xl border border-white/10">{player.avatar}</span>
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                  {player.name}
                  <Medal className="w-3.5 h-3.5 text-emerald-400" />
                </h4>
                <span className="text-[10px] font-mono text-emerald-400">Elo: {player.elo} Rating</span>
              </div>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs font-mono">
              Position: {player.position}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
              <span className="text-gray-400 text-[10px] block">Entry Price</span>
              <span className="text-white font-bold">{player.entryPrice ? player.entryPrice.toFixed(5) : "None"}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
              <span className="text-gray-400 text-[10px] block">Live Score / PnL</span>
              <span className={`font-bold text-sm ${player.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                ${player.pnl >= 0 ? `+${player.pnl}` : player.pnl}
              </span>
            </div>
          </div>

          {/* Player Live Action Buttons */}
          {matchState === "LIVE" && (
            <div className="grid grid-cols-3 gap-2 pt-1">
              <Button
                onClick={handlePlayerBuy}
                disabled={player.position === "LONG"}
                className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs h-8"
              >
                Buy Long
              </Button>
              <Button
                onClick={handlePlayerSell}
                disabled={player.position === "SHORT"}
                className="bg-red-500 hover:bg-red-600 text-white font-bold text-xs h-8"
              >
                Sell Short
              </Button>
              <Button
                onClick={handlePlayerClose}
                disabled={player.position === "FLAT"}
                variant="outline"
                className="border-white/10 text-xs h-8"
              >
                Close (Flat)
              </Button>
            </div>
          )}
        </Card>

        {/* Opponent Card */}
        <Card className="bg-gradient-to-br from-red-500/10 via-[#0b0b0e] to-black border border-red-500/30 text-white p-4 rounded-xl space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl p-2 bg-white/[0.05] rounded-xl border border-white/10">{opponent.avatar}</span>
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                  {opponent.name}
                  <Bot className="w-3.5 h-3.5 text-red-400" />
                </h4>
                <span className="text-[10px] font-mono text-red-400">Elo: {opponent.elo} Rating</span>
              </div>
            </div>
            <Badge className="bg-red-500/20 text-red-300 border-red-500/40 text-xs font-mono">
              Position: {opponent.position}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
              <span className="text-gray-400 text-[10px] block">Entry Price</span>
              <span className="text-white font-bold">{opponent.entryPrice.toFixed(5)}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
              <span className="text-gray-400 text-[10px] block">Live Score / PnL</span>
              <span className={`font-bold text-sm ${opponent.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                ${opponent.pnl >= 0 ? `+${opponent.pnl}` : opponent.pnl}
              </span>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5 text-[11px] text-gray-400 font-mono flex items-center justify-between">
            <span>AI Bot Strategy:</span>
            <span className="text-red-400 font-bold">Bearish FVG Displacement Short</span>
          </div>
        </Card>
      </div>

      {/* Match Result Announcement Banner */}
      {winner && (
        <div className={`p-4 rounded-xl border flex items-center justify-between ${
          winner === player.name
            ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
            : "bg-red-500/20 border-red-500/50 text-red-300"
        }`}>
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <h4 className="font-bold text-sm text-white">
                Match Winner: {winner}
              </h4>
              <p className="text-xs text-gray-300">
                {winner === player.name
                  ? "Flawless execution! You out-traded the institutional algorithm. +100 XP & +24 Elo awarded."
                  : "Apex Quant Ghost took the duel. Review liquidity sweeps in the 95-book digital library."}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleStartMatch}
            className="bg-white text-black font-bold text-xs h-8 shrink-0"
          >
            Play Rematch
          </Button>
        </div>
      )}
    </div>
  );
};
