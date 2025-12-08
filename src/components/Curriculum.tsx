import { useState } from "react";
import { ChevronDown, Clock, Video, FileText, Download } from "lucide-react";
import { cn } from "@/lib/utils";

const modules = [
  {
    week: "Week 1",
    title: "The Foundation: Market DNA",
    duration: "4.5 hours",
    lessons: [
      "Why 95% of traders fail (and how you'll be different)",
      "Market microstructure: How forex actually works",
      "Institutional players: Banks, hedge funds, and their footprints",
      "The only 3 session windows that matter",
    ],
    transformation: "You'll understand how money really moves in forex — no more guessing.",
  },
  {
    week: "Week 2",
    title: "Smart Money Concepts Decoded",
    duration: "6 hours",
    lessons: [
      "Order blocks, breaker blocks & mitigation zones",
      "Liquidity pools: Where stops get hunted",
      "Fair value gaps and imbalances",
      "Market structure shifts vs. breaks of structure",
    ],
    transformation: "You'll see the market through institutional eyes for the first time.",
  },
  {
    week: "Week 3",
    title: "Pure Price Action Mastery",
    duration: "5.5 hours",
    lessons: [
      "Candlestick patterns that actually work (backed by data)",
      "Multi-timeframe confluence systems",
      "Support & resistance zones that institutions respect",
      "Trend identification without lagging indicators",
    ],
    transformation: "Your charts become crystal clear. No more analysis paralysis.",
  },
  {
    week: "Week 4",
    title: "Order Flow & Volume Profile",
    duration: "5 hours",
    lessons: [
      "Reading order flow in real-time",
      "Volume profile: POC, value areas, and virgin levels",
      "Footprint charts for precision entries",
      "COT data and positioning analysis",
    ],
    transformation: "You'll know where the big players are positioned before they move.",
  },
  {
    week: "Week 5",
    title: "The A+ Setup Playbook",
    duration: "7 hours",
    lessons: [
      "The 7 setups with 60%+ historical win rates",
      "Entry triggers, stop placement & target logic",
      "Session-specific strategies (London, NY, Asia)",
      "Building your personal setup checklist",
    ],
    transformation: "You'll have a repeatable system with a proven statistical edge.",
  },
  {
    week: "Week 6",
    title: "Risk Management Like a Pro",
    duration: "4 hours",
    lessons: [
      "Position sizing formulas used by prop firms",
      "The 0.5-1% rule and why it's non-negotiable",
      "Correlation risk and portfolio heat",
      "Drawdown recovery protocols",
    ],
    transformation: "You'll never blow another account. Guaranteed.",
  },
  {
    week: "Week 7",
    title: "Trading Psychology Deep Dive",
    duration: "5 hours",
    lessons: [
      "The neuroscience of fear and greed",
      "Building unshakeable trading discipline",
      "Pre-trade routines and mindset rituals",
      "Handling losses, drawdowns, and FOMO",
    ],
    transformation: "Your emotions become an asset, not a liability.",
  },
  {
    week: "Week 8",
    title: "The Funded Trader Fast-Track",
    duration: "6 hours",
    lessons: [
      "Prop firm evaluation rules decoded",
      "The exact 30-day challenge strategy",
      "Risk parameters for each major prop firm",
      "What to do after you're funded",
    ],
    transformation: "You'll be ready to pass your first prop challenge with confidence.",
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
            <p className="section-label mb-4">Full Curriculum</p>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mb-6">
              <span className="text-foreground">8 Weeks to</span>
              <br />
              <span className="gold-text">Trading Mastery</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              43+ hours of institutional-grade training. Every lesson designed to build on the last.
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
                      {module.week.split(" ")[1]}
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50">
                <FileText className="w-5 h-5 text-primary" />
                <span className="text-sm text-foreground">Notion Strategy Vault</span>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50">
                <Download className="w-5 h-5 text-primary" />
                <span className="text-sm text-foreground">Trade Journal Templates</span>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50">
                <Video className="w-5 h-5 text-primary" />
                <span className="text-sm text-foreground">Weekly Live Sessions</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Curriculum;
