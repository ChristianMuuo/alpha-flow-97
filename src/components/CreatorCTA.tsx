import { Button } from "@/components/ui/button";
import { ArrowRight, DollarSign, Shield, Zap, BarChart3, Users, Lock } from "lucide-react";

const creatorBenefits = [
  { icon: DollarSign, title: "9% + $0.30 Fee", desc: "Lowest in the industry. Keep more." },
  { icon: Shield, title: "Verified Badge", desc: "$99/mo for blue check + priority." },
  { icon: Lock, title: "License Protection", desc: "Built-in MT4/MT5 DRM system." },
  { icon: BarChart3, title: "Analytics Dashboard", desc: "Real-time sales, views, conversions." },
  { icon: Users, title: "Affiliate System", desc: "Recruit sub-affiliates, split royalties." },
  { icon: Zap, title: "Instant Payouts", desc: "Daily payouts via Stripe or Crypto." },
];

const CreatorCTA = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[200px] -translate-y-1/2" />

      <div className="container relative z-10 px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <p className="section-label mb-2">FOR CREATORS</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground font-display mb-6">
              Turn Your Edge Into <span className="emerald-text">Recurring Revenue</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              You spent years developing strategies that actually work. 
              Now monetize them with the most creator-friendly Forex marketplace ever built.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div>
                <p className="stat-value text-foreground">$4.2M</p>
                <p className="text-sm text-muted-foreground">Creator Payouts</p>
              </div>
              <div>
                <p className="stat-value text-profit">$8,492</p>
                <p className="text-sm text-muted-foreground">Avg. Monthly Earning</p>
              </div>
              <div>
                <p className="stat-value text-primary">247</p>
                <p className="text-sm text-muted-foreground">Active Sellers</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="xl" className="group">
                Apply to Sell
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="glass" size="xl">
                Creator Guidelines
              </Button>
            </div>
          </div>

          {/* Right - Benefits Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {creatorBenefits.map((benefit, index) => (
              <div 
                key={benefit.title}
                className="p-5 rounded-xl card-glass hover:border-primary/30 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                  <benefit.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-foreground font-display mb-1">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CreatorCTA;