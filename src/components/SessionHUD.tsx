import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, Clock, Volume2, VolumeX, Sparkles, Flame } from "lucide-react";
import { haptics } from "@/utils/audioHaptics";
import { MarketRegimeBadge } from "@/components/quant/MarketRegimeBadge";
import { DeskSquawkWidget } from "@/components/audio/DeskSquawkWidget";

interface SessionInfo {
  name: string;
  utcOpen: number;
  utcClose: number;
  city: string;
}

const SESSIONS: SessionInfo[] = [
  { name: "Tokyo", utcOpen: 0, utcClose: 9, city: "Asia Range" },
  { name: "London", utcOpen: 7, utcClose: 16, city: "European Flow" },
  { name: "New York", utcOpen: 12, utcClose: 21, city: "US Liquidity" }
];

export const SessionHUD: React.FC = () => {
  const [currentUtcHour, setCurrentUtcHour] = useState(new Date().getUTCHours());
  const [currentUtcMinutes, setCurrentUtcMinutes] = useState(new Date().getUTCMinutes());
  const [isMuted, setIsMuted] = useState(haptics.getMuted());

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setCurrentUtcHour(d.getUTCHours());
      setCurrentUtcMinutes(d.getUTCMinutes());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const isSessionOpen = (s: SessionInfo) => {
    if (s.utcOpen < s.utcClose) {
      return currentUtcHour >= s.utcOpen && currentUtcHour < s.utcClose;
    }
    // Overnight wraps around midnight
    return currentUtcHour >= s.utcOpen || currentUtcHour < s.utcClose;
  };

  const isOverlap = currentUtcHour >= 12 && currentUtcHour < 16; // London & NY overlap

  const toggleSound = () => {
    const newMuted = haptics.toggleMute();
    setIsMuted(newMuted);
    if (!newMuted) haptics.playClick(1500);
  };

  return (
    <div className="bg-[#0b0b0e]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-3 px-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
      {/* Sessions Display */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground mr-1">
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span>UTC {String(currentUtcHour).padStart(2, "0")}:{String(currentUtcMinutes).padStart(2, "0")}</span>
        </div>

        <div className="flex items-center gap-2">
          {SESSIONS.map((s) => {
            const active = isSessionOpen(s);
            return (
              <div
                key={s.name}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono transition-all ${
                  active
                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                    : "bg-white/[0.02] border-white/5 text-gray-500"
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    active ? "bg-emerald-400 animate-pulse shadow-[0_0_6px_#10b981]" : "bg-gray-600"
                  }`}
                />
                <span className="font-semibold">{s.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Overlap & Volatility Status */}
      <div className="flex items-center gap-3">
        {isOverlap ? (
          <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/30 text-[11px] font-mono flex items-center gap-1 animate-pulse">
            <Flame className="w-3.5 h-3.5 text-amber-400" /> London-NY Overlap Killzone Active
          </Badge>
        ) : (
          <Badge variant="outline" className="text-[11px] font-mono border-white/10 text-gray-400">
            Standard Volume Window
          </Badge>
        )}

        {/* Market Regime Radar Clustering */}
        <MarketRegimeBadge />

        {/* Athena Desk Squawk Box */}
        <DeskSquawkWidget />

        {/* Audio Mute Controller */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSound}
          className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg"
          title={isMuted ? "Enable Terminal Audio Haptics" : "Mute Terminal Audio Haptics"}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </Button>
      </div>
    </div>
  );
};
