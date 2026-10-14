import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  BookOpen, TrendingUp, TrendingDown, Plus, Trash2, BarChart3,
  Calendar, Target, Flame, ChevronUp, ChevronDown, Filter, Sparkles, ShieldCheck, Eye, Cable
} from "lucide-react";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { PropFirmScorecard } from "@/components/dashboard/PropFirmScorecard";
import { playbookService, StrategyRule } from "@/services/playbookService";
import { haptics } from "@/utils/audioHaptics";
import { NeuroSentinelWidget } from "@/components/quant/NeuroSentinelWidget";
import { VisionTradeDropzone } from "@/components/quant/VisionTradeDropzone";
import { AutoOptimizerCard } from "@/components/quant/AutoOptimizerCard";
import { TradeTimeMachineModal } from "@/components/journal/TradeTimeMachineModal";
import { BrokerSyncModal } from "@/components/broker/BrokerSyncModal";
import { MacroShockRadar } from "@/components/macro/MacroShockRadar";

const PAIRS = ["EURUSD","GBPUSD","XAUUSD","USDJPY","GBPJPY","EURJPY","AUDUSD","USDCAD","BTCUSDT","XAGUSD","NZDUSD","EURGBP"];
const MOODS = [
  { emoji: "😎", label: "Confident" },
  { emoji: "😊", label: "Good" },
  { emoji: "😐", label: "Neutral" },
  { emoji: "😰", label: "Stressed" },
  { emoji: "😫", label: "Frustrated" },
];

interface Trade {
  id: string;
  pair: string;
  direction: "buy" | "sell";
  entry_price: number | null;
  exit_price: number | null;
  sl: number | null;
  tp: number | null;
  pips: number | null;
  result: number | null;
  notes: string | null;
  mood: string | null;
  strategy?: string;
  trade_date: string | null;
  created_at: string;
}

const SAMPLE_TRADES: Trade[] = [
  {
    id: "sample-1",
    pair: "EURUSD",
    direction: "buy",
    entry_price: 1.0820,
    exit_price: 1.0868,
    sl: 1.0805,
    tp: 1.0870,
    pips: 48,
    result: 320,
    strategy: "Fair Value Gap (FVG) Mitigation",
    notes: "5M FVG tapped after Asian low sweep. Clean displacement.",
    mood: "😎",
    trade_date: new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0],
    created_at: new Date().toISOString()
  },
  {
    id: "sample-2",
    pair: "GBPUSD",
    direction: "sell",
    entry_price: 1.2950,
    exit_price: 1.2888,
    sl: 1.2970,
    tp: 1.2880,
    pips: 62,
    result: 450,
    strategy: "London Open Asian Range Sweep",
    notes: "London high sweep + 1M CHoCH. Retested 15M breaker block.",
    mood: "😊",
    trade_date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    created_at: new Date().toISOString()
  },
  {
    id: "sample-3",
    pair: "XAUUSD",
    direction: "buy",
    entry_price: 2640.50,
    exit_price: 2651.50,
    sl: 2636.00,
    tp: 2655.00,
    pips: 110,
    result: 780,
    strategy: "Wyckoff Accumulation Spring Phase C",
    notes: "Spring tested holding higher low with strong sign of strength.",
    mood: "😎",
    trade_date: new Date().toISOString().split("T")[0],
    created_at: new Date().toISOString()
  },
  {
    id: "sample-4",
    pair: "USDJPY",
    direction: "sell",
    entry_price: 154.20,
    exit_price: 154.38,
    sl: 154.40,
    tp: 153.60,
    pips: -18,
    result: -120,
    strategy: "CVD Absorption & Liquidity Pool Reversal",
    notes: "Absorption failed to hold above session high, stopped out cleanly.",
    mood: "😐",
    trade_date: new Date().toISOString().split("T")[0],
    created_at: new Date().toISOString()
  }
];

