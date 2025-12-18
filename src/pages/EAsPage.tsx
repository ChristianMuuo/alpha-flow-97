import { useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SEO from "@/components/SEO";
import {
  Bot, Shield, TrendingUp, Star, Filter, Grid, List,
  Download, Cpu, Clock, DollarSign, Zap, Play, BarChart3
} from "lucide-react";

const eas = [
  {
    id: 1,
    name: "Vortex Sniper EA",
    developer: "Vortex Systems",
    avatar: "VS",
    price: 799,
    lifetime: true,
    backtest: { gain: 847, drawdown: 12.4, profitFactor: 2.8 },
    trades: 15420,
    years: 5,
    rating: 4.9,
    reviews: 423,
    verified: true,
    featured: true,
    platform: "MT4/MT5",
    style: "Smart Money",
    pairs: ["EURUSD", "GBPUSD", "XAUUSD"],
    description: "Institutional-grade EA using order flow analysis and liquidity zones. Proven 5-year track record.",
    downloads: 2847,
  },
  {
    id: 2,
    name: "Grid Master Pro",
    developer: "GridMaster Elite",
    avatar: "GM",
    price: 499,
    lifetime: true,
    backtest: { gain: 523, drawdown: 18.7, profitFactor: 2.1 },
    trades: 48721,
    years: 4,
    rating: 4.7,
    reviews: 287,
    verified: true,
    featured: true,
    platform: "MT4/MT5",
    style: "Grid Trading",
    pairs: ["All Majors"],
    description: "Advanced grid system with dynamic lot sizing and smart recovery. Handles ranging markets perfectly.",
    downloads: 1923,
  },
  {
    id: 3,
    name: "Scalp Fury",
    developer: "Scalp King",
    avatar: "SF",
    price: 349,
    lifetime: true,
    backtest: { gain: 312, drawdown: 8.9, profitFactor: 2.4 },
    trades: 127893,
    years: 3,
    rating: 4.8,
    reviews: 198,
    verified: true,
    featured: false,
    platform: "MT5",
    style: "Scalping",
    pairs: ["EURUSD", "USDJPY"],
    description: "High-frequency scalper with ultra-tight stops. Optimized for low-spread brokers.",
    downloads: 1456,
  },
  {
    id: 4,
    name: "Trend Surfer",
    developer: "Trend Rider",
    avatar: "TS",
    price: 599,
    lifetime: true,
    backtest: { gain: 445, drawdown: 15.2, profitFactor: 2.3 },
    trades: 8934,
    years: 6,
    rating: 4.6,
    reviews: 156,
    verified: true,
    featured: false,
    platform: "MT4/MT5",
    style: "Trend Following",
    pairs: ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD"],
    description: "Catches major trends with dynamic trailing stops. Excellent for long-term growth.",
    downloads: 1124,
  },
  {
    id: 5,
    name: "Gold Miner X",
    developer: "Vortex Systems",
    avatar: "GX",
    price: 899,
    lifetime: true,
    backtest: { gain: 678, drawdown: 14.1, profitFactor: 2.6 },
    trades: 12456,
    years: 4,
    rating: 4.8,
    reviews: 134,
    verified: true,
    featured: false,
    platform: "MT4/MT5",
    style: "Metals Trading",
    pairs: ["XAUUSD"],
    description: "Specialized Gold trading EA with volatility filters and session optimization.",
    downloads: 987,
  },
  {
    id: 6,
    name: "News Trader Bot",
    developer: "Momentum Masters",
    avatar: "NT",
    price: 449,
    lifetime: true,
    backtest: { gain: 287, drawdown: 22.3, profitFactor: 1.9 },
    trades: 3421,
    years: 3,
    rating: 4.4,
    reviews: 89,
    verified: true,
    featured: false,
    platform: "MT4/MT5",
    style: "News Trading",
    pairs: ["All Majors"],
    description: "Automated news trading with pre-set entries around high-impact events.",
    downloads: 743,
  },
];

const styles = ["All Styles", "Smart Money", "Grid Trading", "Scalping", "Trend Following", "News Trading", "Metals Trading"];
const platforms = ["All Platforms", "MT4", "MT5", "MT4/MT5"];
const priceRanges = ["All Prices", "Under $300", "$300-$500", "$500-$800", "$800+"];

export default function EAsPage() {
  const [selectedStyle, setSelectedStyle] = useState("All Styles");
  const [selectedPlatform, setSelectedPlatform] = useState("All Platforms");
  const [selectedPrice, setSelectedPrice] = useState("All Prices");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <div className="min-h-screen bg-background">

      <SEO
        title="Expert Advisors"
        description="Verified forex robots and trading algorithms."
      />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent" />
        <div className="container mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 mb-6">
              <Bot className="w-3 h-3 mr-1" />
              Expert Advisors
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-foreground">Trading</span>{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Robots
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Automated trading systems with verified backtests. One-click install to MT4/MT5. All EAs come with lifetime license and free updates.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-3xl mx-auto">
            {[
              { label: "Total EAs", value: "156", icon: Bot },
              { label: "Avg Profit Factor", value: "2.3", icon: TrendingUp },
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
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 px-4 border-y border-border/50">
        <div className="container mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="w-4 h-4" />
                <span>Filter:</span>
              </div>
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="bg-secondary/50 border border-border rounded-lg px-3 py-1.5 text-sm"
              >
                {styles.map((style) => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="bg-secondary/50 border border-border rounded-lg px-3 py-1.5 text-sm"
              >
                {platforms.map((platform) => (
                  <option key={platform} value={platform}>{platform}</option>
                ))}
              </select>
              <select
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
                className="bg-secondary/50 border border-border rounded-lg px-3 py-1.5 text-sm"
              >
                {priceRanges.map((range) => (
                  <option key={range} value={range}>{range}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* EA Cards */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className={`grid gap-6 ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
            {eas.map((ea) => (
              <Link
                key={ea.id}
                to={`/product/${ea.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="group bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 block"
              >
                {ea.featured && (
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white mb-4">
                    Top Performer
                  </Badge>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white">
                      {ea.avatar}
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground flex items-center gap-2">
                        {ea.name}
                        {ea.verified && <Shield className="w-4 h-4 text-emerald-400" />}
                      </h3>
                      <p className="text-sm text-muted-foreground">{ea.developer}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-semibold">{ea.rating}</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4">{ea.description}</p>

                {/* Backtest Results */}
                <div className="bg-secondary/30 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium">{ea.years}-Year Backtest</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <div className="text-emerald-400 font-bold">+{ea.backtest.gain}%</div>
                      <div className="text-xs text-muted-foreground">Total Gain</div>
                    </div>
                    <div className="text-center">
                      <div className={`font-bold ${ea.backtest.drawdown < 15 ? "text-emerald-400" : "text-yellow-400"}`}>
                        {ea.backtest.drawdown}%
                      </div>
                      <div className="text-xs text-muted-foreground">Max DD</div>
                    </div>
                    <div className="text-center">
                      <div className="text-purple-400 font-bold">{ea.backtest.profitFactor}</div>
                      <div className="text-xs text-muted-foreground">Profit Factor</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline" className="text-xs">{ea.platform}</Badge>
                  <Badge variant="outline" className="text-xs">{ea.style}</Badge>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {ea.pairs.map((pair) => (
                    <Badge key={pair} variant="secondary" className="text-xs">{pair}</Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div>
                    <span className="text-2xl font-bold text-foreground">${ea.price}</span>
                    <span className="text-muted-foreground text-sm"> lifetime</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Play className="w-4 h-4" />
                    </Button>
                    <Button variant="emerald" size="sm" className="gap-1">
                      <Download className="w-4 h-4" />
                      Get EA
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Download className="w-3 h-3" />
                    {ea.downloads.toLocaleString()} downloads
                  </span>
                  <span>{ea.trades.toLocaleString()} trades tested</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More EAs
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}
