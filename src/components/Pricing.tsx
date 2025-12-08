import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Shield, Zap } from "lucide-react";

const included = [
  "8-week institutional trading curriculum (43+ hours)",
  "Smart Money Concepts & Order Flow mastery",
  "7 backtested A+ setups with proven edge",
  "Live weekly Trading Floor sessions",
  "Notion-based member portal & strategy vault",
  "Trade journal templates & backtest spreadsheets",
  "1-year full access + lifetime updates",
  "30-day Funding Challenge Playbook ($497 value)",
  "Private Discord + 24/7 mentor access ($1,997 value)",
  "Custom TradingView indicators ($799 value)",
  "The Black Book: 50+ setups ($997 value)",
];

const Pricing = () => {
  return (
    <section className="relative py-24 md:py-32 bg-obsidian overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.08),transparent_60%)]" />

      <div className="container relative z-10 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <p className="section-label mb-4">Investment</p>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mb-6">
              <span className="text-foreground">Choose Your</span>
              <br />
              <span className="gold-text">Path to Funded</span>
            </h2>
          </div>

          {/* Pricing Card */}
          <div className="relative p-8 md:p-12 rounded-3xl bg-card border border-primary/30 shadow-xl shadow-primary/10">
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full bg-gold-gradient">
              <span className="text-sm font-bold text-primary-foreground">MOST POPULAR</span>
            </div>

            {/* Header */}
            <div className="text-center mb-8 pt-4">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                The Funded Trader Protocol
              </h3>
              <p className="text-muted-foreground">Complete 8-Week Trading Transformation</p>
            </div>

            {/* Value Stack */}
            <div className="p-6 rounded-2xl bg-secondary/30 mb-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-center md:text-left">
                  <p className="text-sm text-muted-foreground line-through">Total Value: $15,287</p>
                  <p className="text-muted-foreground">Today's Investment:</p>
                </div>
                <div className="text-center md:text-right">
                  <p className="text-5xl md:text-6xl font-black gold-text">$1,997</p>
                  <p className="text-muted-foreground">one-time payment</p>
                </div>
              </div>
              <div className="text-center mt-4 pt-4 border-t border-border/50">
                <p className="text-muted-foreground">or 3 payments of <span className="text-foreground font-bold">$797</span></p>
              </div>
            </div>

            {/* What's Included */}
            <div className="mb-8">
              <p className="text-sm uppercase tracking-wider text-muted-foreground font-medium mb-4">Everything Included:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {included.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-profit/20 flex items-center justify-center mt-0.5">
                      <Check className="w-3 h-3 text-profit" />
                    </div>
                    <p className="text-sm text-foreground/90">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <Button variant="hero" size="xl" className="w-full group">
              Enroll Now — Claim Your Seat
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>

            {/* Trust Elements */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span>60-day money-back guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <span>Instant access after purchase</span>
              </div>
            </div>
          </div>

          {/* Scarcity */}
          <div className="mt-8 p-6 rounded-2xl bg-card/50 border border-border/50 text-center">
            <p className="text-foreground font-semibold mb-2">
              ⚠️ Only 500 spots available per quarter
            </p>
            <p className="text-muted-foreground text-sm">
              We cap enrollment to ensure every student gets personal attention. Once spots are filled, registration closes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
