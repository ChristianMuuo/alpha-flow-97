import { 
  Zap, Shield, BarChart3, Bot, Calculator, 
  Clock, Download, Users, Sparkles, TrendingUp 
} from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Shield,
    title: "Verified Live Results",
    description: "Every product connected to Myfxbook/FXBlue. Green badge = <25% DD, Sharpe >1.5.",
    color: "text-profit",
    bgColor: "bg-profit/10",
  },
  {
    icon: Download,
    title: "One-Click MT4/MT5 Install",
    description: "Buy an EA, click install. Auto-deploys to your terminal in under 11 seconds.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Calculator,
    title: "Built-in Profit Calculator",
    description: "Input your balance → see projected monthly returns based on historical data.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: BarChart3,
    title: "Instant Backtester",
    description: "Upload any EA → get a 10-year backtest with Monte Carlo simulation in 8 seconds.",
    color: "text-cyan",
    bgColor: "bg-cyan/10",
  },
  {
    icon: Bot,
    title: "AI Trade Analyzer",
    description: "Our AI scans your strategy and identifies edge, weaknesses, and optimization paths.",
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
  },
  {
    icon: TrendingUp,
    title: "Signal Accuracy Tracker",
    description: "Live win-rate heatmaps for every signal provider. See their actual track record.",
    color: "text-profit",
    bgColor: "bg-profit/10",
  },
  {
    icon: Users,
    title: "Copy Trade Integration",
    description: "One button to copy any verified seller's trades directly to your account.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Clock,
    title: "Risk of Ruin Calculator",
    description: "Monte Carlo your strategy. See exactly when and how you might blow your account.",
    color: "text-loss",
    bgColor: "bg-loss/10",
  },
];

const Features = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-card/20 via-background to-card/20" />

      <div className="container relative z-10 px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="section-label mb-2">WHY APEX</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground font-display mb-4">
            Features That Make Competitors <span className="text-loss line-through">Cry</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built by prop traders, for prop traders. Every feature designed to eliminate 
            the BS and surface only what matters: verified edge.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="group p-6 rounded-2xl card-glass hover:border-primary/30 transition-all duration-500 hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110",
                feature.bgColor
              )}>
                <feature.icon className={cn("w-6 h-6", feature.color)} />
              </div>
              <h3 className="text-lg font-bold text-foreground font-display mb-2 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="mt-16 p-8 rounded-2xl card-glass border-primary/20 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-accent" />
            <span className="text-sm font-medium text-accent uppercase tracking-wider">Coming Soon</span>
          </div>
          <h3 className="text-2xl font-bold text-foreground font-display mb-2">
            AI-Powered Strategy Builder
          </h3>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Describe your strategy in plain English → Our AI writes, backtests, and deploys 
            the Pine Script or MQL4 code for you. Beta launching Q1 2026.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Features;