import { Bot, Brain, LineChart, Mic, FileText, Sparkles, Zap, Target } from "lucide-react";

const aiFeatures = [
  {
    icon: Bot,
    title: "AI Trading Co-Pilot",
    description: "Your personal AI analyst that scans charts 24/7 and alerts you ONLY when A+ setups matching your strategy appear. No more screen watching.",
    highlight: "Fine-tuned on 10+ years of institutional data",
  },
  {
    icon: Brain,
    title: "Behavioral AI Coach",
    description: "Analyzes your trade journal entries and identifies psychological patterns holding you back. Gets brutally honest about your mistakes.",
    highlight: "Dark humor included",
  },
  {
    icon: LineChart,
    title: "Instant Backtester",
    description: "Describe any setup in plain English → AI writes Pine Script → runs 10-year backtest → Monte Carlo simulation → expectancy report. In seconds.",
    highlight: "No coding required",
  },
  {
    icon: FileText,
    title: "Auto Trade Journal",
    description: "Screenshot your chart or connect MT5/TradingView — AI auto-fills your journal with entry, exit, R:R, session, and tags. Zero manual work.",
    highlight: "Syncs with TraderSync & Edgewonk",
  },
  {
    icon: Mic,
    title: "Voice Market Recaps",
    description: "Daily institutional-style market briefings generated in YOUR voice and trading style. Like having a senior analyst on your team.",
    highlight: "9:30 AM EST every trading day",
  },
  {
    icon: Sparkles,
    title: "AI Strategy Builder",
    description: "Describe your edge in plain English: 'I want to trade London session order blocks with 3R minimum.' AI builds, tests, and optimizes it.",
    highlight: "Exports to TradingView & MT5",
  },
];

const AIFeatures = () => {
  return (
    <section className="relative py-24 md:py-32 bg-obsidian overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_50%)]" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      {/* Animated Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--primary)/0.05)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--primary)/0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_60%)]" />

      <div className="container relative z-10 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Zap className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm font-semibold text-primary">2025's Most Advanced Trading AI</span>
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mb-6">
              <span className="text-foreground">Your Personal</span>
              <br />
              <span className="gold-text">AI Trading Desk</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Every feature below is powered by AI fine-tuned on institutional trading data. 
              This is what makes Obsidian Desk <span className="text-foreground font-semibold">5 years ahead</span> of every competitor.
            </p>
          </div>

          {/* AI Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {aiFeatures.map((feature, index) => (
              <div 
                key={index}
                className="group relative p-6 rounded-2xl bg-card/50 border border-border/50 hover:border-primary/40 transition-all duration-500 overflow-hidden"
              >
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Icon */}
                <div className="relative w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>

                {/* Content */}
                <h3 className="relative text-lg font-bold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="relative text-muted-foreground text-sm leading-relaxed mb-3">
                  {feature.description}
                </p>
                <p className="relative text-xs text-primary font-medium">
                  ✦ {feature.highlight}
                </p>

                {/* Corner Decoration */}
                <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-primary/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>

          {/* Platform Integration Bar */}
          <div className="p-8 rounded-2xl bg-gradient-to-br from-card via-card to-primary/5 border border-border/50">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-bold text-foreground">Real-Time Market Data</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  TradingView charts • Bookmap order flow • OANDA/LMAX depth • COT reports • Session heatmaps
                </p>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-profit/10 border border-profit/20">
                <span className="flex h-2 w-2 rounded-full bg-profit animate-pulse" />
                <span className="text-sm font-semibold text-profit">Live • Zero Delay</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIFeatures;
