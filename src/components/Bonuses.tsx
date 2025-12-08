import { Gift, Rocket, MessageSquare, Code, BookOpen } from "lucide-react";

const bonuses = [
  {
    icon: Rocket,
    title: "30-Day Funding Challenge Playbook",
    value: "$497",
    description: "The exact step-by-step strategy to pass FTMO, The5ers, and MyForexFunds evaluations on your first try.",
  },
  {
    icon: MessageSquare,
    title: "Private Discord + 24/7 Mentor Access",
    value: "$1,997",
    description: "Direct access to funded traders and TAs. Get your questions answered in real-time, not next week.",
  },
  {
    icon: Code,
    title: "Custom TradingView Indicators (Pine Script)",
    value: "$799",
    description: "Proprietary indicators for order blocks, liquidity zones, and session times. Lifetime license included.",
  },
  {
    icon: BookOpen,
    title: "The Black Book: 50+ Institutional Setups",
    value: "$997",
    description: "Detailed playbook with exact entry triggers, stop placement, and target rules for every market condition.",
  },
];

const Bonuses = () => {
  return (
    <section className="relative py-24 md:py-32 bg-background overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />

      <div className="container relative z-10 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Gift className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Exclusive Bonuses</span>
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mb-6">
              <span className="text-foreground">But Wait...</span>
              <br />
              <span className="gold-text">There's More</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              When you enroll today, you also get these exclusive bonuses absolutely free.
            </p>
          </div>

          {/* Bonus Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bonuses.map((bonus, index) => (
              <div 
                key={index}
                className="group relative p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 overflow-hidden"
              >
                {/* Value Badge */}
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                  <span className="text-xs font-bold text-primary">{bonus.value} VALUE</span>
                </div>

                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <bonus.icon className="w-7 h-7 text-primary" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-foreground mb-3 pr-20">
                  {bonus.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {bonus.description}
                </p>

                {/* Decorative */}
                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>

          {/* Total Value */}
          <div className="mt-12 p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 text-center">
            <p className="text-muted-foreground mb-2">Total Bonus Value:</p>
            <p className="text-4xl md:text-5xl font-black gold-text">$4,290</p>
            <p className="text-lg text-foreground mt-2">Yours FREE when you enroll today</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Bonuses;
