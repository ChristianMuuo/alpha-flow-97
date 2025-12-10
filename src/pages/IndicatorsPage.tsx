import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, Shield, Star, Filter, Grid, List, 
  Download, Eye, Code, Palette, Layers, Zap
} from "lucide-react";

const indicators = [
  {
    id: 1,
    name: "Smart Money Toolkit",
    developer: "AlphaEdge Capital",
    avatar: "SM",
    price: 149,
    lifetime: true,
    rating: 4.9,
    reviews: 567,
    verified: true,
    featured: true,
    platform: "TradingView",
    category: "Smart Money",
    features: ["Order Blocks", "Fair Value Gaps", "Liquidity Zones", "Kill Zones"],
    description: "Complete ICT/SMC indicator suite. Auto-marks order blocks, FVGs, and liquidity sweeps.",
    downloads: 8934,
    sourceCode: true,
  },
  {
    id: 2,
    name: "Volume Profile Pro",
    developer: "Vortex Systems",
    avatar: "VP",
    price: 199,
    lifetime: true,
    rating: 4.8,
    reviews: 423,
    verified: true,
    featured: true,
    platform: "TradingView",
    category: "Volume Analysis",
    features: ["Session VP", "Fixed Range VP", "POC Lines", "Value Areas"],
    description: "Institutional-grade volume profile with multi-timeframe analysis and custom sessions.",
    downloads: 6721,
    sourceCode: true,
  },
  {
    id: 3,
    name: "Supply & Demand Zones",
    developer: "Precision Pro",
    avatar: "SD",
    price: 79,
    lifetime: true,
    rating: 4.7,
    reviews: 312,
    verified: true,
    featured: false,
    platform: "MT4/MT5",
    category: "Support/Resistance",
    features: ["Auto Zones", "Zone Strength", "Multi-TF", "Alerts"],
    description: "Automatically identifies and draws fresh supply and demand zones with strength ratings.",
    downloads: 5234,
    sourceCode: false,
  },
  {
    id: 4,
    name: "Session Highlighter",
    developer: "Night Owl Trading",
    avatar: "SH",
    price: 49,
    lifetime: true,
    rating: 4.6,
    reviews: 198,
    verified: true,
    featured: false,
    platform: "TradingView",
    category: "Utility",
    features: ["Session Boxes", "Kill Zones", "News Times", "Custom Colors"],
    description: "Beautiful session visualization with London, NY, and Asian sessions clearly marked.",
    downloads: 12456,
    sourceCode: true,
  },
  {
    id: 5,
    name: "Candle Pattern Scanner",
    developer: "Trend Rider",
    avatar: "CP",
    price: 99,
    lifetime: true,
    rating: 4.7,
    reviews: 234,
    verified: true,
    featured: false,
    platform: "TradingView",
    category: "Pattern Recognition",
    features: ["35+ Patterns", "Auto Alerts", "Win Rate Stats", "Backtest Mode"],
    description: "Scans for high-probability candlestick patterns with historical win rate statistics.",
    downloads: 4321,
    sourceCode: true,
  },
  {
    id: 6,
    name: "Multi-TF Dashboard",
    developer: "Quantum Flow",
    avatar: "MT",
    price: 129,
    lifetime: true,
    rating: 4.8,
    reviews: 178,
    verified: true,
    featured: false,
    platform: "TradingView",
    category: "Dashboard",
    features: ["8 Timeframes", "Trend Analysis", "RSI/MACD/Stoch", "Currency Strength"],
    description: "See all timeframes at a glance. Perfect for confluence and multi-timeframe analysis.",
    downloads: 3892,
    sourceCode: true,
  },
  {
    id: 7,
    name: "Fibonacci Auto",
    developer: "Momentum Masters",
    avatar: "FA",
    price: 69,
    lifetime: true,
    rating: 4.5,
    reviews: 156,
    verified: true,
    featured: false,
    platform: "MT4/MT5",
    category: "Fibonacci",
    features: ["Auto Fib", "Extensions", "Time Zones", "Clusters"],
    description: "Automatically draws Fibonacci retracements and extensions based on swing highs/lows.",
    downloads: 3456,
    sourceCode: false,
  },
  {
    id: 8,
    name: "Divergence Finder",
    developer: "SMC Trader",
    avatar: "DF",
    price: 89,
    lifetime: true,
    rating: 4.6,
    reviews: 134,
    verified: true,
    featured: false,
    platform: "TradingView",
    category: "Divergence",
    features: ["RSI Divergence", "MACD Divergence", "Hidden Divergence", "Alerts"],
    description: "Automatically detects regular and hidden divergences across multiple oscillators.",
    downloads: 2987,
    sourceCode: true,
  },
];

