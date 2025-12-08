import { X, AlertTriangle, TrendingDown } from "lucide-react";

const problems = [
  "You've blown 2, 3, maybe 5+ accounts and tell yourself 'this time will be different'",
  "You've bought $2,000 worth of courses that taught you nothing but indicator soup",
  "You revenge trade after losses, then over-leverage to 'make it back'",
  "You have no idea why price moves — you just hope your setup works",
  "You've never passed a prop firm challenge (or can't stay funded for 3 months)",
  "You're terrified of the markets, yet you can't stop trading",
];

const Problem = () => {
  return (
    <section className="relative py-24 md:py-32 bg-obsidian overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--loss)/0.1),transparent_50%)]" />
      
      <div className="container relative z-10 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Section Label */}
          <p className="section-label text-center mb-4">The Brutal Truth</p>
          
          {/* Headline */}
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-center mb-6">
            <span className="text-foreground">95% of Forex Traders</span>
            <br />
            <span className="text-loss">Lose Money. Period.</span>
          </h2>
          
          <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-16">
            Not because they're stupid. Not because they don't work hard. Because they're playing a game designed for institutions — with retail tools.
          </p>

          {/* Problem List */}
          <div className="space-y-4">
            {problems.map((problem, index) => (
              <div 
                key={index}
                className="flex items-start gap-4 p-5 rounded-xl bg-card/30 border border-loss/20 backdrop-blur-sm group hover:border-loss/40 transition-colors"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-loss/20 flex items-center justify-center">
                  <X className="w-4 h-4 text-loss" />
                </div>
                <p className="text-foreground/90 text-base md:text-lg leading-relaxed">
                  {problem}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom Statement */}
          <div className="mt-16 p-8 rounded-2xl bg-card/50 border border-border/50 text-center">
            <AlertTriangle className="w-12 h-12 text-primary mx-auto mb-4" />
            <p className="text-xl md:text-2xl font-semibold text-foreground mb-2">
              If this sounds like you, you're not broken.
            </p>
            <p className="text-muted-foreground text-lg">
              You were just never taught how to <span className="text-primary font-semibold">actually</span> trade.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Problem;
