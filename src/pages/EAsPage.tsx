import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SEO from "@/components/SEO";
import {
  Bot, Shield, TrendingUp, Star, Filter, Grid, List,
  Download, Zap, Play, BarChart3, Search, X, GitCompare,
  CheckCircle2, Heart, ArrowUpDown, Cpu, Sparkles
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdvancedRealTimeChart } from "@/components/AdvancedRealTimeChart";
import { RiskManager } from "@/components/RiskManager";
import { TradeCopier } from "@/components/TradeCopier";
import { BacktestSimulator, Candle, PriceLevel, DeepModelMetrics } from "@/lib/backtestSimulator";
import { useWatchlist } from "@/hooks/useWatchlist";
import { AgentSwarmWarRoom } from "@/components/quant/AgentSwarmWarRoom";

// ── Sparkline Component ──────────────────────────────────────────
function Sparkline({ gain }: { gain: number }) {
  const points: number[] = [];
  let v = 100;
  for (let i = 0; i < 20; i++) {
    v += (Math.random() - (gain > 0 ? 0.35 : 0.55)) * 4;
    points.push(Math.max(80, Math.min(160, v)));
  }
  const min = Math.min(...points);
  const max = Math.max(...points);
  const h = 36, w = 100;
  const pts = points
    .map((p, i) => `${(i / (points.length - 1)) * w},${h - ((p - min) / (max - min + 0.1)) * h}`)
    .join(' ');
  const color = gain > 0 ? '#26a69a' : '#ef5350';
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-9" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <polyline points={`0,${h} ${pts} ${w},${h}`} fill={`${color}22`} />
    </svg>
  );
}

// ── EA Data ───────────────────────────────────────────────────────
const hiveMindSwarmEA = {
  id: 999,
  name: "HiveMind™ 10-Agent Swarm",
  developer: "AlphaFlow Institutional Lab",
  avatar: "👑",
  price: 499,
  originalPrice: 1999,
  backtest: { gain: 2480, drawdown: 9.8, profitFactor: 3.42, winRate: 78, monthlyReturn: 16.5, sharpe: 3.4 },
  trades: 94210,
  years: 5,
  rating: 5.0,
  reviews: 642,
  verified: true,
  featured: true,
  isNew: true,
  isHot: true,
  isSale: true,
  hasTrial: true,
  platform: "MT5 / Web HFT",
  style: "AI/ML",
  pairs: ["EURUSD", "BTCUSDT", "XAUUSD", "GBPUSD"],
  description: "Autonomous 10-Agent quantitative ensemble coordinating order flow, SMC sweeps, vision recognition, and Monte Carlo risk veto.",
  downloads: 7840
};

