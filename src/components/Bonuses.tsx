import { Gift, Rocket, MessageSquare, Code, BookOpen, Bot, BarChart3, Trophy } from "lucide-react";

const bonuses = [
  {
    icon: Rocket,
    title: "30-Day Prop Firm Simulator",
    value: "$1,997",
    description: "Simulated challenge environment with real spreads, slippage, and prop firm rules. Practice until you're ready to pass any evaluation.",
  },
  {
    icon: Bot,
    title: "AI Trading Co-Pilot (1-Year License)",
    value: "$4,997",
    description: "24/7 AI that scans markets, alerts A+ setups, analyzes your journal, and roasts your bad trades with dark humor. Your personal trading analyst.",
  },
  {
    icon: MessageSquare,
    title: "Private Community + Mentor Access",
    value: "$2,997",
    description: "Elite Discord with gamified leaderboards, weekly office hours, and direct access to funded traders. No noise, no gurus — just results.",
  },
  {
    icon: Code,
    title: "15+ Pine Script Indicators (Lifetime)",
    value: "$1,497",
    description: "Proprietary order block, liquidity zone, session time, and AI-enhanced indicators. Full source code access. Use them forever.",
  },
  {
    icon: BookOpen,
    title: "The Black Book: 75+ Setups",
    value: "$1,997",
    description: "Institutional-grade setup playbook with exact entry triggers, stop placement, and target rules. Each setup backtested across 10+ years.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Market Data Suite",
    value: "$1,497",
    description: "Live TradingView charts, Bookmap order flow, COT dashboards, correlation matrix, and session heatmaps. All integrated, zero delay.",
  },
  {
    icon: Trophy,
    title: "Funded Trader Hall of Fame Access",
    value: "$997",
    description: "Anonymized P&L leaderboards, top trader strategies revealed, and monthly AMAs with our most successful funded members.",
  },
];

const Bonuses = () => {
  const totalValue = bonuses.reduce((sum, b) => sum + parseInt(b.value.replace(/[^0-9]/g, '')), 0);

  return (
    <section className="relative py-24 md:py-32 bg-background overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />

      <div className="container relative z-10 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Gift className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Exclusive Bonuses</span>
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mb-6">
              <span className="text-foreground">The Obsidian</span>
              <br />
              <span className="gold-text">Vault Unlocked</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              When you join Obsidian Desk, you unlock everything in the vault. These aren't upsells — they're included.
            </p>
          </div>

          {/* Bonus Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bonuses.map((bonus, index) => (
              <div 
                key={index}
                className="group relative p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 overflow-hidden"
              >
                {/* Value Badge */}
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                  <span className="text-xs font-bold text-primary">{bonus.value}</span>
                </div>

                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <bonus.icon className="w-6 h-6 text-primary" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-foreground mb-2 pr-16">
                  {bonus.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {bonus.description}
                </p>

                {/* Decorative */}
                <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>

          {/* Total Value */}
          <div className="mt-12 p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 text-center">
            <p className="text-muted-foreground mb-2">Total Bonus Value:</p>
            <p className="text-4xl md:text-5xl font-black gold-text">${totalValue.toLocaleString()}</p>
            <p className="text-lg text-foreground mt-2">All Yours When You Join Obsidian Desk</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Bonuses;
