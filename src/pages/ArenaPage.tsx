import React from "react";
import SEO from "@/components/SEO";
import { AlphaArenaDuel } from "@/components/arena/AlphaArenaDuel";
import { SessionHUD } from "@/components/SessionHUD";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Swords, Trophy, Medal, Flame, Zap, ShieldCheck } from "lucide-react";

export const ArenaPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#07070a] text-white selection:bg-red-500/30">
      <SEO
        title="AlphaArena™ - Live 1v1 Trader Duels & PVP Combine"
        description="Compete in real-time 1v1 simulated trading duels against institutional algorithms and peer traders on historical market replays."
      />

      <div className="pt-24 pb-16 px-4 container mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-red-500/15 text-red-400 border-red-500/30 text-xs font-mono">
                <Swords className="w-3.5 h-3.5 mr-1" /> Multiplayer Gamified Trading Arena
              </Badge>
              <Badge variant="outline" className="text-xs border-white/10 text-gray-400 font-mono">
                Competitive Elo Ladder
              </Badge>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold font-display text-white tracking-tight">
              AlphaArena™ <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-400 to-emerald-400">PVP Duels</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-2xl mt-1">
              Battle head-to-head on identical market replays. Out-execute algorithms and fellow prop traders to climb the global Elo leaderboard.
            </p>
          </div>
        </div>

        {/* Global Session HUD */}
        <SessionHUD />

        {/* Main Arena Duel Component */}
        <AlphaArenaDuel />

        {/* Elo Ranking Tiers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <Card className="bg-[#0b0b0e] border border-white/10 text-white p-3.5 space-y-1">
            <span className="text-[10px] text-gray-400 font-mono uppercase block">Bronze / Silver Tier</span>
            <div className="text-base font-bold text-gray-300 font-mono">1,000 - 1,399 Elo</div>
            <p className="text-[10px] text-gray-500">Retail foundation & basic mechanics.</p>
          </Card>

          <Card className="bg-[#0b0b0e] border border-white/10 text-white p-3.5 space-y-1">
            <span className="text-[10px] text-amber-400 font-mono uppercase block">Gold / Platinum Tier</span>
            <div className="text-base font-bold text-amber-300 font-mono">1,400 - 1,799 Elo</div>
            <p className="text-[10px] text-gray-500">Consistent risk management & Killzone execution.</p>
          </Card>

          <Card className="bg-[#0b0b0e] border border-white/10 text-white p-3.5 space-y-1">
            <span className="text-[10px] text-cyan-400 font-mono uppercase block">Diamond Prop Tier</span>
            <div className="text-base font-bold text-cyan-300 font-mono">1,800 - 2,199 Elo</div>
            <p className="text-[10px] text-gray-500">Advanced orderflow absorption & FVG mitigation.</p>
          </Card>

          <Card className="bg-[#0b0b0e] border border-emerald-500/30 text-white p-3.5 space-y-1 bg-emerald-500/[0.03]">
            <span className="text-[10px] text-emerald-400 font-mono uppercase block">Quant Grandmaster</span>
            <div className="text-base font-bold text-emerald-400 font-mono">2,200+ Elo</div>
            <p className="text-[10px] text-gray-500">Top 0.1% institutional performance.</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ArenaPage;
