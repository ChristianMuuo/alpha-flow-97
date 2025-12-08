import { Button } from "@/components/ui/button";
import { ArrowRight, Play, TrendingUp, Shield, Target, Cpu } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-obsidian" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] animate-pulse-slow" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 left-0 w-[300px] h-[300px] bg-profit/5 rounded-full blur-[100px]" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />

      <div className="container relative z-10 px-6 py-20 md:py-32">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 backdrop-blur-sm mb-8 animate-fade-in">
            <span className="flex h-2 w-2 rounded-full bg-profit animate-pulse" />
            <span className="text-sm text-muted-foreground font-medium">
              Only <span className="text-foreground font-bold">1,000</span> lifetime members ever • <span className="text-primary font-bold">AI-Powered</span>
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <span className="block text-foreground">OBSIDIAN</span>
            <span className="block gold-text gold-glow">DESK</span>
          </h1>

          {/* Tagline */}
          <p className="text-lg md:text-xl text-primary font-semibold tracking-wide uppercase mb-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            The Institutional Edge
          </p>

          {/* Sub-headline */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-4 animate-fade-in font-light" style={{ animationDelay: "0.3s" }}>
            The World's First AI-Integrated Trading Desk Membership That Turns Retail Losers Into Funded Professionals
          </p>
          
          <p className="text-base md:text-lg text-muted-foreground/80 max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            10 weeks. AI Co-Pilot. Real edge. Prop firm funded. <span className="text-foreground font-semibold">Or your money back + $500.</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <Button variant="hero" size="xl" className="group w-full sm:w-auto">
              Apply for Membership
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline_gold" size="xl" className="w-full sm:w-auto group">
              <Play className="w-5 h-5" />
              Watch Platform Demo
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: "0.7s" }}>
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-card/50 border border-border/30 backdrop-blur-sm">
              <TrendingUp className="w-5 h-5 text-profit" />
              <div className="text-left">
                <p className="text-xl font-bold text-foreground">1,247+</p>
                <p className="text-xs text-muted-foreground">Funded Traders</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-card/50 border border-border/30 backdrop-blur-sm">
              <Target className="w-5 h-5 text-primary" />
              <div className="text-left">
                <p className="text-xl font-bold text-foreground">73%</p>
                <p className="text-xs text-muted-foreground">Avg. Win Rate</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-card/50 border border-border/30 backdrop-blur-sm">
              <Cpu className="w-5 h-5 text-primary" />
              <div className="text-left">
                <p className="text-xl font-bold text-foreground">24/7</p>
                <p className="text-xs text-muted-foreground">AI Co-Pilot</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-card/50 border border-border/30 backdrop-blur-sm">
              <Shield className="w-5 h-5 text-primary" />
              <div className="text-left">
                <p className="text-xl font-bold text-foreground">90-Day</p>
                <p className="text-xs text-muted-foreground">Funded Guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-obsidian to-transparent" />
    </section>
  );
};

export default Hero;