const defaultForm = {
  pair: "EURUSD", direction: "buy" as "buy" | "sell",
  entry_price: "", exit_price: "", sl: "", tp: "",
  pips: "", result: "", notes: "", mood: "😊",
  strategy: "Fair Value Gap (FVG) Mitigation",
  trade_date: new Date().toISOString().split("T")[0],
};

export default function JournalPage() {
  const [user, setUser] = useState<any>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(defaultForm);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterPair, setFilterPair] = useState("All");
  const [playbookStrategies, setPlaybookStrategies] = useState<StrategyRule[]>([]);
  const [replayTrade, setReplayTrade] = useState<Trade | null>(null);
  const [brokerSyncOpen, setBrokerSyncOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    setPlaybookStrategies(playbookService.getStrategies());
    
    // Check Supabase session with local guest fallback
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchTrades(session.user.id);
      } else {
        loadGuestTrades();
      }
    }).catch(() => {
      loadGuestTrades();
    });
  }, []);

  const loadGuestTrades = () => {
    setUser({ id: "guest-trader", email: "guest@alphaflow.io" });
    try {
      const saved = localStorage.getItem("alphaflow_guest_trades");
      if (saved) {
        setTrades(JSON.parse(saved));
      } else {
        setTrades(SAMPLE_TRADES);
        localStorage.setItem("alphaflow_guest_trades", JSON.stringify(SAMPLE_TRADES));
      }
    } catch (_) {
      setTrades(SAMPLE_TRADES);
    }
    setLoading(false);
  };

  const fetchTrades = async (userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("trade_journal").select("*").eq("user_id", userId).order("trade_date", { ascending: false });
      if (!error && data && data.length > 0) {
        setTrades(data as Trade[]);
      } else {
        loadGuestTrades();
      }
    } catch (_) {
      loadGuestTrades();
    }
    setLoading(false);
  };

  const saveTrade = async () => {
    if (!user) return;
    setSaving(true);
    haptics.playExecute();

    const newTrade: Trade = {
      id: `trade-${Date.now()}`,
      pair: form.pair,
      direction: form.direction,
      entry_price: form.entry_price ? parseFloat(form.entry_price) : null,
      exit_price: form.exit_price ? parseFloat(form.exit_price) : null,
      sl: form.sl ? parseFloat(form.sl) : null,
      tp: form.tp ? parseFloat(form.tp) : null,
      pips: form.pips ? parseFloat(form.pips) : null,
      result: form.result ? parseFloat(form.result) : null,
      notes: form.notes || null,
      mood: form.mood,
      strategy: form.strategy,
      trade_date: form.trade_date,
      created_at: new Date().toISOString()
    };

    if (user.id !== "guest-trader") {
      try {
        await supabase.from("trade_journal").insert({
          user_id: user.id,
          ...newTrade,
          id: undefined
        });
      } catch (_) {}
    }

    // Update state & local storage
    const updated = [newTrade, ...trades];
    setTrades(updated);
    localStorage.setItem("alphaflow_guest_trades", JSON.stringify(updated));

    haptics.playSuccess();
    playbookService.addXP(35, "Logged Disciplined Journal Trade");
    toast({ title: "✅ Trade Logged!", description: `${form.pair} ${form.direction.toUpperCase()} (+35 Trader XP)` });
    setForm(defaultForm);
    setDialogOpen(false);
    setSaving(false);
  };

  const deleteTrade = async (id: string) => {
    haptics.playClick();
    if (user && user.id !== "guest-trader") {
      try {
        await supabase.from("trade_journal").delete().eq("id", id);
      } catch (_) {}
    }
    const updated = trades.filter(tr => tr.id !== id);
    setTrades(updated);
    localStorage.setItem("alphaflow_guest_trades", JSON.stringify(updated));
    toast({ title: "Trade deleted" });
  };

  const filtered = filterPair === "All" ? trades : trades.filter(t => t.pair === filterPair);

  // Stats
  const totalTrades = trades.length;
  const wins = trades.filter(t => (t.result ?? 0) > 0).length;
  const winRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0;
  const totalPnl = trades.reduce((s, t) => s + (t.result ?? 0), 0);
  const totalPips = trades.reduce((s, t) => s + (t.pips ?? 0), 0);

  // Calendar heatmap: group trade results by date
  const tradesByDate: Record<string, number> = {};
  trades.forEach(t => {
    if (t.trade_date) {
      tradesByDate[t.trade_date] = (tradesByDate[t.trade_date] ?? 0) + (t.result ?? 0);
    }
  });

  // Last 35 days for heatmap
  const calDays = Array.from({ length: 35 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (34 - i));
    return d.toISOString().split("T")[0];
  });

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Trade Journal" description="Track your forex trades, analyze your performance and improve your trading psychology." />
      <Navbar />

      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-6 h-6 text-emerald-400" />
                <h1 className="text-3xl font-bold">Trade Journal</h1>
              </div>
              <p className="text-muted-foreground">Track every trade. Understand every emotion. Improve every session.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setBrokerSyncOpen(true)}
                className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 text-xs font-semibold gap-1.5 h-10"
              >
                <Cable className="w-4 h-4 text-cyan-400" /> Auto-Sync Broker (MT4/5)
              </Button>

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold h-10">
                    <Plus className="w-4 h-4" /> Log a Trade
                  </Button>
                </DialogTrigger>
              <DialogContent className="max-w-lg bg-card border-border/50">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5 text-emerald-400" /> Log New Trade
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  {/* Multimodal Chart Vision & OCR Auto-Journaling */}
                  <VisionTradeDropzone onExtracted={(params) => setForm(prev => ({ ...prev, ...params }))} />

                  {/* Pair + Direction */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Pair</label>
                      <select value={form.pair} onChange={e => setForm({ ...form, pair: e.target.value })}
                        className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm">
                        {PAIRS.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Direction</label>
                      <div className="flex rounded-lg overflow-hidden border border-border">
                        {(["buy", "sell"] as const).map(d => (
                          <button key={d} onClick={() => setForm({ ...form, direction: d })}
                            className={`flex-1 py-2 text-sm font-semibold capitalize transition-colors ${form.direction === d ? (d === "buy" ? "bg-emerald-500 text-black" : "bg-red-500 text-white") : "bg-secondary/50 text-muted-foreground hover:bg-secondary"}`}>
                            {d === "buy" ? "▲ Buy" : "▼ Sell"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Strategy Rule Selection */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block flex items-center justify-between">
                      <span>Playbook Strategy Setup</span>
                      <span className="text-[10px] text-emerald-400 font-mono">Linked to Digital Library</span>
                    </label>
                    <select
                      value={form.strategy}
                      onChange={e => setForm({ ...form, strategy: e.target.value })}
                      className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm text-emerald-400 font-medium"
                    >
                      {playbookStrategies.map(s => (
                        <option key={s.id} value={s.name} className="bg-[#18181b] text-white">
                          {s.name} • {s.category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Prices row */}
                  <div className="grid grid-cols-2 gap-3">
                    {[["Entry", "entry_price"], ["Exit", "exit_price"], ["Stop Loss", "sl"], ["Take Profit", "tp"]].map(([label, key]) => (
                      <div key={key}>
                        <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
                        <Input placeholder="0.00" type="number" step="any"
                          value={(form as any)[key]}
                          onChange={e => setForm({ ...form, [key]: e.target.value })} />
                      </div>
                    ))}
                  </div>

                  {/* Result row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Pips</label>
                      <Input placeholder="e.g. 42" type="number" step="any" value={form.pips} onChange={e => setForm({ ...form, pips: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">P&L ($)</label>
                      <Input placeholder="e.g. 150.00" type="number" step="any" value={form.result} onChange={e => setForm({ ...form, result: e.target.value })} />
                    </div>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Trade Date</label>
                    <Input type="date" value={form.trade_date} onChange={e => setForm({ ...form, trade_date: e.target.value })} />
                  </div>

                  {/* Mood */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">Mood / Psychology</label>
                    <div className="flex gap-2">
                      {MOODS.map(m => (
                        <button key={m.emoji} title={m.label}
                          onClick={() => setForm({ ...form, mood: m.emoji })}
                          className={`text-2xl p-2 rounded-lg transition-all ${form.mood === m.emoji ? "bg-emerald-500/20 scale-110 ring-1 ring-emerald-500/50" : "hover:bg-secondary"}`}>
                          {m.emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Notes / Reasoning</label>
                    <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                      placeholder="Why did you take this trade? What did you see?"
                      className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm min-h-[80px] resize-none" />
                  </div>

                  <Button onClick={saveTrade} disabled={saving} className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold">
                    {saving ? "Saving..." : "Save Trade"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            </div>
          </div>

          {/* MacroShock Radar Economic Shock Calendar */}
          <div className="mb-8">
            <MacroShockRadar />
          </div>

          {/* Prop Firm Evaluation Combine Scorecard */}
          <div className="mb-8">
            <PropFirmScorecard />
          </div>

          {/* NeuroTrader Sentinel Real-Time Tilt Radar */}
          <div className="mb-8">
            <NeuroSentinelWidget currentFormTrade={form} recentTrades={trades} />
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Trades", value: totalTrades, icon: BarChart3, color: "text-blue-400" },
              { label: "Win Rate", value: `${winRate}%`, icon: Target, color: "text-emerald-400" },
              { label: "Total Pips", value: totalPips > 0 ? `+${totalPips.toFixed(1)}` : totalPips.toFixed(1), icon: Flame, color: totalPips >= 0 ? "text-emerald-400" : "text-red-400" },
              { label: "Net P&L", value: `$${totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}`, icon: totalPnl >= 0 ? TrendingUp : TrendingDown, color: totalPnl >= 0 ? "text-emerald-400" : "text-red-400" },
            ].map((s, i) => (
              <Card key={i} className="border-border/50 bg-card/50 backdrop-blur">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">{s.label}</span>
                    <s.icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                  <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="history" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="history">📋 Trade History</TabsTrigger>
              <TabsTrigger value="playbook">🎯 Strategy Edge Matrix</TabsTrigger>
              <TabsTrigger value="analytics">📊 Analytics</TabsTrigger>
            </TabsList>

            {/* Trade History */}
            <TabsContent value="history">
              <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">All Trades</CardTitle>
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <select value={filterPair} onChange={e => setFilterPair(e.target.value)}
                      className="bg-secondary/50 border border-border rounded-lg px-2 py-1 text-xs">
                      <option value="All">All Pairs</option>
                      {PAIRS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-12 text-muted-foreground">Loading trades...</div>
                  ) : filtered.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">No trades logged yet.</p>
                      <Button onClick={() => setDialogOpen(true)} variant="outline">Log Your First Trade</Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border/50 text-xs text-muted-foreground">
                            <th className="text-left py-2 pr-4">Date</th>
                            <th className="text-left py-2 pr-4">Pair</th>
                            <th className="text-left py-2 pr-4">Dir.</th>
                            <th className="text-left py-2 pr-4">Strategy</th>
                            <th className="text-right py-2 pr-4">Entry</th>
                            <th className="text-right py-2 pr-4">Exit</th>
                            <th className="text-right py-2 pr-4">Pips</th>
                            <th className="text-right py-2 pr-4">P&L</th>
                            <th className="text-center py-2 pr-4">Mood</th>
                            <th className="text-left py-2">Notes</th>
                            <th />
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.map(t => (
                            <tr key={t.id} className="border-b border-border/20 hover:bg-secondary/20 transition-colors">
                              <td className="py-3 pr-4 text-muted-foreground text-xs">{t.trade_date}</td>
                              <td className="py-3 pr-4 font-semibold">{t.pair}</td>
                              <td className="py-3 pr-4">
                                <Badge className={`text-xs ${t.direction === "buy" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                                  {t.direction === "buy" ? <ChevronUp className="w-3 h-3 inline" /> : <ChevronDown className="w-3 h-3 inline" />}
                                  {t.direction.toUpperCase()}
                                </Badge>
                              </td>
                              <td className="py-3 pr-4">
                                <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-300 border-emerald-500/20 font-mono">
                                  {t.strategy || "Standard Setup"}
                                </Badge>
                              </td>
                              <td className="py-3 pr-4 text-right font-mono text-xs">{t.entry_price ?? "—"}</td>
                              <td className="py-3 pr-4 text-right font-mono text-xs">{t.exit_price ?? "—"}</td>
                              <td className={`py-3 pr-4 text-right font-mono font-semibold text-xs ${(t.pips ?? 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                {t.pips != null ? `${t.pips > 0 ? "+" : ""}${t.pips}` : "—"}
                              </td>
                              <td className={`py-3 pr-4 text-right font-mono font-bold text-xs ${(t.result ?? 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                {t.result != null ? `$${t.result > 0 ? "+" : ""}${t.result.toFixed(2)}` : "—"}
                              </td>
                              <td className="py-3 pr-4 text-center text-lg">{t.mood ?? "—"}</td>
                              <td className="py-3 pr-4 text-muted-foreground text-xs max-w-[160px] truncate">{t.notes ?? "—"}</td>
                              <td className="py-3">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setReplayTrade(t)}
                                    className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 p-1 h-auto"
                                    title="Replay in 3D Trade Time Machine"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => deleteTrade(t.id)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1 h-auto">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Strategy Edge Matrix Tab */}
            <TabsContent value="playbook">
              <div className="space-y-6">
                <Card className="border-border/50 bg-card/50 backdrop-blur">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Target className="w-5 h-5 text-emerald-400" /> Playbook Strategy Edge Matrix
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground mt-1">
                          Statistical performance grouped by your digital library trading setups.
                        </CardDescription>
                      </div>
                      <Button onClick={() => navigate("/library")} variant="outline" className="text-xs border-emerald-500/30 text-emerald-400">
                        <BookOpen className="w-3.5 h-3.5 mr-1.5" /> Explore Digital Library
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {playbookStrategies.map((strat) => {
                        const stratTrades = trades.filter(t => t.strategy === strat.name);
                        const count = stratTrades.length;
                        const wins = stratTrades.filter(t => (t.result ?? 0) > 0).length;
                        const wr = count > 0 ? Math.round((wins / count) * 100) : strat.winRateEstimate;
                        const pnl = stratTrades.reduce((sum, t) => sum + (t.result ?? 0), 0);

                        return (
                          <div key={strat.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3 hover:border-emerald-500/30 transition-all">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <Badge className="bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border-emerald-500/20 mb-1">
                                  {strat.category}
                                </Badge>
                                <h4 className="font-bold text-sm text-white">{strat.name}</h4>
                                <span className="text-[11px] text-muted-foreground">Source: {strat.sourceBookTitle}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-xs font-mono font-bold text-emerald-400">{wr}% Win Rate</span>
                                <div className="text-[10px] text-muted-foreground font-mono">{count} logged trade{count !== 1 ? 's' : ''}</div>
                              </div>
                            </div>

                            <div className="space-y-1 bg-black/40 p-2.5 rounded-lg border border-white/5 text-[11px] font-mono text-gray-300">
                              <div><strong className="text-emerald-400">Target R:R:</strong> {strat.targetRR}</div>
                              <div><strong className="text-yellow-400">Timeframe:</strong> {strat.timeframe}</div>
                              <div className="truncate"><strong className="text-red-400">Invalidation:</strong> {strat.invalidation}</div>
                            </div>

                            <div className="flex items-center justify-between text-xs pt-1">
                              <span className={`font-mono font-semibold ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                Net P&L: {pnl >= 0 ? `+$${pnl.toFixed(2)}` : `-$${Math.abs(pnl).toFixed(2)}`}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => navigate("/library")}
                                className="h-6 text-[10px] text-emerald-400 hover:text-emerald-300 p-1"
                              >
                                Study Setup in Book →
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* AutoPlaybook Quant Optimizer */}
                <AutoOptimizerCard />
              </div>
            </TabsContent>

            {/* Analytics */}
            <TabsContent value="analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* P&L Calendar Heatmap */}
                <Card className="border-border/50 bg-card/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Calendar className="w-4 h-4 text-emerald-400" /> P&L Calendar (Last 35 days)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-1.5">
                      {calDays.map(day => {
                        const pnl = tradesByDate[day];
                        const bg = pnl === undefined ? "bg-secondary/30" : pnl > 0 ? "bg-emerald-500/70" : pnl < 0 ? "bg-red-500/60" : "bg-secondary/50";
                        return (
                          <div key={day} title={`${day}: ${pnl !== undefined ? `$${pnl.toFixed(2)}` : "No trades"}`}
                            className={`h-8 rounded-md ${bg} cursor-default transition-transform hover:scale-110 flex items-center justify-center text-[9px] font-mono`}>
                            {pnl !== undefined && (pnl > 0 ? "+" : pnl < 0 ? "-" : "·")}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500/70 inline-block" />Win Day</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500/60 inline-block" />Loss Day</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-secondary/30 inline-block" />No Trade</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Win Rate Donut + Pair Breakdown */}
                <Card className="border-border/50 bg-card/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Target className="w-4 h-4 text-blue-400" /> Performance Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {totalTrades === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">Log trades to see analytics</div>
                    ) : (
                      <div className="space-y-4">
                        {/* Win/Loss bar */}
                        <div>
                          <div className="flex justify-between text-xs mb-1.5 text-muted-foreground">
                            <span>Win Rate: {winRate}%</span>
                            <span>{wins}W / {totalTrades - wins}L</span>
                          </div>
                          <div className="h-3 bg-red-500/30 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${winRate}%` }} />
                          </div>
                        </div>

                        {/* Pair breakdown */}
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">P&L by Pair</p>
                          {Object.entries(
                            trades.reduce((acc, t) => {
                              acc[t.pair] = (acc[t.pair] ?? 0) + (t.result ?? 0);
                              return acc;
                            }, {} as Record<string, number>)
                          ).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([pair, pnl]) => (
                            <div key={pair} className="flex items-center justify-between py-1.5 border-b border-border/20 last:border-0">
                              <span className="text-xs font-medium">{pair}</span>
                              <span className={`text-xs font-mono font-bold ${pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Mood breakdown */}
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">Trades by Mood</p>
                          <div className="flex flex-wrap gap-2">
                            {MOODS.map(m => {
                              const count = trades.filter(t => t.mood === m.emoji).length;
                              if (count === 0) return null;
                              return (
                                <div key={m.emoji} title={m.label} className="flex items-center gap-1 bg-secondary/50 rounded-full px-2 py-1 text-xs">
                                  <span>{m.emoji}</span>
                                  <span className="text-muted-foreground">{count}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* 3D Trade Time Machine Replay Modal */}
      <TradeTimeMachineModal
        isOpen={replayTrade !== null}
        onClose={() => setReplayTrade(null)}
        trade={replayTrade}
      />

      {/* Universal Broker Sync Modal */}
      <BrokerSyncModal
        isOpen={brokerSyncOpen}
        onClose={() => setBrokerSyncOpen(false)}
      />
    </div>
  );
}
