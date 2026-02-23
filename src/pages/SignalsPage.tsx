import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SEO from "@/components/SEO";
import {
  Radio, Shield, TrendingUp, Star, Filter, Grid, List,
  CheckCircle, Users, Zap, Play, X, Bot, BarChart3
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdvancedRealTimeChart } from "@/components/AdvancedRealTimeChart";
import { RiskManager } from "@/components/RiskManager";
import { TradeCopier } from "@/components/TradeCopier";
import { BacktestSimulator, Candle, PriceLevel, DeepModelMetrics } from "@/lib/backtestSimulator";

// ── Utility: forex pair → Binance symbol ────────────────────────────
function toBinance(pair: string): string {
  const map: Record<string, string> = {
    "EURUSD": "EURUSDT",
    "GBPUSD": "GBPUSDT",
    "XAUUSD": "XAUUSDT",
    "XAGUSD": "XAGUSDT",
    "BTCUSDT": "BTCUSDT",
    "USDJPY": "EURUSDT",   // Binance is crypto-only; fallback to EUR for JPY pairs
    "GBPJPY": "GBPUSDT",
    "EURJPY": "EURUSDT",
    "AUDJPY": "EURUSDT",
    "AUDUSD": "EURUSDT",
    "USDCAD": "EURUSDT",
    "NZDUSD": "EURUSDT",
    "EURGBP": "GBPUSDT",
    "All Majors": "EURUSDT",
  };
  return map[pair] || "EURUSDT";
}

// ── Signal Data ─────────────────────────────────────────────────────
const signals = [
  {
    id: 1, name: "Alpha Signals Pro", provider: "AlphaEdge Capital", avatar: "AS",
    price: 149, pricePeriod: "month", winRate: 78, avgPips: 42, signalsPerDay: 5,
    subscribers: 2847, rating: 4.9, reviews: 312, verified: true, featured: true,
    pairs: ["EURUSD", "GBPUSD", "XAUUSD"], style: "Smart Money",
    description: "Institutional-grade signals based on order flow and liquidity zones. Average 200+ pips weekly.",
  },
  {
    id: 2, name: "Scalp Master Alerts", provider: "Precision Pro", avatar: "SM",
    price: 79, pricePeriod: "month", winRate: 72, avgPips: 15, signalsPerDay: 12,
    subscribers: 1923, rating: 4.7, reviews: 187, verified: true, featured: true,
    pairs: ["EURUSD", "USDJPY", "GBPJPY"], style: "Scalping",
    description: "High-frequency scalp signals during London and NY sessions. Quick in, quick out.",
  },
  {
    id: 3, name: "Gold Rush Signals", provider: "Vortex Systems", avatar: "GR",
    price: 199, pricePeriod: "month", winRate: 74, avgPips: 85, signalsPerDay: 3,
    subscribers: 1456, rating: 4.8, reviews: 156, verified: true, featured: false,
    pairs: ["XAUUSD", "XAGUSD"], style: "Metals Only",
    description: "Specialized in precious metals. Capture major moves in Gold and Silver.",
  },
  {
    id: 4, name: "Swing Elite", provider: "Trend Rider", avatar: "SE",
    price: 99, pricePeriod: "month", winRate: 68, avgPips: 120, signalsPerDay: 2,
    subscribers: 987, rating: 4.6, reviews: 98, verified: true, featured: false,
    pairs: ["EURUSD", "AUDUSD", "USDCAD", "NZDUSD"], style: "Swing Trading",
    description: "Multi-day swing trades with excellent risk-to-reward. Hold times 2–5 days.",
  },
  {
    id: 5, name: "Asian Session Pro", provider: "Night Owl Trading", avatar: "AP",
    price: 69, pricePeriod: "month", winRate: 71, avgPips: 28, signalsPerDay: 6,
    subscribers: 743, rating: 4.5, reviews: 67, verified: true, featured: false,
    pairs: ["USDJPY", "AUDJPY", "EURJPY"], style: "Asian Session",
    description: "Perfect for traders in Asia-Pacific. Catch JPY moves while others sleep.",
  },
  {
    id: 6, name: "News Sniper", provider: "Momentum Masters", avatar: "NS",
    price: 129, pricePeriod: "month", winRate: 65, avgPips: 65, signalsPerDay: 4,
    subscribers: 612, rating: 4.4, reviews: 54, verified: true, featured: false,
    pairs: ["EURUSD", "GBPUSD", "XAUUSD"], style: "News Trading",
    description: "Trade high-impact news events with precision. NFP, FOMC, CPI specialists.",
  },
];

