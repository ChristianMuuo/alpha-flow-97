import { Shield, CheckCircle } from "lucide-react";

const Guarantee = () => {
  return (
    <section className="relative py-24 md:py-32 bg-background overflow-hidden">
      <div className="container relative z-10 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-primary/10 via-card to-card border border-primary/20">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Shield Icon */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center animate-pulse-slow">
                  <Shield className="w-16 h-16 text-primary" />
                </div>
              </div>

              {/* Content */}
              <div className="text-center md:text-left">
                <h2 className="text-2xl md:text-4xl font-black mb-4">
                  <span className="text-foreground">60-Day</span>{" "}
                  <span className="gold-text">"Profit or Refund"</span>{" "}
                  <span className="text-foreground">Guarantee</span>
                </h2>
                
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  Go through the entire program. Implement the strategies. Trade for 60 days. 
                  If you don't see measurable improvement in your trading — or you're not on track to become funded — 
                  we'll refund 100% of your investment <span className="text-foreground font-semibold">plus give you $100 cash</span> for wasting your time.
                </p>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-profit flex-shrink-0" />
                    <span className="text-foreground">Full 60 days to test the entire system</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-profit flex-shrink-0" />
                    <span className="text-foreground">100% refund if you're not satisfied</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-profit flex-shrink-0" />
                    <span className="text-foreground">Plus $100 cash just for trying</span>
                  </div>
                </div>

                <p className="mt-6 text-sm text-muted-foreground italic">
                  We can offer this because we know the system works. We've seen it transform over 847 traders.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Guarantee;
