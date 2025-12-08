import { Button } from "@/components/ui/button";
import { ArrowRight, Clock } from "lucide-react";

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
            <Clock className="w-4 h-4 text-loss" />
            <span className="text-sm font-semibold text-loss">Only 127 spots remaining for Q1 2025</span>
          </div>

          {/* Headline */}
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mb-6">
            <span className="text-foreground">Stop Losing Money.</span>
            <br />
            <span className="gold-text">Start Trading Like a Pro.</span>
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            In 8 weeks, you'll have the skills, the system, and the confidence to trade profitably — 
            or get your money back plus $100. There's literally zero risk.
          </p>

          {/* CTA */}
          <Button variant="hero" size="xl" className="group">
            Enroll Now — Transform Your Trading
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>

          <p className="mt-6 text-sm text-muted-foreground">
            $1,997 one-time or 3x $797 • 60-day guarantee • Instant access
          </p>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