const styles = ["All Styles", "Smart Money", "Scalping", "Swing Trading", "News Trading", "Asian Session", "Metals Only"];
const priceRanges = ["All Prices", "Under $50", "$50–$100", "$100–$200", "$200+"];

// ── Live mini-price component ────────────────────────────────────────
function PriceBadge({ pair, prices }: { pair: string; prices: Record<string, number> }) {
  const p = prices[pair];
  const isGold = pair === "XAUUSD" || pair === "XAGUSD";
  const isCrypto = pair.endsWith("USDT");
  const formatted = p ? (isGold || isCrypto ? p.toFixed(2) : p.toFixed(5)) : "···";
  return (
    <span className="flex items-center gap-1 font-mono text-[10px] bg-black/50 border border-white/10 rounded-full px-2 py-0.5">
      <span className={`w-1.5 h-1.5 rounded-full ${p ? "bg-emerald-500 animate-pulse" : "bg-gray-600"}`} />
      <span className="text-gray-400">{pair}</span>
      <span className="text-white font-semibold">{formatted}</span>
    </span>
  );
}

export default function SignalsPage() {
  const [selectedStyle, setSelectedStyle] = useState("All Styles");
  const [selectedPrice, setSelectedPrice] = useState("All Prices");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // ── Live prices via Binance REST (refreshed every 5s) ────────────
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});
  useEffect(() => {
    const pairs: [string, string][] = [
      ["EURUSDT", "EURUSD"], ["GBPUSDT", "GBPUSD"],
      ["XAUUSDT", "XAUUSD"], ["XAGUSDT", "XAGUSD"],
    ];
    const fetchAll = () => {
      pairs.forEach(([binance, display]) => {
        fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${binance}`)
          .then(r => r.json())
          .then(d => { if (d.price) setLivePrices(p => ({ ...p, [display]: parseFloat(d.price) })); })
          .catch(() => { });
      });
    };
    fetchAll();
    const id = setInterval(fetchAll, 5000);
    return () => clearInterval(id);
  }, []);

  // ── Backtest/Live state ──────────────────────────────────────────
  const [activeSignal, setActiveSignal] = useState<typeof signals[0] | null>(null);
  const [activePair, setActivePair] = useState("EURUSD");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [currentCandle, setCurrentCandle] = useState<Candle | null>(null);
  const [volumeProfile, setVolumeProfile] = useState<PriceLevel[]>([]);
  const [deepMetrics, setDeepMetrics] = useState<DeepModelMetrics | undefined>(undefined);
  const [simMetrics, setSimMetrics] = useState({
    totalTrades: 0, winRate: 0, profitFactor: 0, maxDrawdown: 0,
    netProfit: 0, initialBalance: 500000, activeTrade: null as any,
    floatingPL: 0, equity: 500000, symbol: "EURUSD",
  });
  const simulatorRef = useRef<BacktestSimulator | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const stopFeed = useCallback(() => {
    if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    stopFeed();
  }, [stopFeed]);

  // ── Launch live backtest for a signal ─────────────────────────────
  const launchBacktest = useCallback(async (signal: typeof signals[0], pair: string) => {
    setActiveSignal(signal);
    setActivePair(pair);
    setIsModalOpen(true);
    setCandles([]); setCurrentCandle(null); setVolumeProfile([]); setDeepMetrics(undefined);
    stopFeed();

    const isMetals = pair === "XAUUSD" || pair === "XAGUSD";
    const isScalp = signal.style === "Scalping";
    const avgWin = isMetals ? 800 : isScalp ? 50 : 150;
    const avgLoss = isMetals ? 600 : isScalp ? 40 : 100;
    const volatility = isMetals ? 45 : 15;

    simulatorRef.current = new BacktestSimulator({
      initialBalance: 500000,
      winRate: signal.winRate / 100,
      avgWin, avgLoss, volatility,
      symbol: pair,
    });

    const updateMetrics = () => {
      if (!simulatorRef.current) return;
      const m = simulatorRef.current.getMetrics();
      setSimMetrics({
        totalTrades: m.totalTrades, winRate: m.winRate, profitFactor: m.profitFactor,
        maxDrawdown: m.maxDrawdown, netProfit: m.netProfit, initialBalance: m.initialBalance,
        activeTrade: m.activeTrade ?? null, floatingPL: m.floatingPL ?? 0,
        equity: m.equity ?? m.initialBalance, symbol: m.symbol ?? pair,
      });
    };

    const binanceSym = toBinance(pair);

    try {
      const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${binanceSym}&interval=1m&limit=500`);
      const klines = await res.json();
      if (!Array.isArray(klines)) throw new Error("Bad klines response");

      klines.forEach((k: any) => {
        const [time, open, high, low, close, volume, , quoteVol, , takerBuy] = k;
        simulatorRef.current?.processHistoricalCandle({
          time: Number(time), open: +open, high: +high, low: +low, close: +close,
          volume: +volume, buyVolume: +takerBuy, sellVolume: +volume - +takerBuy,
          footprint: {
            [(+close).toFixed(4)]: { price: +close, volume: +volume, buyVolume: +takerBuy, sellVolume: +volume - +takerBuy }
          },
          vwap: +volume > 0 ? +quoteVol / +volume : +close,
          cvd: +takerBuy - (+volume - +takerBuy),
          ivbTop: +high, ivbBottom: +low, deepEffort: 0, vTracker: 0,
        });
      });

      if (simulatorRef.current) {
        const m = simulatorRef.current.getMetrics();
        setCandles([...(m.history || [])]);
        setCurrentCandle({ ...(simulatorRef.current as any)['state'].currentCandle });
        setVolumeProfile([...(m.volumeProfile || [])]);
        updateMetrics();
      }

      const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${binanceSym.toLowerCase()}@aggTrade`);
      wsRef.current = ws;
      let lastUI = 0;

      ws.onopen = () => console.log(`[Signals] Connected to ${binanceSym}`);
      ws.onmessage = (ev) => {
        if (!simulatorRef.current) return;
        const t = JSON.parse(ev.data);
        const result = simulatorRef.current.processTick(parseFloat(t.p), parseFloat(t.q), t.m);
        const now = Date.now();
        if (now - lastUI > 250) {
          const m = simulatorRef.current.getMetrics();
          setCandles([...(m.history || [])]);
          setCurrentCandle({ ...result.currentCandle });
          setVolumeProfile([...(m.volumeProfile || [])]);
          setDeepMetrics(result.deepMetrics);
          updateMetrics();
          lastUI = now;
        }
      };
      ws.onerror = (e) => console.error("[Signals] WS Error:", e);
    } catch (err) {
      console.error("[Signals] Failed to load market data:", err);
    }
  }, [stopFeed]);

  // ── Filtering ────────────────────────────────────────────────────
  const filtered = signals.filter(s => {
    const styleOk = selectedStyle === "All Styles" || s.style === selectedStyle;
    let priceOk = true;
    if (selectedPrice === "Under $50") priceOk = s.price < 50;
    if (selectedPrice === "$50–$100") priceOk = s.price >= 50 && s.price <= 100;
    if (selectedPrice === "$100–$200") priceOk = s.price > 100 && s.price <= 200;
    if (selectedPrice === "$200+") priceOk = s.price > 200;
    return styleOk && priceOk;
  });

  // ── Live price shown in header for active pair ────────────────────
  const headerPrice = livePrices[activePair];
  const isGoldPair = activePair === "XAUUSD" || activePair === "XAGUSD";
  const headerPriceStr = headerPrice
    ? (isGoldPair ? headerPrice.toFixed(2) : headerPrice.toFixed(5))
    : "—";

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Forex Signals" description="Daily forex signals from verified profitable traders with live backtesting." />

      {/* ── Hero ── */}
      <section className="pt-32 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent" />
        <div className="container mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 mb-6">
              <Radio className="w-3 h-3 mr-1" /> Premium Signal Providers
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-foreground">Forex </span>
              <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">Signals</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Copy trades from verified profitable traders with live Binance price feeds and real-time backtesting.
            </p>
          </div>

          {/* Live Ticker Bar */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {[["EURUSD", "🇪🇺"], ["GBPUSD", "🇬🇧"], ["XAUUSD", "🥇"], ["XAGUSD", "🥈"]].map(([pair, flag]) => (
              <div key={pair} className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-full px-4 py-1.5 text-sm font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-gray-400">{flag} {pair}</span>
                <span className="text-white font-bold">
                  {livePrices[pair]
                    ? (pair === "XAUUSD" || pair === "XAGUSD"
                      ? livePrices[pair].toFixed(2)
                      : livePrices[pair].toFixed(5))
                    : "···"}
                </span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 max-w-3xl mx-auto">
            {[
              { label: "Active Providers", value: "247", icon: Users },
              { label: "Avg Win Rate", value: "71%", icon: TrendingUp },
              { label: "Monthly Signals", value: "12K+", icon: Zap },
              { label: "Total Subscribers", value: "45K+", icon: CheckCircle },
            ].map((s, i) => (
              <div key={i} className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 text-center">
                <s.icon className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Filters ── */}
      <section className="py-5 px-4 border-y border-border/50 bg-card/20 backdrop-blur-sm sticky top-16 z-10">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            {[
              { val: selectedStyle, set: setSelectedStyle, opts: styles },
              { val: selectedPrice, set: setSelectedPrice, opts: priceRanges },
            ].map((sel, i) => (
              <select key={i} value={sel.val} onChange={e => sel.set(e.target.value)}
                className="bg-secondary/50 border border-border rounded-lg px-3 py-1.5 text-sm">
                {sel.opts.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("grid")}><Grid className="w-4 h-4" /></Button>
            <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("list")}><List className="w-4 h-4" /></Button>
          </div>
        </div>
      </section>

      {/* ── Signal Cards ── */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          {filtered.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              <p>No signal providers match your filters.</p>
              <button onClick={() => { setSelectedStyle("All Styles"); setSelectedPrice("All Prices"); }}
                className="mt-3 text-cyan-400 underline text-sm">Clear filters</button>
            </div>
          )}

          <div className={`grid gap-6 ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
            {filtered.map(signal => (
              <div key={signal.id}
                className="group bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 flex flex-col">

                {signal.featured && (
                  <Badge className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white mb-4 w-fit">⭐ Featured</Badge>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center font-bold text-white shrink-0">
                      {signal.avatar}
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground flex items-center gap-2 text-sm">
                        {signal.name}
                        {signal.verified && <Shield className="w-4 h-4 text-emerald-400" />}
                      </h3>
                      <p className="text-xs text-muted-foreground">{signal.provider}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-400 shrink-0">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-semibold text-sm">{signal.rating}</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4">{signal.description}</p>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { v: `${signal.winRate}%`, l: "Win Rate", c: "text-emerald-400" },
                    { v: `${signal.avgPips}`, l: "Avg Pips", c: "text-cyan-400" },
                    { v: `${signal.signalsPerDay}/d`, l: "Daily", c: "text-white" },
                  ].map(({ v, l, c }) => (
                    <div key={l} className="text-center p-2 bg-secondary/30 rounded-lg">
                      <div className={`font-bold text-sm ${c}`}>{v}</div>
                      <div className="text-[10px] text-muted-foreground">{l}</div>
                    </div>
                  ))}
                </div>

                {/* Pairs with live prices */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {signal.pairs.map(pair => (
                    <PriceBadge key={pair} pair={pair} prices={livePrices} />
                  ))}
                </div>

                {/* Backtest bar chart preview */}
                <div className="h-10 mb-4 rounded overflow-hidden bg-black/30 border border-white/5 flex items-end gap-px px-1">
                  {Array.from({ length: 28 }).map((_, i) => {
                    const isWin = Math.random() < signal.winRate / 100;
                    const h = 20 + Math.random() * 80;
                    return <div key={i} style={{ height: `${h}%`, flex: 1 }}
                      className={`rounded-sm ${isWin ? "bg-emerald-500/60" : "bg-red-500/40"}`} />;
                  })}
                </div>

                {/* Price + Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-auto">
                  <div>
                    <span className="text-2xl font-bold">${signal.price}</span>
                    <span className="text-muted-foreground text-sm">/{signal.pricePeriod}</span>
                  </div>
                  <div className="flex gap-2">
                    {/* Pair selector + Live Backtest button */}
                    <div className="flex rounded-lg overflow-hidden border border-cyan-500/30">
                      {signal.pairs.slice(0, 3).map(pair => (
                        <button
                          key={pair}
                          onClick={() => launchBacktest(signal, pair)}
                          title={`Live backtest on ${pair}`}
                          className="px-2 py-1.5 text-[9px] font-bold text-cyan-400 hover:bg-cyan-500/20 transition-colors border-r border-cyan-500/20 last:border-r-0 bg-cyan-500/5"
                        >
                          {pair === "XAUUSD" ? "Au" : pair.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      className="gap-1 bg-cyan-500 hover:bg-cyan-600 text-black font-semibold text-xs px-3"
                      onClick={() => launchBacktest(signal, signal.pairs[0])}
                    >
                      <Play className="w-3.5 h-3.5" /> Live Backtest
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
                  <span><Users className="w-3 h-3 inline mr-0.5" />{signal.subscribers.toLocaleString()} subscribers</span>
                  <span>{signal.reviews} reviews</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" size="lg">Load More Signals</Button>
          </div>
        </div>
      </section>

      {/* ── Live Backtest Modal ── */}
      <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent className="max-w-7xl bg-black/97 border-cyan-500/20 text-foreground h-[92vh] flex flex-col p-0">
          <DialogHeader className="px-5 pt-4 pb-0 shrink-0">
            <DialogTitle className="flex items-center gap-3 text-lg flex-wrap">
              <Radio className="w-5 h-5 text-cyan-400" />
              <span>Signal Backtest:</span>
              <span className="text-cyan-400">{activeSignal?.name}</span>

              {/* Live price pill */}
              <span className="flex items-center gap-2 bg-black/60 border border-cyan-500/30 rounded-full px-3 py-0.5 text-sm font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse inline-block" />
                <span className="text-cyan-400 font-bold">{activePair}</span>
                <span className="text-white">{headerPriceStr}</span>
              </span>

              {/* Pair switcher in header */}
              {activeSignal && activeSignal.pairs.length > 1 && (
                <div className="flex gap-1">
                  {activeSignal.pairs.map(pair => (
                    <button key={pair}
                      onClick={() => launchBacktest(activeSignal, pair)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${activePair === pair ? "bg-cyan-500 text-black" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}>
                      {pair === "XAUUSD" ? "GOLD" : pair}
                    </button>
                  ))}
                </div>
              )}

              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/40 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse inline-block" />
                LIVE BINANCE
              </Badge>
              <Badge variant="outline" className="bg-purple-500/10 text-purple-300 border-purple-500/40 text-xs">1:3000</Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden px-4 pb-2 pt-3">
            <Tabs defaultValue="chart" className="w-full h-full flex flex-col">
              <TabsList className="w-full justify-start rounded-none border-b border-border/50 bg-transparent h-auto p-0 mb-3 shrink-0">
                <TabsTrigger value="chart" className="data-[state=active]:bg-secondary/50 rounded-t-lg px-4 py-2 ring-transparent text-sm">📈 Live Chart</TabsTrigger>
                <TabsTrigger value="risk" className="data-[state=active]:bg-secondary/50 rounded-t-lg px-4 py-2 ring-transparent text-sm">🛡 Risk Manager</TabsTrigger>
                <TabsTrigger value="copier" className="data-[state=active]:bg-secondary/50 rounded-t-lg px-4 py-2 ring-transparent text-sm">🔗 Trade Copier</TabsTrigger>
              </TabsList>
              <TabsContent value="chart" className="flex-1 mt-0 outline-none overflow-hidden">
                <AdvancedRealTimeChart
                  candles={candles} currentCandle={currentCandle}
                  volumeProfile={volumeProfile} metrics={simMetrics}
                  deepMetrics={deepMetrics} isActive={isModalOpen} />
              </TabsContent>
              <TabsContent value="risk" className="flex-1 mt-0 outline-none overflow-y-auto"><RiskManager /></TabsContent>
              <TabsContent value="copier" className="flex-1 mt-0 outline-none overflow-y-auto"><TradeCopier /></TabsContent>
            </Tabs>
          </div>

          <div className="flex justify-between items-center bg-black/60 px-4 py-2.5 border-t border-white/8 shrink-0">
            <div className="flex gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Buy Volume</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> Sell Volume</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /> POC</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-300" /> VWAP</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={closeModal}>
                <X className="w-3.5 h-3.5 mr-1" /> Close
              </Button>
              <Button
                size="sm"
                className="gap-1.5 bg-red-500/10 text-red-400 border border-red-500/40 hover:bg-red-500/20"
                onClick={closeModal}
              >
                <Bot className="w-3.5 h-3.5" /> Stop Feed
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
