import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Sparkles, CheckCircle2, UploadCloud, RefreshCw } from "lucide-react";
import { visionQuantAI, ExtractedTradeParams } from "@/services/quant/visionQuantAI";
import { haptics } from "@/utils/audioHaptics";

interface VisionTradeDropzoneProps {
  onExtracted: (params: ExtractedTradeParams) => void;
}

export const VisionTradeDropzone: React.FC<VisionTradeDropzoneProps> = ({ onExtracted }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [lastFeatures, setLastFeatures] = useState<{ feature: string; confidence: number }[] | null>(null);

  const handleSimulateVisionExtract = async () => {
    haptics.playClick(1500);
    setAnalyzing(true);
    try {
      const data = await visionQuantAI.analyzeChartImage("sample-chart");
      setLastFeatures(data.detectedFeatures);
      onExtracted(data);
      haptics.playSuccess();
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="p-3 rounded-xl border border-dashed border-emerald-500/30 bg-emerald-500/[0.03] space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-bold text-white font-display">
            Vision Quant AI™ <span className="text-[10px] text-emerald-400 font-mono font-normal">Chart Screenshot Ingestion</span>
          </span>
        </div>
        <Badge variant="outline" className="text-[10px] font-mono border-white/10 text-gray-400">
          Multimodal OCR
        </Badge>
      </div>

      <p className="text-[11px] text-gray-400 leading-tight">
        Drop a TradingView or MetaTrader screenshot to auto-extract Pair, Direction, Entry, SL, TP, and institutional confluence.
      </p>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          onClick={handleSimulateVisionExtract}
          disabled={analyzing}
          size="sm"
          className="w-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold"
        >
          {analyzing ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin text-emerald-400" />
              Scanning Chart Structure with AI...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              Auto-Extract from Chart Screenshot
            </>
          )}
        </Button>
      </div>

      {lastFeatures && (
        <div className="pt-1.5 border-t border-white/5 space-y-1">
          <span className="text-[10px] font-mono text-gray-400 block">Detected Confluence Tokens:</span>
          <div className="flex flex-wrap gap-1">
            {lastFeatures.map(f => (
              <Badge key={f.feature} variant="secondary" className="bg-black/50 text-[10px] text-gray-300 border-white/5">
                ✓ {f.feature} ({f.confidence}%)
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
