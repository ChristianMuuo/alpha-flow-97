import { useState } from "react";
import { ChevronDown, Clock, Video, FileText, Download, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

const modules = [
  {
    week: "Week 1",
    title: "The Obsidian Foundation",
    duration: "5 hours",
    lessons: [
      "Why 95% of traders fail (and how we engineer your success)",
      "Market microstructure: How forex actually works at the institutional level",
      "The Obsidian AI Onboarding: Setting up your personal trading co-pilot",
      "The 4 session windows that print money consistently",
    ],
    transformation: "You'll understand how smart money moves — and have your AI co-pilot configured.",
  },
  {
    week: "Week 2",
    title: "Smart Money Concepts 2.0",
    duration: "6.5 hours",
    lessons: [
      "Order blocks, breaker blocks & mitigation zones (AI-enhanced detection)",
      "Liquidity engineering: Where stops get hunted and why",
      "Fair value gaps and institutional imbalances",
      "Market structure shifts vs. genuine reversals",
    ],
    transformation: "You'll see the market through institutional eyes with AI highlighting key levels.",
  },
  {
    week: "Week 3",
    title: "Order Flow & Volume Mastery",
    duration: "6 hours",
    lessons: [
      "Real-time order flow reading with Bookmap integration",
      "Volume profile: POC, value areas, and virgin levels decoded",
      "Footprint charts for surgical entry precision",
      "COT data analysis and smart positioning",
    ],
    transformation: "You'll know where the big players are positioned before the move happens.",
  },
  {
    week: "Week 4",
    title: "Price Action Supremacy",
    duration: "5.5 hours",
    lessons: [
      "Candlestick patterns that actually work (backed by 10-year data)",
      "Multi-timeframe confluence systems",
      "Support & resistance zones institutions respect",
      "Trend identification without lagging indicators",
    ],
    transformation: "Your charts become crystal clear. Analysis paralysis disappears.",
  },
  {
    week: "Week 5",
    title: "The A+ Setup Arsenal",
    duration: "7 hours",
    lessons: [
      "The 12 setups with 65%+ historical win rates",
      "Session-specific strategies (London Open, NY Killzone, Asia Range)",
      "AI pattern recognition: Automating setup alerts",
      "Building your personal A+ checklist with scoring system",
    ],
    transformation: "You'll have a repeatable system with mathematical edge — AI-verified.",
  },
  {
    week: "Week 6",
    title: "Prop Firm Risk Engineering",
    duration: "5 hours",
    lessons: [
      "Position sizing formulas used by $1M+ funded accounts",
      "The 0.5% rule and drawdown recovery protocols",
      "Correlation risk and portfolio heat management",
      "Challenge-specific risk parameters (FTMO, The5ers, Topstep)",
    ],
    transformation: "You'll never blow another account. Your risk is institutionally calibrated.",
  },
  {
    week: "Week 7",
    title: "Trading Psychology Lab",
    duration: "5.5 hours",
    lessons: [
      "The neuroscience of fear, greed, and FOMO",
      "AI behavioral analysis: Identifying your patterns",
      "Pre-trade routines and mindset rituals of elite traders",
      "Handling losses, drawdowns, and winning streaks",
    ],
    transformation: "Your psychology becomes an asset. The AI coach keeps you accountable.",
  },
  {
    week: "Week 8",
    title: "Advanced Market Analysis",
    duration: "6 hours",
    lessons: [
      "Intermarket analysis: DXY, bonds, and risk correlations",
      "News trading with institutional timing",
      "Seasonality patterns and calendar effects",
      "Building custom AI market scanners",
    ],
    transformation: "You'll read markets like a hedge fund analyst with AI-powered dashboards.",
  },
  {
    week: "Week 9",
    title: "The Prop Firm Gauntlet",
    duration: "7 hours",
    lessons: [
      "Prop firm evaluation rules decoded (all major firms)",
      "The exact 30-day challenge passing strategy",
      "Simulated challenge environment with real spreads",
      "Common pitfalls and how to avoid them",
    ],
    transformation: "You'll be ready to crush any prop firm challenge with confidence.",
  },
  {
    week: "Week 10",
    title: "Funded Trader Operations",
    duration: "5.5 hours",
    lessons: [
      "Managing a funded account: Scaling and compounding",
      "Tax optimization for trading income",
      "Building multiple funded accounts",
      "Long-term wealth building as a funded trader",
    ],
    transformation: "You'll operate like a professional trader managing real capital.",
  },
];

const Curriculum = () => {
  const [openModule, setOpenModule] = useState<number | null>(0);

  return (
    <section className="relative py-24 md:py-32 bg-obsidian overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--border)/0.2)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.2)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />

      <div className="container relative z-10 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <p className="section-label mb-4">Elite Curriculum</p>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mb-6">
              <span className="text-foreground">10 Weeks to</span>
              <br />
              <span className="gold-text">Institutional Mastery</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              59+ hours of AI-enhanced training. 12 elite modules. Every lesson designed to transform you into a funded professional.
            </p>
          </div>

          {/* Module Accordion */}
          <div className="space-y-4">
            {modules.map((module, index) => (
              <div 
                key={index}
                className={cn(
                  "rounded-2xl border transition-all duration-300",
                  openModule === index 
                    ? "bg-card border-primary/30" 
                    : "bg-card/50 border-border/50 hover:border-border"
                )}
              >
                <button
                  onClick={() => setOpenModule(openModule === index ? null : index)}
                  className="w-full p-6 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-4">
                    <span className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center font-mono text-sm font-bold text-primary">
                      {(index + 1).toString().padStart(2, '0')}
                    </span>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{module.week}</p>
                      <h3 className="text-lg md:text-xl font-bold text-foreground">
                        {module.title}
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {module.duration}
                    </span>
                    <ChevronDown 
                      className={cn(
                        "w-5 h-5 text-muted-foreground transition-transform duration-300",
                        openModule === index && "rotate-180"
                      )} 
                    />
                  </div>
                </button>

                {openModule === index && (
                  <div className="px-6 pb-6">
                    <div className="pl-16 border-l border-border/50 ml-6 space-y-4">
                      {/* Lessons */}
                      <div className="space-y-2">
                        {module.lessons.map((lesson, i) => (
                          <div key={i} className="flex items-center gap-3 text-foreground/80">
                            <Video className="w-4 h-4 text-primary flex-shrink-0" />
                            <span className="text-sm">{lesson}</span>
                          </div>
                        ))}
                      </div>

                      {/* Transformation */}
                      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                        <p className="text-sm text-primary font-medium mb-1">After this module:</p>
                        <p className="text-foreground/90">{module.transformation}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Extras */}
          <div className="mt-12 p-8 rounded-2xl bg-card/50 border border-border/50">
            <h3 className="text-xl font-bold text-center mb-6">Also Included:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50">
                <Cpu className="w-5 h-5 text-primary" />
                <span className="text-sm text-foreground">AI Co-Pilot Access</span>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50">
                <FileText className="w-5 h-5 text-primary" />
                <span className="text-sm text-foreground">Notion Strategy Vault</span>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50">
                <Download className="w-5 h-5 text-primary" />
                <span className="text-sm text-foreground">AI Trade Journal</span>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50">
                <Video className="w-5 h-5 text-primary" />
                <span className="text-sm text-foreground">Daily Desk Broadcasts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Curriculum;