const eas = [
  hiveMindSwarmEA,
  { id: 1, name: "Vortex Sniper EA", developer: "Vortex Systems", avatar: "VS", price: 197, originalPrice: 799, backtest: { gain: 847, drawdown: 12.4, profitFactor: 2.8, winRate: 68, monthlyReturn: 8.4, sharpe: 2.1 }, trades: 15420, years: 5, rating: 4.9, reviews: 423, verified: true, featured: true, isNew: false, isHot: true, isSale: true, hasTrial: false, platform: "MT4/MT5", style: "Smart Money", pairs: ["EURUSD", "GBPUSD", "XAUUSD"], description: "Institutional-grade EA using order flow analysis and liquidity zones. Proven 5-year track record.", downloads: 2847 },
  { id: 2, name: "Grid Master Pro", developer: "GridMaster Elite", avatar: "GM", price: 97, originalPrice: 499, backtest: { gain: 523, drawdown: 18.7, profitFactor: 2.1, winRate: 72, monthlyReturn: 6.1, sharpe: 1.6 }, trades: 48721, years: 4, rating: 4.7, reviews: 287, verified: true, featured: true, isNew: false, isHot: false, isSale: true, hasTrial: true, platform: "MT4/MT5", style: "Grid Trading", pairs: ["All Majors"], description: "Advanced grid system with dynamic lot sizing and smart recovery. Handles ranging markets perfectly.", downloads: 1923 },
  { id: 3, name: "Scalp Fury", developer: "Scalp King", avatar: "SF", price: 79, originalPrice: 349, backtest: { gain: 312, drawdown: 8.9, profitFactor: 2.4, winRate: 76, monthlyReturn: 5.8, sharpe: 2.4 }, trades: 127893, years: 3, rating: 4.8, reviews: 198, verified: true, featured: true, isNew: false, isHot: true, isSale: true, hasTrial: true, platform: "MT5", style: "Scalping", pairs: ["EURUSD", "USDJPY"], description: "High-frequency scalper with ultra-tight stops. Optimized for low-spread brokers.", downloads: 1456 },
  { id: 4, name: "Trend Surfer", developer: "Trend Rider", avatar: "TS", price: 149, originalPrice: 599, backtest: { gain: 445, drawdown: 15.2, profitFactor: 2.3, winRate: 59, monthlyReturn: 5.2, sharpe: 1.8 }, trades: 8934, years: 6, rating: 4.6, reviews: 156, verified: true, featured: false, isNew: false, isHot: false, isSale: true, hasTrial: false, platform: "MT4/MT5", style: "Trend Following", pairs: ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD"], description: "Catches major trends with dynamic trailing stops. Excellent for long-term growth.", downloads: 1124 },
  { id: 5, name: "Gold Miner X", developer: "Vortex Systems", avatar: "GX", price: 229, originalPrice: 899, backtest: { gain: 678, drawdown: 14.1, profitFactor: 2.6, winRate: 63, monthlyReturn: 7.9, sharpe: 2.0 }, trades: 12456, years: 4, rating: 4.8, reviews: 134, verified: true, featured: false, isNew: false, isHot: true, isSale: true, hasTrial: false, platform: "MT4/MT5", style: "Metals Trading", pairs: ["XAUUSD"], description: "Specialized Gold trading EA with volatility filters and session optimization.", downloads: 987 },
  { id: 6, name: "News Trader Bot", developer: "Momentum Masters", avatar: "NT", price: 49, originalPrice: 449, backtest: { gain: 287, drawdown: 22.3, profitFactor: 1.9, winRate: 54, monthlyReturn: 4.1, sharpe: 1.2 }, trades: 3421, years: 3, rating: 4.4, reviews: 89, verified: true, featured: false, isNew: false, isHot: false, isSale: false, hasTrial: true, platform: "MT4/MT5", style: "News Trading", pairs: ["All Majors"], description: "Automated news trading with pre-set entries around high-impact events.", downloads: 743 },
  { id: 7, name: "Crypto Whale Tracker", developer: "DeepCharts Algo", avatar: "BTC", price: 249, originalPrice: 999, backtest: { gain: 1240, drawdown: 25.4, profitFactor: 3.2, winRate: 71, monthlyReturn: 11.2, sharpe: 2.6 }, trades: 84500, years: 4, rating: 5.0, reviews: 512, verified: true, featured: true, isNew: false, isHot: true, isSale: true, hasTrial: false, platform: "MT5", style: "Smart Money", pairs: ["BTCUSDT"], description: "Specialized Bitcoin trading algorithm tracking institutional order flow and volume anomalies.", downloads: 4120 },
  { id: 8, name: "Mean Reversion Pro", developer: "Quant Edge", avatar: "MR", price: 129, originalPrice: 649, backtest: { gain: 391, drawdown: 10.8, profitFactor: 2.5, winRate: 67, monthlyReturn: 4.9, sharpe: 2.2 }, trades: 22100, years: 3, rating: 4.7, reviews: 201, verified: true, featured: false, isNew: true, isHot: false, isSale: true, hasTrial: true, platform: "MT4/MT5", style: "Mean Reversion", pairs: ["EURUSD", "GBPJPY", "EURGBP"], description: "Statistical arbitrage using Z-score deviation from fair value with institutional flow confirmation.", downloads: 631 },
  { id: 9, name: "Breakout Sniper", developer: "Alpha Algo Labs", avatar: "BS", price: 89, originalPrice: 479, backtest: { gain: 558, drawdown: 17.6, profitFactor: 2.2, winRate: 61, monthlyReturn: 6.4, sharpe: 1.9 }, trades: 9820, years: 2, rating: 4.5, reviews: 77, verified: true, featured: false, isNew: true, isHot: false, isSale: false, hasTrial: true, platform: "MT5", style: "Breakout", pairs: ["GBPUSD", "USDJPY", "XAUUSD"], description: "Detects consolidation zones and trades explosive breakouts with adaptive ATR stops.", downloads: 489 },
  { id: 10, name: "AI Momentum Engine", developer: "NeuralFX", avatar: "AI", price: 299, originalPrice: 1299, backtest: { gain: 1820, drawdown: 21.2, profitFactor: 3.7, winRate: 74, monthlyReturn: 14.8, sharpe: 3.1 }, trades: 61200, years: 2, rating: 4.9, reviews: 388, verified: true, featured: true, isNew: true, isHot: true, isSale: true, hasTrial: false, platform: "MT5", style: "AI/ML", pairs: ["EURUSD", "GBPUSD", "XAUUSD", "BTCUSDT"], description: "Neural network trained on 10 years of tick data. Self-adapting to current market regime.", downloads: 2140 },
  { id: 11, name: "Carry Trade Optimizer", developer: "Macro Capital", avatar: "CT", price: 59, originalPrice: 379, backtest: { gain: 248, drawdown: 7.3, profitFactor: 2.0, winRate: 58, monthlyReturn: 3.2, sharpe: 1.5 }, trades: 4120, years: 7, rating: 4.3, reviews: 63, verified: true, featured: false, isNew: false, isHot: false, isSale: false, hasTrial: true, platform: "MT4/MT5", style: "Carry Trade", pairs: ["AUDJPY", "NZDJPY", "CADJPY"], description: "Exploits interest rate differentials with hedging overlay. Consistent low-drawdown returns.", downloads: 298 },
  { id: 12, name: "Fibonacci Maestro", developer: "WaveCount AI", avatar: "FM", price: 119, originalPrice: 549, backtest: { gain: 433, drawdown: 13.8, profitFactor: 2.1, winRate: 62, monthlyReturn: 5.1, sharpe: 1.7 }, trades: 17340, years: 5, rating: 4.6, reviews: 142, verified: true, featured: false, isNew: false, isHot: false, isSale: false, hasTrial: true, platform: "MT4/MT5", style: "Technical", pairs: ["EURUSD", "GBPUSD", "USDJPY"], description: "Elliott Wave + Fibonacci harmonic pattern detection for high-probability reversal trades.", downloads: 872 },
  { id: 13, name: "Session Ninja", developer: "FX Session Labs", avatar: "SN", price: 39, originalPrice: 199, backtest: { gain: 198, drawdown: 9.1, profitFactor: 1.8, winRate: 64, monthlyReturn: 3.6, sharpe: 1.4 }, trades: 31200, years: 3, rating: 4.5, reviews: 95, verified: true, featured: false, isNew: true, isHot: false, isSale: false, hasTrial: true, platform: "MT4/MT5", style: "Scalping", pairs: ["EURUSD", "GBPUSD"], description: "Exploits London & New York session overlaps with pinpoint precision entries. Best for 9–12 GMT.", downloads: 1102 },
  { id: 14, name: "Martingale Shield", developer: "SafeGrid Co", avatar: "MS", price: 0, originalPrice: 99, backtest: { gain: 142, drawdown: 19.5, profitFactor: 1.6, winRate: 70, monthlyReturn: 2.8, sharpe: 1.0 }, trades: 54600, years: 2, rating: 4.2, reviews: 44, verified: true, featured: false, isNew: true, isHot: false, isSale: false, hasTrial: false, platform: "MT4", style: "Grid Trading", pairs: ["EURUSD"], description: "Free starter EA with controlled martingale recovery. Max 3 grid levels to keep risk manageable.", downloads: 3890 },
  { id: 15, name: "Orderflow Phantom", developer: "Smart Capital", avatar: "OP", price: 169, originalPrice: 699, backtest: { gain: 612, drawdown: 11.3, profitFactor: 2.9, winRate: 66, monthlyReturn: 7.2, sharpe: 2.3 }, trades: 19800, years: 4, rating: 4.8, reviews: 177, verified: true, featured: true, isNew: false, isHot: true, isSale: true, hasTrial: false, platform: "MT5", style: "Smart Money", pairs: ["XAUUSD", "GBPUSD", "EURUSD"], description: "Reads institutional order blocks and fair value gaps with live delta confirmation before every entry.", downloads: 1560 },
  { id: 16, name: "Volatility Edge", developer: "StormTrader", avatar: "VE", price: 109, originalPrice: 449, backtest: { gain: 329, drawdown: 16.2, profitFactor: 2.0, winRate: 60, monthlyReturn: 4.5, sharpe: 1.6 }, trades: 7820, years: 3, rating: 4.4, reviews: 58, verified: true, featured: false, isNew: true, isHot: false, isSale: false, hasTrial: true, platform: "MT4/MT5", style: "Breakout", pairs: ["GBPJPY", "USDJPY", "XAUUSD"], description: "Capitalizes on volatility spikes with ATR-based position sizing and automatic news filter.", downloads: 412 },
];

const styles = ["All Styles", "Smart Money", "Grid Trading", "Scalping", "Trend Following", "News Trading", "Metals Trading", "Mean Reversion", "Breakout", "AI/ML", "Carry Trade", "Technical"];
const platforms = ["All Platforms", "MT4", "MT5", "MT4/MT5"];
const priceRanges = ["All Prices", "Free", "Under $100", "$100-$200", "$200-$300", "$300+"];

export default function EAsPage() {
  const [activeView, setActiveView] = useState<"swarm" | "catalog">("swarm");
  const [selectedStyle, setSelectedStyle] = useState("All Styles");
  const [selectedPlatform, setSelectedPlatform] = useState("All Platforms");
  const [selectedPrice, setSelectedPrice] = useState("All Prices");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const { savedIds: watchlistIds, toggle: toggleWatchlist } = useWatchlist("ea");

  // Live prices (Binance)
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});
  useEffect(() => {
    const pairs = [
      ['EURUSDT', 'EURUSD'],
      ['BTCUSDT', 'BTCUSDT'],
      ['XAUUSDT', 'XAUUSD'],
      ['GBPUSDT', 'GBPUSD'],
    ];
    const controllers: AbortController[] = [];
    pairs.forEach(([binance, display]) => {
      const ctrl = new AbortController();
      controllers.push(ctrl);
      fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${binance}`, { signal: ctrl.signal })
        .then(r => r.json())
        .then(d => {
          if (d.price) setLivePrices(prev => ({ ...prev, [display]: parseFloat(d.price) }));
        })
        .catch(() => { });
    });
    return () => controllers.forEach(c => c.abort());
  }, []);

  // Backtest state
  const [isBacktestOpen, setIsBacktestOpen] = useState(false);
  const [activeEA, setActiveEA] = useState<any>(null);
  const [activePair, setActivePair] = useState("EURUSD"); // selected pair for this EA session
  const [simulationMode, setSimulationMode] = useState<"backtest" | "live">("backtest");
  const [candles, setCandles] = useState<Candle[]>([]);
  const [currentCandle, setCurrentCandle] = useState<Candle | null>(null);
  const [volumeProfile, setVolumeProfile] = useState<PriceLevel[]>([]);
  const [deepMetrics, setDeepMetrics] = useState<DeepModelMetrics | undefined>(undefined);
  const [simMetrics, setSimMetrics] = useState({ totalTrades: 0, winRate: 0, profitFactor: 0, maxDrawdown: 0, netProfit: 0, initialBalance: 10000, activeTrade: null as any, floatingPL: 0, equity: 10000, symbol: 'EURUSD' });
  const simulatorRef = useRef<BacktestSimulator | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // ── Filtering ──────────────────────────────────────────────────
  const filteredEAs = eas.filter(ea => {
    if (selectedStyle !== "All Styles" && ea.style !== selectedStyle) return false;
    if (selectedPlatform !== "All Platforms") {
      if (selectedPlatform === "MT4" && !ea.platform.includes("MT4")) return false;
      if (selectedPlatform === "MT5" && !ea.platform.includes("MT5")) return false;
      if (selectedPlatform === "MT4/MT5" && ea.platform !== "MT4/MT5") return false;
    }
    if (selectedPrice !== "All Prices") {
      if (selectedPrice === "Free" && ea.price !== 0) return false;
      if (selectedPrice === "Under $100" && (ea.price === 0 || ea.price >= 100)) return false;
      if (selectedPrice === "$100-$200" && (ea.price < 100 || ea.price > 200)) return false;
      if (selectedPrice === "$200-$300" && (ea.price < 200 || ea.price > 300)) return false;
      if (selectedPrice === "$300+" && ea.price < 300) return false;
    }
    if (search && !ea.name.toLowerCase().includes(search.toLowerCase()) && !ea.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "downloads") return b.downloads - a.downloads;
    if (sortBy === "gain") return b.backtest.gain - a.backtest.gain;
    if (sortBy === "price_asc") return a.price - b.price;
    if (sortBy === "newest") return b.id - a.id;
    // default: featured first
    return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
  });

  // ── Comparison ─────────────────────────────────────────────────
  const toggleCompare = (id: number) => {
    setCompareIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : prev.length < 3 ? [...prev, id] : prev);
  };
  const comparedEAs = eas.filter(e => compareIds.includes(e.id));

  // ── Symbol mapping helper (forex → Binance spot) ─────────────────
  const toBinance = (pair: string): string => {
    const m: Record<string, string> = {
      'EURUSD': 'EURUSDT', 'GBPUSD': 'GBPUSDT', 'XAUUSD': 'PAXGUSDT',
      'XAGUSD': 'PAXGUSDT', 'BTCUSDT': 'BTCUSDT', 'USDJPY': 'BTCUSDT',
      'GBPJPY': 'BTCUSDT', 'EURJPY': 'EURUSDT', 'AUDUSD': 'EURUSDT',
      'USDCAD': 'EURUSDT', 'NZDUSD': 'EURUSDT', 'EURGBP': 'GBPUSDT',
      'AUDJPY': 'EURUSDT', 'CADJPY': 'EURUSDT', 'NZDJPY': 'EURUSDT',
      'All Majors': 'EURUSDT',
    };
    return m[pair] || 'EURUSDT';
  };

  // ── Backtest Start ─────────────────────────────────────────────
  const startBacktest = async (ea: any, mode: "backtest" | "live" = "backtest", pairOverride?: string) => {
    const chosenPair = pairOverride || ea.pairs[0] || 'EURUSD';
    setActiveEA(ea);
    setActivePair(chosenPair);
    setSimulationMode(mode);
    setIsBacktestOpen(true);
    setCandles([]); setCurrentCandle(null); setVolumeProfile([]); setDeepMetrics(undefined);

    // Stop any existing feed first
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }

    const isMetals = chosenPair === 'XAUUSD' || chosenPair === 'XAGUSD';
    const winRate = ea.style === "Scalping" ? 0.75 : 0.55;
    const avgWin = isMetals ? 800 : ea.style === "Scalping" ? 50 : 150;
    const avgLoss = isMetals ? 600 : ea.style === "Scalping" ? 40 : 100;
    const volatility = isMetals ? 45 : 15;

    simulatorRef.current = new BacktestSimulator({
      initialBalance: mode === "live" ? 500000 : 10000,
      winRate, avgWin, avgLoss,
      volatility: mode === "live" ? volatility * 0.5 : volatility,
      symbol: chosenPair
    });

    const updateUiMetrics = () => {
      if (!simulatorRef.current) return;
      const metrics = simulatorRef.current.getMetrics();
      setSimMetrics({
        totalTrades: metrics.totalTrades,
        winRate: metrics.winRate,
        profitFactor: metrics.profitFactor,
        maxDrawdown: metrics.maxDrawdown,
        netProfit: metrics.netProfit,
        initialBalance: metrics.initialBalance,
        activeTrade: metrics.activeTrade ?? null,
        floatingPL: metrics.floatingPL ?? 0,
        equity: metrics.equity ?? metrics.initialBalance,
        symbol: metrics.symbol ?? ea.pairs[0] ?? 'EURUSD'
      });
    };

    // Symbol mapping via helper
    const originalSymbol = chosenPair;
    const binanceSymbol = toBinance(originalSymbol);

    try {
      const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=1m&limit=500`);
      const klinesData = await response.json();

      if (!Array.isArray(klinesData)) {
        console.error("Binance API error:", klinesData);
        stopBacktest(); return;
      }

      // Process historical candles
      klinesData.forEach((kline: any) => {
        const [time, open, high, low, close, volume, , quoteAssetVolume, , takerBuyBase] = kline;
        const histCandle: Candle = {
          time: Number(time),
          open: parseFloat(open),
          high: parseFloat(high),
          low: parseFloat(low),
          close: parseFloat(close),
          volume: parseFloat(volume),
          buyVolume: parseFloat(takerBuyBase),
          sellVolume: parseFloat(volume) - parseFloat(takerBuyBase),
          footprint: {
            [parseFloat(close).toFixed(4)]: {
              price: parseFloat(close),
              volume: parseFloat(volume),
              buyVolume: parseFloat(takerBuyBase),
              sellVolume: parseFloat(volume) - parseFloat(takerBuyBase)
            }
          },
          vwap: parseFloat(volume) > 0 ? parseFloat(quoteAssetVolume) / parseFloat(volume) : parseFloat(close),
          cvd: parseFloat(takerBuyBase) - (parseFloat(volume) - parseFloat(takerBuyBase)),
          ivbTop: parseFloat(high),
          ivbBottom: parseFloat(low),
          deepEffort: parseFloat(volume) / (Math.abs(parseFloat(high) - parseFloat(low)) + 0.00001) / 10000,
          vTracker: 0
        };
        simulatorRef.current?.processHistoricalCandle(histCandle);
      });

      // Force initial render
      if (simulatorRef.current) {
        const m = simulatorRef.current.getMetrics();
        setCandles([...(m.history || [])]);
        setCurrentCandle(simulatorRef.current.getCurrentCandle());
        setVolumeProfile([...(m.volumeProfile || [])]);
        updateUiMetrics();
      }

      // ── Both backtest and live modes use realtime Binance WebSocket ──
      // Historical klines already loaded above to seed volume profile & context.
      // Now connect the live feed for real prices regardless of mode.
      const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${binanceSymbol.toLowerCase()}@aggTrade`);
      wsRef.current = ws;
      let lastUiUpdate = 0;

      ws.onopen = () => console.log(`[AlphaFlow] Connected to Binance live feed: ${binanceSymbol}`);

      ws.onmessage = (event) => {
        if (!simulatorRef.current) return;
        const trade = JSON.parse(event.data);
        // trade.p = price, trade.q = quantity, trade.m = is buyer maker
        const result = simulatorRef.current.processTick(parseFloat(trade.p), parseFloat(trade.q), trade.m);
        const now = Date.now();
        // Throttle UI to ~4 updates/sec for smooth rendering
        if (now - lastUiUpdate > 250) {
          const m = simulatorRef.current.getMetrics();
          setCandles([...(m.history || [])]);
          setCurrentCandle({ ...result.currentCandle });
          setVolumeProfile([...(m.volumeProfile || [])]);
          setDeepMetrics(result.deepMetrics);
          updateUiMetrics();
          lastUiUpdate = now;
        }
      };

      ws.onerror = (e) => console.error("[AlphaFlow] Binance WS Error:", e);
      ws.onclose = () => console.log("[AlphaFlow] Binance WS closed");
    } catch (err) {
      console.error("Failed to fetch market data", err);
    }
  };

  const stopBacktest = () => {
    setIsBacktestOpen(false);
    if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Expert Advisors" description="Verified forex robots and trading algorithms with live backtesting." />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent" />
        <div className="container mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 mb-6">
              <Bot className="w-3 h-3 mr-1" />Expert Advisors
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-foreground">Trading</span>{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Robots</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Automated trading systems with verified backtests & live real-time market feeds. One-click backtest on Binance data.
            </p>
          </div>

          {/* Live Price Ticker */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {[
              { symbol: 'EURUSD', key: 'EURUSD' },
              { symbol: 'XAUUSD', key: 'XAUUSD' },
              { symbol: 'BTCUSDT', key: 'BTCUSDT' },
              { symbol: 'GBPUSD', key: 'GBPUSD' },
            ].map(({ symbol, key }) => (
              <div key={symbol} className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-full px-4 py-1.5 text-sm font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-gray-400">{symbol}</span>
                <span className="text-white font-bold">{livePrices[key] ? (key === 'BTCUSDT' || key === 'XAUUSD' ? livePrices[key].toFixed(2) : livePrices[key].toFixed(5)) : '...'}</span>
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 max-w-3xl mx-auto">
            {[
              { label: "Total EAs & Agents", value: "156+", icon: Bot },
              { label: "Avg Profit Factor", value: "2.8x", icon: TrendingUp },
              { label: "Total Downloads", value: "89K+", icon: Download },
              { label: "Verified Backtests", value: "100%", icon: Shield },
            ].map((stat, i) => (
              <div key={i} className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 text-center">
                <stat.icon className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Mode Switcher: 10-Agent Swarm vs Standalone EA Catalog */}
          <div className="flex justify-center mt-10">
            <div className="inline-flex p-1.5 rounded-2xl bg-black/70 border border-white/10 backdrop-blur-xl shadow-2xl">
              <button
                onClick={() => setActiveView("swarm")}
                className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  activeView === "swarm"
                    ? "bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25 border border-purple-400/40"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Cpu className="w-4 h-4 text-purple-300 animate-pulse" />
                <span>🤖 10-Agent Quant Swarm (HiveMind™)</span>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px] px-1.5 py-0">LIVE CONFLUENCE</Badge>
              </button>
              <button
                onClick={() => setActiveView("catalog")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  activeView === "catalog"
                    ? "bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25 border border-purple-400/40"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Bot className="w-4 h-4 text-purple-300" />
                <span>Standalone EA Catalog ({filteredEAs.length})</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONDITIONAL VIEW: 10-Agent Swarm War Room ── */}
      {activeView === "swarm" && (
        <section className="py-8 px-4 container mx-auto">
          <AgentSwarmWarRoom
            livePrices={livePrices}
            onDeployLive={(symbol) => startBacktest(hiveMindSwarmEA, "live", symbol)}
            onBacktest={(symbol) => startBacktest(hiveMindSwarmEA, "backtest", symbol)}
          />
        </section>
      )}

      {/* ── CONDITIONAL VIEW: Standalone EA Catalog ── */}
      {activeView === "catalog" && (
        <>
          {/* Filters + Search */}
      <section className="py-5 px-4 border-y border-border/50 bg-card/20 backdrop-blur-sm sticky top-16 z-10">
        <div className="container mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="w-4 h-4" /><span>Filter:</span>
              </div>
              <div className="flex items-center gap-2 bg-secondary/50 border border-border rounded-lg px-3 py-1.5">
                <Search className="w-3.5 h-3.5 text-muted-foreground" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search EAs..."
                  className="bg-transparent text-sm outline-none w-32"
                />
                {search && <X className="w-3 h-3 cursor-pointer text-muted-foreground hover:text-foreground" onClick={() => setSearch('')} />}
              </div>
              {[{ v: selectedStyle, set: setSelectedStyle, options: styles }, { v: selectedPlatform, set: setSelectedPlatform, options: platforms }, { v: selectedPrice, set: setSelectedPrice, options: priceRanges }].map((sel, i) => (
                <select key={i} value={sel.v} onChange={e => sel.set(e.target.value)} className="bg-secondary/50 border border-border rounded-lg px-3 py-1.5 text-sm">
                  {sel.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ))}
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="bg-secondary/50 border border-border rounded-lg px-3 py-1.5 text-sm">
                <option value="featured">⭐ Featured</option>
                <option value="rating">Best Rated</option>
                <option value="downloads">Most Downloaded</option>
                <option value="gain">Highest Gain</option>
                <option value="price_asc">Lowest Price</option>
                <option value="newest">Newest</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              {compareIds.length >= 2 && (
                <Button size="sm" variant="default" onClick={() => setCompareOpen(true)} className="gap-1.5 bg-purple-600 hover:bg-purple-700">
                  <GitCompare className="w-4 h-4" /> Compare ({compareIds.length})
                </Button>
              )}
              {compareIds.length > 0 && (
                <Button size="sm" variant="ghost" onClick={() => setCompareIds([])} className="text-xs">
                  <X className="w-3 h-3 mr-1" /> Clear
                </Button>
              )}
              <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("grid")}><Grid className="w-4 h-4" /></Button>
              <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("list")}><List className="w-4 h-4" /></Button>
            </div>
          </div>
        </div>
      </section>

      {/* EA Cards */}
      <section className="py-10 px-4">
        <div className="container mx-auto">
          <div className={`grid gap-5 ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
            {filteredEAs.map((ea) => {
              const isSelected = compareIds.includes(ea.id);
              return (
                <div
                  key={ea.id}
                  className={`group bg-card/50 backdrop-blur-sm border rounded-2xl p-5 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/8 relative ${isSelected ? 'border-purple-500/60 shadow-purple-500/20 shadow-md' : 'border-border/50'}`}
                >
                  {/* Badge Row */}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {ea.featured && <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">⭐ Top Performer</Badge>}
                    {ea.isNew && <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">🆕 New</Badge>}
                    {ea.isHot && <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">🔥 Hot</Badge>}
                    {ea.isSale && <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">🏷️ Sale</Badge>}
                    {ea.hasTrial && <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">✅ Free Trial</Badge>}
                    {ea.price === 0 && <Badge className="bg-emerald-500 text-white text-xs">🎁 FREE</Badge>}
                  </div>

                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white text-sm shrink-0">
                        {ea.avatar}
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground flex items-center gap-1.5 text-sm">
                          {ea.name}
                          {ea.verified && <Shield className="w-3.5 h-3.5 text-emerald-400" />}
                        </h3>
                        <p className="text-xs text-muted-foreground">{ea.developer}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-400 shrink-0">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="font-semibold text-sm">{ea.rating}</span>
                      <span className="text-xs text-muted-foreground">({ea.reviews})</span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mb-3">{ea.description}</p>

                  {/* Sparkline */}
                  <div className="mb-3 rounded-lg overflow-hidden border border-white/5 bg-black/30">
                    <Sparkline gain={ea.backtest.gain} />
                  </div>

                  {/* Backtest Stats — 5 metrics */}
                  <div className="bg-secondary/30 rounded-xl p-3 mb-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                      <span className="text-xs font-medium">{ea.years}-Year Backtest</span>
                    </div>
                    <div className="grid grid-cols-5 gap-1 text-center">
                      <div><div className="text-emerald-400 font-bold text-xs">+{ea.backtest.gain}%</div><div className="text-[9px] text-muted-foreground">Gain</div></div>
                      <div><div className={`font-bold text-xs ${ea.backtest.drawdown < 15 ? "text-emerald-400" : "text-yellow-400"}`}>{ea.backtest.drawdown}%</div><div className="text-[9px] text-muted-foreground">Max DD</div></div>
                      <div><div className="text-purple-400 font-bold text-xs">{ea.backtest.profitFactor}x</div><div className="text-[9px] text-muted-foreground">PF</div></div>
                      <div><div className="text-blue-400 font-bold text-xs">{ea.backtest.winRate}%</div><div className="text-[9px] text-muted-foreground">Win Rate</div></div>
                      <div><div className="text-amber-400 font-bold text-xs">{ea.backtest.monthlyReturn}%</div><div className="text-[9px] text-muted-foreground">Mo. Ret.</div></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                    <Badge variant="outline" className="text-[10px] px-1.5">{ea.platform}</Badge>
                    <Badge variant="outline" className="text-[10px] px-1.5">{ea.style}</Badge>
                    {ea.pairs.slice(0, 3).map(p => <Badge key={p} variant="secondary" className="text-[10px] px-1.5">{p}</Badge>)}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <div className="flex items-baseline gap-1.5">
                      {ea.price === 0 ? (
                        <span className="text-xl font-bold text-emerald-400">FREE</span>
                      ) : (
                        <>
                          <span className="text-xl font-bold text-foreground">${ea.price}</span>
                          {ea.originalPrice && ea.originalPrice !== ea.price && (
                            <span className="text-xs text-muted-foreground line-through">${ea.originalPrice}</span>
                          )}
                          <span className="text-muted-foreground text-xs">lifetime</span>
                        </>
                      )}
                    </div>
                    <div className="flex gap-1.5 items-center">
                      <button
                        onClick={() => toggleWatchlist(String(ea.id), ea.name, { price: ea.price, style: ea.style })}
                        title={watchlistIds.has(String(ea.id)) ? "Remove from watchlist" : "Save to watchlist"}
                        className={`p-1.5 rounded-lg border transition-all ${watchlistIds.has(String(ea.id)) ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'border-border/50 text-muted-foreground hover:border-red-500/30 hover:text-red-400'}`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${watchlistIds.has(String(ea.id)) ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={() => toggleCompare(ea.id)}
                        title="Add to compare"
                        className={`p-1.5 rounded-lg border transition-all ${isSelected ? 'bg-purple-500/20 border-purple-500/50 text-purple-400' : 'border-border/50 text-muted-foreground hover:border-purple-500/30 hover:text-purple-400'}`}
                      >
                        {isSelected ? <CheckCircle2 className="w-3.5 h-3.5" /> : <GitCompare className="w-3.5 h-3.5" />}
                      </button>
                      <Button variant="ghost" size="sm" onClick={() => startBacktest(ea, "backtest")} className="gap-1 hover:text-purple-400 hover:bg-purple-500/10 text-xs px-2">
                        <Play className="w-3.5 h-3.5" />Backtest
                      </Button>
                      <Button variant="emerald" size="sm" onClick={() => startBacktest(ea, "live")} className="gap-1 text-xs px-2">
                        <Zap className="w-3.5 h-3.5" />Live
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
                    <span><Download className="w-3 h-3 inline mr-0.5" />{ea.downloads.toLocaleString()} downloads</span>
                    <span>Sharpe {ea.backtest.sharpe} · {ea.trades.toLocaleString()} trades</span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredEAs.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              <Search className="w-10 h-10 mx-auto mb-4 opacity-30" />
              <p>No EAs match your filters.</p>
            </div>
          )}

          <div className="text-center mt-10">
            <Button variant="outline" size="lg">Load More EAs</Button>
          </div>
        </div>
      </section>
        </>
      )}

      {/* Compare Modal */}
      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent className="max-w-4xl bg-black/95 border-purple-500/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-purple-400" />
              EA Comparison
            </DialogTitle>
          </DialogHeader>
          <div className={`grid gap-4 mt-2 grid-cols-${comparedEAs.length}`}>
            {comparedEAs.map(ea => (
              <div key={ea.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white text-sm">{ea.avatar}</div>
                  <div>
                    <div className="font-bold text-sm">{ea.name}</div>
                    <div className="text-xs text-gray-500">{ea.developer}</div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  {[
                    ['Style', ea.style],
                    ['Platform', ea.platform],
                    ['Price', `$${ea.price}`],
                    ['Total Gain', <span className="text-emerald-400 font-bold">+{ea.backtest.gain}%</span>],
                    ['Max Drawdown', <span className={ea.backtest.drawdown < 15 ? 'text-emerald-400' : 'text-yellow-400'}>{ea.backtest.drawdown}%</span>],
                    ['Profit Factor', <span className="text-purple-400 font-bold">{ea.backtest.profitFactor}</span>],
                    ['Win Rate', <span className="text-blue-400">{ea.rating * 15}%</span>],
                    ['Years Tested', `${ea.years} yrs`],
                    ['Downloads', ea.downloads.toLocaleString()],
                    ['Rating', <span className="text-yellow-400">★ {ea.rating}</span>],
                  ].map(([k, v], i) => (
                    <div key={i} className="flex justify-between items-center border-b border-white/5 pb-1">
                      <span className="text-gray-500 text-xs">{k}</span>
                      <span className="text-xs font-mono">{v}</span>
                    </div>
                  ))}
                </div>
                <Button size="sm" className="w-full mt-4 gap-1.5" onClick={() => { setCompareOpen(false); startBacktest(ea, 'backtest'); }}>
                  <Play className="w-3.5 h-3.5" /> Backtest This EA
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Backtest / Live Dialog */}
      <Dialog open={isBacktestOpen} onOpenChange={stopBacktest}>
        <DialogContent className="max-w-7xl bg-black/97 border-purple-500/20 text-foreground h-[92vh] flex flex-col p-0">
          <DialogHeader className="px-5 pt-4 pb-0 shrink-0">
            <DialogTitle className="flex items-center gap-3 text-lg flex-wrap">
              <Bot className="w-5 h-5 text-purple-400" />
              {simulationMode === "live" ? "Live Market Trading:" : "Strategy Analysis:"}{" "}
              <span className="text-purple-400">{activeEA?.name}</span>

              {/* Pair switcher — one button per EA pair */}
              {activeEA && activeEA.pairs.length > 0 && (
                <div className="flex gap-1">
                  {activeEA.pairs.map((p: string) => (
                    <button key={p}
                      onClick={() => startBacktest(activeEA, simulationMode, p)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${activePair === p
                        ? "bg-purple-500 text-white"
                        : "bg-white/5 text-gray-400 hover:bg-purple-500/20 hover:text-purple-300"
                        }`}>
                      {p === "XAUUSD" ? "🥇 GOLD" : p === "XAGUSD" ? "🥈 XAG" : p === "BTCUSDT" ? "₿ BTC" : p}
                    </button>
                  ))}
                </div>
              )}

              {/* Live price pill */}
              {simMetrics.symbol && (
                <span className="flex items-center gap-2 bg-black/60 border border-emerald-500/30 rounded-full px-3 py-0.5 text-sm font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                  <span className="text-emerald-400 font-bold">{simMetrics.symbol}</span>
                  <span className="text-white">
                    {livePrices[simMetrics.symbol]
                      ? (simMetrics.symbol === 'BTCUSDT' || simMetrics.symbol === 'XAUUSD'
                        ? livePrices[simMetrics.symbol].toFixed(2)
                        : livePrices[simMetrics.symbol].toFixed(5))
                      : '—'}
                  </span>
                </span>
              )}
              <Badge variant="outline" className="bg-purple-500/10 text-purple-300 border-purple-500/40 text-xs">1:3000</Badge>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/40 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse inline-block" />
                LIVE BINANCE
              </Badge>
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
                <AdvancedRealTimeChart candles={candles} currentCandle={currentCandle} volumeProfile={volumeProfile} metrics={simMetrics} deepMetrics={deepMetrics} isActive={isBacktestOpen} />
              </TabsContent>
              <TabsContent value="risk" className="flex-1 mt-0 outline-none overflow-y-auto">
                <RiskManager />
              </TabsContent>
              <TabsContent value="copier" className="flex-1 mt-0 outline-none overflow-y-auto">
                <TradeCopier />
              </TabsContent>
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
              <Button variant="outline" size="sm" onClick={stopBacktest}>Close</Button>
              {simulationMode === "backtest" ? (
                <Button variant="emerald" size="sm" className="gap-1.5" onClick={() => startBacktest(activeEA, "live")}>
                  <Zap className="w-3.5 h-3.5" />Deploy to Live Market
                </Button>
              ) : (
                <Button variant="destructive" size="sm" className="gap-1.5 bg-red-500/10 text-red-400 border border-red-500/40 hover:bg-red-500/20" onClick={stopBacktest}>
                  <Bot className="w-3.5 h-3.5" />Stop Bot
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
