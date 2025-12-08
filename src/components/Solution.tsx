import { Check, Zap, Brain, LineChart, Shield } from "lucide-react";

const pillars = [
  {
    icon: LineChart,
    title: "Institutional Order Flow",
    description: "See where banks & hedge funds are positioned. Trade with the big money, not against it.",
  },
  {
    icon: Brain,
    title: "Smart Money Concepts (Simplified)",
    description: "ICT/SMC without the cult-like mysticism. Just pure, logical market structure.",
  },
  {
    icon: Zap,
    title: "Statistical Edge Trading",
    description: "Every setup is backtested across 10+ years. Know your exact win rate before you enter.",
  },
  {
    icon: Shield,
    title: "Prop Firm Risk Management",
    description: "The exact risk protocols used by FTMO, The5ers, and MyForexFunds-funded traders.",
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
              <span className="text-foreground">Introducing</span>
              <br />
              <span className="gold-text">The Funded Trader Protocol</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              The complete institutional trading system that transforms confused retail traders into calm, consistent, funded professionals in 8 weeks.
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

          {/* Unique Value Props */}
          <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-card via-card to-secondary/30 border border-border/50">
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-8">
              What Makes This <span className="gold-text">Different</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                "No fairy-tale 90% win rates — we show you real, backtested edge",
                "No indicator Christmas trees — pure price action + order flow",
                "No 'signal groups' — you learn to fish, not beg for fish",
                "No Lamborghini lifestyle BS — just professional trading skills",
                "Live trade breakdowns with real P&L (the good AND the bad)",
                "Prop firm challenge playbook included (FTMO, The5ers, etc.)",
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
        </div>
      </div>
    </section>
  );
};

export default Solution;
