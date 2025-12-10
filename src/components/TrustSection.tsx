import { Shield, ExternalLink } from "lucide-react";

const logos = [
  { name: "ForexFactory", abbr: "FF" },
  { name: "BabyPips", abbr: "BP" },
  { name: "TradingView", abbr: "TV" },
  { name: "EarnForex", abbr: "EF" },
  { name: "Myfxbook", abbr: "MFX" },
  { name: "FXBlue", abbr: "FXB" },
];

const testimonials = [
  {
    quote: "Finally, a marketplace where I can verify results BEFORE I buy. No more fake screenshots.",
    author: "Mark R.",
    role: "Prop Trader, FTMO Funded",
    profit: "+$47,892 last month",
  },
  {
    quote: "Sold $12k in my first 30 days. The audience is serious traders, not beginners looking for magic.",
    author: "Sarah K.",
    role: "EA Developer",
    profit: "247 sales",
  },
  {
    quote: "The backtester alone is worth 10x any subscription. Saves me hours every week.",
    author: "James L.",
    role: "Quantitative Analyst",
    profit: "2,400+ backtests run",
  },
];

const TrustSection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/10 to-background" />

      <div className="container relative z-10 px-6">
        {/* As Seen On */}
        <div className="text-center mb-20">
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-8">
            Trusted by traders featured on
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {logos.map((logo) => (
              <div 
                key={logo.name}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-sm font-bold font-mono group-hover:bg-primary/20 transition-colors">
                  {logo.abbr}
                </div>
                <span className="hidden sm:block font-medium">{logo.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div 
              key={testimonial.author}
              className="p-8 rounded-2xl card-glass group hover:border-primary/30 transition-all duration-500"
            >
              {/* Quote */}
              <p className="text-lg text-foreground leading-relaxed mb-6">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-foreground">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-profit">{testimonial.profit}</p>
                </div>
              </div>

              {/* Verified Badge */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Verified Apex Member</span>
              </div>
            </div>
          ))}
        </div>

        {/* Wall of Fame CTA */}
        <div className="text-center mt-16">
          <a 
            href="#" 
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors group"
          >
            <span className="font-medium">See our Top 50 Verified Traders</span>
            <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;