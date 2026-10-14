import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Radio, Volume2, VolumeX, Sparkles, Clock, AlertTriangle, Play, ChevronRight } from "lucide-react";
import { deskSquawk, SquawkBroadcast } from "@/services/audio/deskSquawkService";
import { haptics } from "@/utils/audioHaptics";
import { toast } from "sonner";

export const DeskSquawkWidget: React.FC = () => {
  const [isMuted, setIsMuted] = useState(deskSquawk.getMuted());
  const [latestBroadcast, setLatestBroadcast] = useState<SquawkBroadcast | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<SquawkBroadcast[]>([]);

  useEffect(() => {
    // Set initial broadcast
    setHistory(deskSquawk.getHistory());
    const unsub = deskSquawk.subscribe((b) => {
      setLatestBroadcast(b);
      setHistory(deskSquawk.getHistory());
    });
    return unsub;
  }, []);

  const handleManualSquawk = () => {
    haptics.playClick(1500);
    const b = deskSquawk.triggerRandomBroadcast();
    toast.success(`Desk Squawk: ${b.headline}`);
  };

  const handleToggleMute = () => {
    const muted = deskSquawk.toggleMute();
    setIsMuted(muted);
    if (!muted) haptics.playClick(1800);
  };

  return (
    <>
      <div className="flex items-center gap-2 bg-white/[0.03] border border-white/10 rounded-xl px-2.5 py-1 text-xs font-mono shadow-inner">
        <button
          onClick={handleToggleMute}
          className={`flex items-center gap-1.5 transition-colors ${isMuted ? "text-gray-500 hover:text-gray-300" : "text-amber-400 hover:text-amber-300"}`}
          title={isMuted ? "Unmute Floor Squawk Audio" : "Mute Floor Squawk Audio"}
        >
          <Radio className={`w-3.5 h-3.5 ${!isMuted ? "animate-pulse text-amber-400" : "text-gray-500"}`} />
          <span className="font-bold text-[11px]">Desk Squawk</span>
        </button>

        {/* Live Audio Equalizer Wave Animation */}
        {!isMuted ? (
          <div className="flex items-end gap-[2px] h-3 w-5 px-0.5">
            <span className="w-[2px] bg-amber-400 h-2 animate-[pulse_0.6s_ease-in-out_infinite]" />
            <span className="w-[2px] bg-amber-400 h-3 animate-[pulse_0.8s_ease-in-out_infinite]" />
            <span className="w-[2px] bg-amber-400 h-1.5 animate-[pulse_0.5s_ease-in-out_infinite]" />
            <span className="w-[2px] bg-amber-400 h-2.5 animate-[pulse_0.7s_ease-in-out_infinite]" />
          </div>
        ) : (
          <span className="text-[10px] text-gray-500">Muted</span>
        )}

        {/* Squawk Action Button */}
        <Button
          size="sm"
          variant="ghost"
          onClick={handleManualSquawk}
          className="h-6 px-2 text-[10px] text-gray-300 hover:text-white hover:bg-white/10 rounded font-semibold"
          title="Broadcast Latest Desk Audio Commentary"
        >
          <Play className="w-2.5 h-2.5 mr-1 text-emerald-400" /> Squawk
        </Button>

        {/* History button */}
        <button
          onClick={() => setHistoryOpen(true)}
          className="text-[10px] text-gray-400 hover:text-cyan-400 transition-colors"
          title="View Squawk Broadcast History"
        >
          Logs ({history.length})
        </button>
      </div>

      {/* Squawk History Modal */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-md bg-[#0a0a0d] border border-white/10 text-white p-5 shadow-2xl">
          <DialogHeader className="border-b border-white/5 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 text-[10px] font-mono">
                <Radio className="w-3 h-3 mr-1" /> Institutional Audio Stream Log
              </Badge>
            </div>
            <DialogTitle className="text-base font-bold font-display text-white">
              Athena Desk Squawk™ Transcripts
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-400">
              Live verbal orderflow, session expansions, and macro flashes delivered by the desk.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2.5 max-h-80 overflow-y-auto mt-2 pr-1">
            {history.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-xs font-mono">
                No squawks broadcasted yet. Click "Squawk" to trigger the desk commentator.
              </div>
            ) : (
              history.map((h) => (
                <div key={h.id} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-amber-400 font-bold">{h.category.replace("_", " ")}</span>
                    <span className="text-gray-500">{h.timestamp}</span>
                  </div>
                  <h5 className="text-xs font-bold text-white">{h.headline}</h5>
                  <p className="text-[11px] text-gray-300 italic leading-relaxed">"{h.fullSpeech}"</p>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-white/5 flex justify-between items-center text-xs">
            <Button
              onClick={handleManualSquawk}
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs h-8"
            >
              Trigger Live Squawk
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setHistoryOpen(false)}
              className="border-white/10 text-xs h-8"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
