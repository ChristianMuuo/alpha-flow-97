import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShieldCheck, Star, TrendingUp, Download, Calculator, 
  BarChart3, Clock, Users, ArrowLeft, Play, ExternalLink,
  CheckCircle2, AlertTriangle, Target, Zap, Copy
} from "lucide-react";

// Mock product data - in real app this would come from API
const mockProducts: Record<string, {
  id: string;
  name: string;
  type: "ea" | "signal" | "indicator";
  price: number;
  creator: string;
  creatorAvatar: string;
  description: string;
  longDescription: string;
  verified: boolean;
  winRate: number;
  monthlyReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  totalTrades: number;
  rating: number;
  reviews: number;
  sales: number;
  broker: string;
  platforms: string[];
  pairs: string[];
  timeframes: string[];
  features: string[];
  requirements: string[];
  screenshots: string[];
}> = {
  "vortex-sniper-ea": {
    id: "vortex-sniper-ea",
    name: "Vortex Sniper EA",
    type: "ea",
    price: 799,
    creator: "AlgoTraderPro",
    creatorAvatar: "AT",
    description: "Smart Money Concepts automated with institutional order flow detection.",
    longDescription: "Vortex Sniper EA is a professional-grade Expert Advisor that combines Smart Money Concepts with advanced order flow analysis. It identifies institutional footprints, order blocks, and liquidity pools to execute high-probability trades with precision timing. Built on 5+ years of backtested data across multiple market conditions.",
    verified: true,
    winRate: 73.2,
    monthlyReturn: 12.4,
    maxDrawdown: 18.3,
    sharpeRatio: 2.1,
    totalTrades: 1847,
    rating: 4.9,
    reviews: 127,
    sales: 342,
    broker: "Myfxbook",
    platforms: ["MT4", "MT5"],
    pairs: ["EURUSD", "GBPUSD", "USDJPY", "XAUUSD"],
    timeframes: ["M15", "H1", "H4"],
    features: [
      "Automated Smart Money Concepts detection",
      "Real-time order flow analysis",
      "Dynamic position sizing based on volatility",
      "Auto news filter integration",
      "Multi-pair correlation management",
      "Built-in risk management (max DD protection)",
      "Telegram alerts for all trades",
      "Lifetime free updates"
    ],
    requirements: [
      "Minimum $1,000 account balance",
      "ECN broker with spreads < 1.5 pips",
      "VPS recommended for 24/7 operation",
      "MT4/MT5 platform"
    ],
    screenshots: []
  },
  "neural-grid-pro": {
    id: "neural-grid-pro",
    name: "Neural Grid Pro",
    type: "ea",
    price: 1299,
    creator: "QuantLabs",
    creatorAvatar: "QL",
    description: "AI-powered grid trading with dynamic lot sizing.",
    longDescription: "Neural Grid Pro uses machine learning to optimize grid parameters in real-time. Unlike traditional grid systems, it adapts spacing, lot sizes, and take profit levels based on current market volatility and trend strength.",
    verified: true,
    winRate: 89.1,
    monthlyReturn: 8.7,
    maxDrawdown: 12.1,
    sharpeRatio: 2.8,
    totalTrades: 3421,
    rating: 4.8,
    reviews: 89,
    sales: 156,
    broker: "FXBlue",
    platforms: ["MT4", "MT5"],
    pairs: ["EURUSD", "GBPUSD", "AUDUSD"],
    timeframes: ["M5", "M15"],
    features: [
      "Machine learning grid optimization",
      "Dynamic lot sizing",
      "Trend detection system",
      "Auto-adjusting parameters",
      "Risk management suite"
    ],
    requirements: [
      "Minimum $2,000 account balance",
      "Low spread broker required",
      "VPS mandatory"
    ],
    screenshots: []
  }
};

const ProductDetailPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const [balance, setBalance] = useState<string>("10000");
  const [activeTab, setActiveTab] = useState("overview");
  
  const product = productId ? mockProducts[productId] : null;
  
  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist.</p>
          <Link to="/eas">
            <Button variant="emerald">Browse All Products</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const projectedMonthly = (parseFloat(balance) * (product.monthlyReturn / 100)).toFixed(2);
  const projectedYearly = (parseFloat(balance) * Math.pow(1 + product.monthlyReturn / 100, 12) - parseFloat(balance)).toFixed(2);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Back Navigation */}
      <div className="container pt-24 pb-4">
        <Link 
          to={`/${product.type}s`}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {product.type === "ea" ? "EAs" : product.type === "signal" ? "Signals" : "Indicators"}
        </Link>
      </div>

      {/* Main Content */}
      <div className="container pb-20">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Product Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div className="card-glass p-8 rounded-2xl">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="outline" className="border-primary/50 text-primary">
                      {product.type.toUpperCase()}
                    </Badge>
                    {product.verified && (
                      <Badge className="bg-profit/20 text-profit border-profit/30">
                        <ShieldCheck className="w-3 h-3 mr-1" />
                        Verified Live Results
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground font-display mb-2">
                    {product.name}
                  </h1>
                  <p className="text-lg text-muted-foreground">{product.description}</p>
                </div>
              </div>

              {/* Creator Info */}
              <div className="flex items-center gap-4 p-4 bg-card/50 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-background font-bold">
                  {product.creatorAvatar}
                </div>
                <div>
                  <p className="font-medium text-foreground">{product.creator}</p>
                  <p className="text-sm text-muted-foreground">Verified Seller • {product.sales} sales</p>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <Star className="w-4 h-4 text-accent fill-accent" />
                  <span className="font-bold text-foreground">{product.rating}</span>
                  <span className="text-muted-foreground">({product.reviews} reviews)</span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card-glass p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-profit">{product.winRate}%</div>
                <div className="text-sm text-muted-foreground">Win Rate</div>
              </div>
              <div className="card-glass p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-profit">+{product.monthlyReturn}%</div>
                <div className="text-sm text-muted-foreground">Monthly Avg</div>
              </div>
              <div className="card-glass p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-loss">{product.maxDrawdown}%</div>
                <div className="text-sm text-muted-foreground">Max Drawdown</div>
              </div>
              <div className="card-glass p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-accent">{product.sharpeRatio}</div>
                <div className="text-sm text-muted-foreground">Sharpe Ratio</div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full bg-card/50 p-1 rounded-xl">
                <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                <TabsTrigger value="performance" className="flex-1">Performance</TabsTrigger>
                <TabsTrigger value="reviews" className="flex-1">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6 space-y-6">
                {/* Description */}
                <div className="card-glass p-6 rounded-xl">
                  <h3 className="text-lg font-bold text-foreground mb-4">About This Product</h3>
                  <p className="text-muted-foreground leading-relaxed">{product.longDescription}</p>
                </div>

                {/* Features */}
                <div className="card-glass p-6 rounded-xl">
                  <h3 className="text-lg font-bold text-foreground mb-4">Key Features</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {product.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-profit mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Requirements */}
                <div className="card-glass p-6 rounded-xl">
                  <h3 className="text-lg font-bold text-foreground mb-4">Requirements</h3>
                  <div className="space-y-2">
                    {product.requirements.map((req, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Supported */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="card-glass p-4 rounded-xl">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Platforms</h4>
                    <div className="flex gap-2">
                      {product.platforms.map(p => (
                        <Badge key={p} variant="outline">{p}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="card-glass p-4 rounded-xl">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Currency Pairs</h4>
                    <div className="flex flex-wrap gap-1">
                      {product.pairs.map(p => (
                        <Badge key={p} variant="outline" className="text-xs">{p}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="card-glass p-4 rounded-xl">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Timeframes</h4>
                    <div className="flex gap-2">
                      {product.timeframes.map(t => (
                        <Badge key={t} variant="outline">{t}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="performance" className="mt-6">
                <div className="card-glass p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-foreground">Live Performance</h3>
                    <Badge className="bg-profit/20 text-profit border-profit/30">
                      <span className="w-2 h-2 bg-profit rounded-full mr-2 animate-pulse" />
                      Connected to {product.broker}
                    </Badge>
                  </div>
                  
                  {/* Mock Equity Curve */}
                  <div className="h-64 bg-card/50 rounded-xl flex items-center justify-center border border-border/50 mb-6">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Interactive equity curve</p>
                      <p className="text-sm text-muted-foreground/70">Connected via {product.broker} API</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-foreground">{product.totalTrades}</div>
                      <div className="text-sm text-muted-foreground">Total Trades</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-profit">+247%</div>
                      <div className="text-sm text-muted-foreground">All-Time Return</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">18 mo</div>
                      <div className="text-sm text-muted-foreground">Track Record</div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <div className="space-y-4">
                  {[
                    { name: "TradingMike", rating: 5, comment: "Best EA I've ever used. Consistent profits for 6 months straight.", date: "2 days ago" },
                    { name: "FXWarrior", rating: 5, comment: "Support is incredible. They helped me optimize settings for my broker.", date: "1 week ago" },
                    { name: "PropTrader99", rating: 4, comment: "Solid EA, passed my FTMO challenge on first try. Minor issues with news events.", date: "2 weeks ago" },
                  ].map((review, i) => (
                    <div key={i} className="card-glass p-4 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
                            {review.name[0]}
                          </div>
                          <span className="font-medium text-foreground">{review.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-accent fill-accent" />
                          ))}
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm mb-1">{review.comment}</p>
                      <p className="text-xs text-muted-foreground/70">{review.date}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Purchase & Calculator */}
          <div className="space-y-6">
            {/* Purchase Card */}
            <div className="card-glass p-6 rounded-2xl sticky top-24">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-foreground mb-1">${product.price}</div>
                <p className="text-sm text-muted-foreground">One-time payment • Lifetime access</p>
              </div>

              <div className="space-y-3 mb-6">
                <Button variant="emerald" className="w-full h-12 text-lg font-semibold">
                  <Download className="w-5 h-5 mr-2" />
                  Buy Now
                </Button>
                <Button variant="outline_emerald" className="w-full">
                  <Play className="w-4 h-4 mr-2" />
                  Watch Demo
                </Button>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-profit" />
                  <span>One-click MT4/MT5 install</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-profit" />
                  <span>Lifetime free updates</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-profit" />
                  <span>30-day money-back guarantee</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-profit" />
                  <span>Priority support included</span>
                </div>
              </div>
            </div>

            {/* Profit Calculator */}
            <div className="card-glass p-6 rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="w-5 h-5 text-accent" />
                <h3 className="font-bold text-foreground">Profit Calculator</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Your Account Balance</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <input
                      type="number"
                      value={balance}
                      onChange={(e) => setBalance(e.target.value)}
                      className="w-full bg-card/50 border border-border/50 rounded-lg px-8 py-3 text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-border/50">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Projected Monthly</span>
                    <span className="font-bold text-profit">+${projectedMonthly}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Projected Yearly</span>
                    <span className="font-bold text-profit">+${projectedYearly}</span>
                  </div>
                  <p className="text-xs text-muted-foreground/70 pt-2">
                    *Based on {product.monthlyReturn}% avg monthly return. Past performance doesn't guarantee future results.
                  </p>
                </div>
              </div>
            </div>

            {/* Copy Trade */}
            <div className="card-glass p-6 rounded-2xl border-primary/30">
              <div className="flex items-center gap-2 mb-3">
                <Copy className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-foreground">Copy This Trader</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Automatically copy {product.creator}'s live trades to your account.
              </p>
              <Button variant="outline" className="w-full">
                <Zap className="w-4 h-4 mr-2" />
                Enable Copy Trading
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetailPage;
