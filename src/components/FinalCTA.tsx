import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Users } from "lucide-react";

const FinalCTA = () => {
  return (
    <section className="relative py-24 md:py-32 bg-background overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.1),transparent_50%)]" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="container relative z-10 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Urgency */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-loss/10 border border-loss/20 mb-8">
            <Users className="w-4 h-4 text-loss" />
            <span className="text-sm font-semibold text-loss">Only 1,000 Lifetime Members — Ever</span>
          </div>

          {/* Headline */}
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mb-6">
            <span className="text-foreground">The Market Doesn't Wait.</span>
            <br />
            <span className="gold-text">Neither Should You.</span>
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            In 10 weeks, you'll have the AI-powered edge, the institutional skills, and the confidence to become a funded professional — 
            or get your money back plus $500. <span className="text-foreground font-semibold">Zero risk. Infinite upside.</span>
          </p>

          {/* CTA */}
          <Button variant="hero" size="xl" className="group">
            Apply for Obsidian Desk
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>

          <p className="mt-6 text-sm text-muted-foreground">
            $2,997 one-time or 3x $1,197 • 90-day guarantee • Instant access
          </p>

          {/* Final Trust */}
          <div className="mt-12 flex items-center justify-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Average time to funded account: 47 days</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
