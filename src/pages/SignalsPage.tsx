import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SEO from "@/components/SEO";
import {
  Radio, Shield, TrendingUp, Star, Filter, Grid, List,
  CheckCircle, Clock, DollarSign, Users, Zap
} from "lucide-react";

const signals = [
  {
    id: 1,
    name: "Alpha Signals Pro",
    provider: "AlphaEdge Capital",
    avatar: "AS",
    price: 149,
    pricePeriod: "month",
    winRate: 78,
    avgPips: 42,
    signalsPerDay: 5,
    subscribers: 2847,
    rating: 4.9,
    reviews: 312,
    verified: true,
    featured: true,
    pairs: ["EURUSD", "GBPUSD", "XAUUSD"],
    style: "Smart Money",
    description: "Institutional-grade signals based on order flow and liquidity zones. Average 200+ pips weekly.",
  },
  {
    id: 2,
    name: "Scalp Master Alerts",
    provider: "Precision Pro",
    avatar: "SM",
    price: 79,
    pricePeriod: "month",
    winRate: 72,
    avgPips: 15,
    signalsPerDay: 12,
    subscribers: 1923,
    rating: 4.7,
    reviews: 187,
    verified: true,
    featured: true,
    pairs: ["EURUSD", "USDJPY", "GBPJPY"],
    style: "Scalping",
    description: "High-frequency scalp signals during London and NY sessions. Quick in, quick out.",
  },
  {
    id: 3,
    name: "Gold Rush Signals",
    provider: "Vortex Systems",
    avatar: "GR",
    price: 199,
    pricePeriod: "month",
    winRate: 74,
    avgPips: 85,
    signalsPerDay: 3,
    subscribers: 1456,
    rating: 4.8,
    reviews: 156,
    verified: true,
    featured: false,
    pairs: ["XAUUSD", "XAGUSD"],
    style: "Metals Only",
    description: "Specialized in precious metals. Capture major moves in Gold and Silver.",
  },
  {
    id: 4,
    name: "Swing Elite",
    provider: "Trend Rider",
    avatar: "SE",
    price: 99,
    pricePeriod: "month",
    winRate: 68,
    avgPips: 120,
    signalsPerDay: 2,
    subscribers: 987,
    rating: 4.6,
    reviews: 98,
    verified: true,
    featured: false,
    pairs: ["EURUSD", "AUDUSD", "USDCAD", "NZDUSD"],
    style: "Swing Trading",
    description: "Multi-day swing trades with excellent risk-to-reward. Hold times 2-5 days.",
  },
  {
    id: 5,
    name: "Asian Session Pro",
    provider: "Night Owl Trading",
    avatar: "AP",
    price: 69,
    pricePeriod: "month",
    winRate: 71,
    avgPips: 28,
    signalsPerDay: 6,
    subscribers: 743,
    rating: 4.5,
    reviews: 67,
    verified: true,
    featured: false,
    pairs: ["USDJPY", "AUDJPY", "EURJPY"],
    style: "Asian Session",
    description: "Perfect for traders in Asia-Pacific. Catch JPY moves while others sleep.",
  },
  {
    id: 6,
    name: "News Sniper",
    provider: "Momentum Masters",
    avatar: "NS",
    price: 129,
    pricePeriod: "month",
    winRate: 65,
    avgPips: 65,
    signalsPerDay: 4,
    subscribers: 612,
    rating: 4.4,
    reviews: 54,
    verified: true,
    featured: false,
    pairs: ["All Majors"],
    style: "News Trading",
    description: "Trade high-impact news events with precision. NFP, FOMC, CPI specialists.",
  },
];

const styles = ["All Styles", "Smart Money", "Scalping", "Swing Trading", "News Trading", "Asian Session", "Metals Only"];
const priceRanges = ["All Prices", "Under $50", "$50-$100", "$100-$200", "$200+"];

export default function SignalsPage() {
  const [selectedStyle, setSelectedStyle] = useState("All Styles");
  const [selectedPrice, setSelectedPrice] = useState("All Prices");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredSignals = signals.filter(signal => {
    const styleMatch = selectedStyle === "All Styles" || signal.style === selectedStyle;
    let priceMatch = true;
    if (selectedPrice === "Under $50") priceMatch = signal.price < 50;
    else if (selectedPrice === "$50-$100") priceMatch = signal.price >= 50 && signal.price <= 100;
    else if (selectedPrice === "$100-$200") priceMatch = signal.price > 100 && signal.price <= 200;
    else if (selectedPrice === "$200+") priceMatch = signal.price > 200;
    return styleMatch && priceMatch;
  });

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Forex Signals"
        description="Daily forex signals from verified profitable traders."
      />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent" />
        <div className="container mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 mb-6">
              <Radio className="w-3 h-3 mr-1" />
              Premium Signal Providers
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-foreground">Forex</span>{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                Signals
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Copy trades from verified profitable traders. All signal providers are connected to live broker accounts with transparent track records.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-3xl mx-auto">
            {[
              { label: "Active Providers", value: "247", icon: Users },
              { label: "Avg Win Rate", value: "71%", icon: TrendingUp },
              { label: "Monthly Signals", value: "12K+", icon: Zap },
              { label: "Total Subscribers", value: "45K+", icon: CheckCircle },
            ].map((stat, i) => (
              <div key={i} className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 text-center">
                <stat.icon className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
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

      {/* Signal Cards */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          {filteredSignals.length === 0 && (
            <div className="text-center py-20 text-muted-foreground col-span-full">
              <p className="text-lg">No signal providers match your current filters.</p>
              <button
                onClick={() => { setSelectedStyle("All Styles"); setSelectedPrice("All Prices"); }}
                className="mt-3 text-cyan-400 underline text-sm"
              >Clear filters</button>
            </div>
          )}
          <div className={`grid gap-6 ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
            {filteredSignals.map((signal) => (
              <Link
                key={signal.id}
                to={`/product/${signal.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="group bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 block"
              >
                {signal.featured && (
                  <Badge className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white mb-4">
                    Featured
                  </Badge>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center font-bold text-white">
                      {signal.avatar}
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground flex items-center gap-2">
                        {signal.name}
                        {signal.verified && <Shield className="w-4 h-4 text-emerald-400" />}
                      </h3>
                      <p className="text-sm text-muted-foreground">{signal.provider}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-semibold">{signal.rating}</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4">{signal.description}</p>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-2 bg-secondary/30 rounded-lg">
                    <div className="text-emerald-400 font-bold">{signal.winRate}%</div>
                    <div className="text-xs text-muted-foreground">Win Rate</div>
                  </div>
                  <div className="text-center p-2 bg-secondary/30 rounded-lg">
                    <div className="text-cyan-400 font-bold">{signal.avgPips}</div>
                    <div className="text-xs text-muted-foreground">Avg Pips</div>
                  </div>
                  <div className="text-center p-2 bg-secondary/30 rounded-lg">
                    <div className="text-foreground font-bold">{signal.signalsPerDay}</div>
                    <div className="text-xs text-muted-foreground">Daily</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {signal.pairs.map((pair) => (
                    <Badge key={pair} variant="outline" className="text-xs">{pair}</Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div>
                    <span className="text-2xl font-bold text-foreground">${signal.price}</span>
                    <span className="text-muted-foreground text-sm">/{signal.pricePeriod}</span>
                  </div>
                  <Button variant="emerald" size="sm">
                    Subscribe
                  </Button>
                </div>

                <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {signal.subscribers.toLocaleString()} subscribers
                  </span>
                  <span>{signal.reviews} reviews</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Signals
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}