const categories = ["All Categories", "Smart Money", "Volume Analysis", "Support/Resistance", "Pattern Recognition", "Dashboard", "Fibonacci", "Divergence", "Utility"];
const platforms = ["All Platforms", "TradingView", "MT4/MT5", "MT4", "MT5"];
const priceRanges = ["All Prices", "Under $50", "$50-$100", "$100-$150", "$150+"];

export default function IndicatorsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedPlatform, setSelectedPlatform] = useState("All Platforms");
  const [selectedPrice, setSelectedPrice] = useState("All Prices");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent" />
        <div className="container mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 mb-6">
              <Activity className="w-3 h-3 mr-1" />
              Premium Indicators
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-foreground">Trading</span>{" "}
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                Indicators
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional indicators for TradingView and MetaTrader. Many include source code access for full customization.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-3xl mx-auto">
            {[
              { label: "Total Indicators", value: "324", icon: Activity },
              { label: "With Source Code", value: "78%", icon: Code },
              { label: "Total Downloads", value: "156K+", icon: Download },
              { label: "Avg Rating", value: "4.7", icon: Star },
            ].map((stat, i) => (
              <div key={i} className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 text-center">
                <stat.icon className="w-5 h-5 text-amber-400 mx-auto mb-2" />
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
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-secondary/50 border border-border rounded-lg px-3 py-1.5 text-sm"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
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

      {/* Indicator Cards */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className={`grid gap-6 ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
            {indicators.map((indicator) => (
              <div
                key={indicator.id}
                className="group bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-5 hover:border-amber-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10"
              >
                {indicator.featured && (
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white mb-3 text-xs">
                    Best Seller
                  </Badge>
                )}
                
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center font-bold text-white text-sm">
                      {indicator.avatar}
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-sm flex items-center gap-1">
                        {indicator.name}
                        {indicator.verified && <Shield className="w-3 h-3 text-emerald-400" />}
                      </h3>
                      <p className="text-xs text-muted-foreground">{indicator.developer}</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{indicator.description}</p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {indicator.features.slice(0, 3).map((feature) => (
                    <Badge key={feature} variant="secondary" className="text-xs px-2 py-0">
                      {feature}
                    </Badge>
                  ))}
                  {indicator.features.length > 3 && (
                    <Badge variant="secondary" className="text-xs px-2 py-0">
                      +{indicator.features.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="text-xs">{indicator.platform}</Badge>
                  {indicator.sourceCode && (
                    <Badge variant="outline" className="text-xs text-emerald-400 border-emerald-500/30">
                      <Code className="w-3 h-3 mr-1" />
                      Source
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <div>
                    <span className="text-xl font-bold text-foreground">${indicator.price}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-yellow-400 text-sm">
                      <Star className="w-3 h-3 fill-current" />
                      <span>{indicator.rating}</span>
                    </div>
                    <Button variant="emerald" size="sm">
                      Get
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Download className="w-3 h-3" />
                    {indicator.downloads.toLocaleString()}
                  </span>
                  <span>{indicator.reviews} reviews</span>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Indicators
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
