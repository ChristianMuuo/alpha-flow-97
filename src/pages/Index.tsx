import Hero from "@/components/Hero";
import ForexTicker from "@/components/ForexTicker";
import FeaturedProducts from "@/components/FeaturedProducts";
import Leaderboard from "@/components/Leaderboard";
import Features from "@/components/Features";
import CreatorCTA from "@/components/CreatorCTA";
import TrustSection from "@/components/TrustSection";
import TradingViewChart from "@/components/TradingViewChart";
import LiveMarketData from "@/components/LiveMarketData";
import SEO from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SEO
        title="The Funded Trader Protocol"
        description="The No-BS, Institutional-Grade Forex System That Turns Retail Losers Into Funded Professionals."
      />
      <Hero />
      <ForexTicker />

      {/* Live Market Section */}
      <section className="py-16 md:py-24">
        <div className="container px-6">
          <div className="text-center mb-12">
            <p className="section-label mb-3">REAL-TIME DATA</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground font-display mb-4">
              Live <span className="emerald-text">Forex Markets</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Track the markets in real-time with our integrated TradingView charts
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TradingViewChart symbol="FX:EURUSD" height={450} />
            </div>
            <div>
              <LiveMarketData />
            </div>
          </div>
        </div>
      </section>

      <FeaturedProducts />
      <Leaderboard />
      <Features />
      <CreatorCTA />
      <TrustSection />
    </div>
  );
};

export default Index;