import { Button } from "@/components/ui/button";
import { ArrowRight, Play, TrendingUp, Shield, Zap, Users } from "lucide-react";
import AnimatedChart from "./AnimatedChart";
import TypewriterText from "./TypewriterText";
import LiveTicker from "./LiveTicker";

const heroTaglines = [
  "The Only Place Elite Forex Traders Buy & Sell Signals",
  "Where 6-Figure Strategies Are Actually Sold",
  "Deploy Your EA in 11 Seconds. Start Profiting in 12.",
  "Verified Results. Real Traders. Zero Bullsh*t.",
  "The Underground Marketplace for Forex Alpha"
];

const Hero = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Animated Chart Background */}
      <AnimatedChart className="z-0" />
      
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background z-10" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-[200px] animate-pulse-slow z-0" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[150px] z-0" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan/5 rounded-full blur-[120px] z-0" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-grid-pattern [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)] z-10" />

      <div className="container relative z-20 px-6 py-20 md:py-32">
        <div className="max-w-6xl mx-auto text-center">
          {/* Live Sales Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border/50 backdrop-blur-sm mb-8 animate-fade-in">
            <span className="flex h-2 w-2 rounded-full bg-profit animate-pulse" />
            <span className="text-sm text-muted-foreground font-medium">
              <span className="text-profit font-bold">$47,892</span> in sales today
              <span className="mx-2 text-border">•</span>
              <span className="text-foreground font-bold">2,847</span> verified traders
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight mb-4 animate-slide-up font-display" style={{ animationDelay: "0.1s" }}>
            <span className="block text-foreground">APEX</span>
            <span className="block emerald-text emerald-glow">FOREX</span>
          </h1>

          {/* Typewriter Tagline */}
          <div className="h-16 md:h-20 flex items-center justify-center mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <TypewriterText 
              texts={heroTaglines}
              className="text-lg md:text-2xl text-muted-foreground font-medium max-w-3xl"
              speed={40}
              pauseDuration={4000}
            />
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <Button variant="hero" size="xl" className="group w-full sm:w-auto">
              Browse Marketplace
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline_emerald" size="xl" className="w-full sm:w-auto group">
              <Play className="w-5 h-5" />
              See How It Works
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl card-glass">
              <TrendingUp className="w-5 h-5 text-profit" />
              <div className="text-left">
                <p className="text-xl font-bold text-foreground font-display">$12.4M</p>
                <p className="text-xs text-muted-foreground">Total Volume</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl card-glass">
              <Users className="w-5 h-5 text-primary" />
              <div className="text-left">
                <p className="text-xl font-bold text-foreground font-display">8,432</p>
                <p className="text-xs text-muted-foreground">Active Traders</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl card-glass">
              <Shield className="w-5 h-5 text-accent" />
              <div className="text-left">
                <p className="text-xl font-bold text-foreground font-display">247</p>
                <p className="text-xs text-muted-foreground">Verified Sellers</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl card-glass">
              <Zap className="w-5 h-5 text-cyan" />
              <div className="text-left">
                <p className="text-xl font-bold text-foreground font-display">9% Fee</p>
                <p className="text-xs text-muted-foreground">Lowest in Market</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Sales Ticker */}
      <div className="absolute bottom-8 left-0 right-0 z-20">
        <LiveTicker />
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
};

export default Hero;