import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Cable, Copy, CheckCircle2, Download, Zap, RefreshCw, Terminal,
  ShieldCheck, Sparkles, Server
} from "lucide-react";
import { haptics } from "@/utils/audioHaptics";
import { toast } from "sonner";

interface BrokerSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BrokerSyncModal: React.FC<BrokerSyncModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);
  const webhookUrl = "https://api.alphaflow.io/v1/webhook/trader-live-sync-8829";

  const handleCopy = () => {
    haptics.playClick(1500);
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    toast.success("Webhook URL copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestPing = () => {
    haptics.playClick(1800);
    setTesting(true);
    setTimeout(() => {
      setTesting(false);
      haptics.playTrade();
      toast.success("Test Webhook Signal Received! Latency: 18ms. Trade synced.");
    }, 600);
  };

  const sampleTvJson = `{
  "action": "{{strategy.order.action}}",
  "symbol": "{{ticker}}",
  "price": {{strategy.order.price}},
  "contracts": {{strategy.order.contracts}},
  "strategy": "Silver Bullet FVG",
  "time": "{{time}}"
}`;

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-[#09090c] border border-white/10 text-white p-6 shadow-2xl">
        <DialogHeader className="border-b border-white/5 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px] font-mono">
                  <Cable className="w-3 h-3 mr-1" /> Sub-Second Execution Bridge
                </Badge>
                <Badge variant="outline" className="border-white/10 text-gray-400 text-[10px] font-mono">
                  MT4 • MT5 • cTrader • TradingView
                </Badge>
              </div>
              <DialogTitle className="text-xl font-bold font-display text-white">
                Universal Broker Sync Engine
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-400">
                Stream real-time executions directly from your broker into your Journal & Prop Combine in under 500ms.
              </DialogDescription>
            </div>

            {/* Live Status Pill */}
            <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 font-mono text-[11px] text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Bridge Online</span>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Webhook Endpoint Box */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-gray-400 block">Your Dedicated Secure Webhook Endpoint</label>
            <div className="flex gap-2">
              <Input
                readOnly
                value={webhookUrl}
                className="bg-black/50 border-white/10 text-emerald-400 font-mono text-xs h-9"
              />
              <Button
                size="sm"
                onClick={handleCopy}
                className="bg-white/10 hover:bg-white/20 text-white text-xs h-9 shrink-0 gap-1.5"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy URL"}
              </Button>
            </div>
          </div>

          {/* Platform Tabs */}
          <Tabs defaultValue="tradingview" className="w-full">
            <TabsList className="bg-white/[0.04] border border-white/10 w-full justify-start h-9 p-1">
              <TabsTrigger value="tradingview" className="text-xs">TradingView Alert</TabsTrigger>
              <TabsTrigger value="mt4" className="text-xs">MetaTrader 4 / 5 EA</TabsTrigger>
              <TabsTrigger value="ctrader" className="text-xs">cTrader cBot</TabsTrigger>
            </TabsList>

            <TabsContent value="tradingview" className="space-y-2 mt-3">
              <span className="text-xs text-gray-400 block">
                Paste this Webhook payload into your TradingView Alert Message field:
              </span>
              <pre className="p-3 bg-black/60 rounded-xl border border-white/5 font-mono text-[11px] text-cyan-300 overflow-x-auto">
                {sampleTvJson}
              </pre>
            </TabsContent>

            <TabsContent value="mt4" className="space-y-3 mt-3">
              <p className="text-xs text-gray-300 leading-relaxed">
                Install the official lightweight <strong>AlphaFlow_Sync_v2.ex4 / ex5</strong> Expert Advisor in your MetaTrader <code className="text-emerald-400">/MQL4/Experts/</code> folder. Enable WebRequest for <code className="text-white">api.alphaflow.io</code> in MT Options.
              </p>
              <Button
                size="sm"
                onClick={() => { haptics.playClick(1500); toast.success("Downloaded AlphaFlow_Sync_v2.mq5!"); }}
                className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-xs h-8 gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Download MQL5 Bridge Script
              </Button>
            </TabsContent>

            <TabsContent value="ctrader" className="space-y-2 mt-3">
              <p className="text-xs text-gray-300 leading-relaxed">
                Add the cTrader Open API connection token to stream executions directly from IC Markets, Pepperstone, or Topstep accounts.
              </p>
            </TabsContent>
          </Tabs>

          {/* Test Signal Trigger */}
          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-gray-400 font-mono">
              <Server className="w-4 h-4 text-cyan-400" />
              <span>Simulate Live Inbound Signal (Ping Test)</span>
            </div>
            <Button
              size="sm"
              onClick={handleTestPing}
              disabled={testing}
              className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold text-xs h-8 gap-1.5"
            >
              {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
              Send Test Webhook
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
