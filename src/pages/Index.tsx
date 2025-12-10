import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import Leaderboard from "@/components/Leaderboard";
import Features from "@/components/Features";
import CreatorCTA from "@/components/CreatorCTA";
import TrustSection from "@/components/TrustSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <FeaturedProducts />
      <Leaderboard />
      <Features />
      <CreatorCTA />
      <TrustSection />
      <Footer />
    </main>
  );
};

export default Index;