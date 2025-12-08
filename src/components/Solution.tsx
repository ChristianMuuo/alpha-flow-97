import { Check, Zap, Brain, LineChart, Shield, Cpu, Users } from "lucide-react";

const pillars = [
  {
    icon: LineChart,
    title: "Institutional Order Flow",
    description: "Real-time Bookmap integration. See where banks & hedge funds are positioned. Trade with the big money, not against it.",
  },
  {
    icon: Brain,
    title: "Smart Money Concepts 2.0",
    description: "ICT/SMC decoded and enhanced with AI pattern recognition. No mysticism — just pure, logical market structure.",
  },
  {
    icon: Cpu,
    title: "AI-Powered Analysis",
    description: "24/7 AI Co-Pilot that scans markets, alerts A+ setups, and backtests your ideas in seconds. You focus on execution.",
  },
  {
    icon: Shield,
    title: "Prop Firm Battle-Tested",
    description: "The exact risk protocols and strategies used by our 1,247+ funded traders. Pass your challenge in 30 days or less.",
  },
];

const Solution = () => {
  return (
    <section className="relative py-24 md:py-32 bg-background overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/8 rounded-full blur-[120px]" />

      <div className="container relative z-10 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <p className="section-label mb-4">The Solution</p>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mb-6">
              <span className="text-foreground">Welcome to</span>
              <br />
              <span className="gold-text">Obsidian Desk</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              A $25,000/year proprietary trading desk experience — AI-integrated, institutionally-backed, 
              and designed to turn you into a funded professional in <span className="text-foreground font-semibold">10 weeks</span>.
            </p>
          </div>

          {/* Four Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {pillars.map((pillar, index) => (
              <div 
                key={index}
                className="group p-8 rounded-2xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all duration-300 gradient-border"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <pillar.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3">
                  {pillar.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>

          {/* Platform Features */}
          <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-card via-card to-secondary/30 border border-border/50">
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-8">
              The <span className="gold-text">Complete Ecosystem</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                "Custom membership portal with Notion-style second brain",
                "15+ proprietary Pine Script indicators (lifetime license)",
                "Real-time COT, seasonality & correlation dashboards",
                "Daily 9:30 AM 'Desk Broadcast' live market briefings",
                "Private community with gamification & leaderboards",
                "1-click export to TradingView, MT5 & Tradovate",
              ].map((point, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-profit/20 flex items-center justify-center mt-0.5">
                    <Check className="w-4 h-4 text-profit" />
                  </div>
                  <p className="text-foreground/90 text-sm md:text-base">
                    {point}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Social Proof Bar */}
          <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-8 p-6 rounded-2xl bg-card/30 border border-border/30">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-muted-foreground">Trusted by traders from</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-foreground/60">
              <span>FTMO</span>
              <span>•</span>
              <span>The5ers</span>
              <span>•</span>
              <span>Topstep</span>
              <span>•</span>
              <span>MyFundedFX</span>
              <span>•</span>
              <span>True Forex Funds</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Solution;
