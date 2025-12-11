import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, TrendingUp, Shield, Download, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  seller: string;
  sellerVerified: boolean;
  price: number;
  category: "EA" | "Signal" | "Indicator" | "Course";
  stats: {
    profit: number;
    drawdown: number;
    winRate: number;
    months: number;
  };
  rating: number;
  reviews: number;
  downloads: number;
  image: string;
  featured?: boolean;
}

const mockProducts: Product[] = [
  {
    id: "1",
    name: "Vortex Sniper EA",
    seller: "AlphaQuant",
    sellerVerified: true,
    price: 799,
    category: "EA",
    stats: { profit: 247, drawdown: 12, winRate: 73, months: 18 },
    rating: 4.9,
    reviews: 142,
    downloads: 1247,
    image: "🤖",
    featured: true,
  },
  {
    id: "2",
    name: "ICT Killzone Pro",
    seller: "SmartMoneyLabs",
    sellerVerified: true,
    price: 297,
    category: "Indicator",
    stats: { profit: 156, drawdown: 8, winRate: 68, months: 24 },
    rating: 4.8,
    reviews: 89,
    downloads: 2156,
    image: "📊",
  },
  {
    id: "3",
    name: "Quantum Scalper",
    seller: "NeuralFX",
    sellerVerified: true,
    price: 599,
    category: "EA",
    stats: { profit: 189, drawdown: 15, winRate: 71, months: 12 },
    rating: 4.7,
    reviews: 67,
    downloads: 892,
    image: "⚡",
  },
  {
    id: "4",
    name: "Daily Gold Signals",
    seller: "PropTrader_Mike",
    sellerVerified: true,
    price: 149,
    category: "Signal",
    stats: { profit: 312, drawdown: 18, winRate: 76, months: 8 },
    rating: 4.9,
    reviews: 234,
    downloads: 3421,
    image: "📈",
  },
  {
    id: "5",
    name: "SMC Mastery Course",
    seller: "InstitutionalFX",
    sellerVerified: true,
    price: 997,
    category: "Course",
    stats: { profit: 0, drawdown: 0, winRate: 0, months: 0 },
    rating: 4.8,
    reviews: 456,
    downloads: 1892,
    image: "🎓",
  },
  {
    id: "6",
    name: "Liquidity Hunter",
    seller: "OrderFlowPro",
    sellerVerified: true,
    price: 449,
    category: "Indicator",
    stats: { profit: 134, drawdown: 11, winRate: 65, months: 16 },
    rating: 4.6,
    reviews: 78,
    downloads: 1023,
    image: "🎯",
  },
];

const categoryColors = {
  EA: "text-primary bg-primary/10 border-primary/30",
  Signal: "text-accent bg-accent/10 border-accent/30",
  Indicator: "text-cyan bg-cyan/10 border-cyan/30",
  Course: "text-purple-400 bg-purple-400/10 border-purple-400/30",
};

const ProductCard = ({ product }: { product: Product }) => {
  const productSlug = product.name.toLowerCase().replace(/\s+/g, '-');
  
  return (
    <Link 
      to={`/product/${productSlug}`}
      className={cn(
        "product-card group block",
        product.featured && "ring-2 ring-primary/30"
      )}
    >
      {/* Featured Badge */}
      {product.featured && (
        <div className="absolute top-4 right-4 px-2 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
          FEATURED
        </div>
      )}

      {/* Image/Icon */}
      <div className="p-6 pb-0">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary to-muted flex items-center justify-center text-3xl mb-4">
          {product.image}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Category & Verified */}
        <div className="flex items-center gap-2 mb-3">
          <span className={cn(
            "px-2 py-0.5 rounded-full text-xs font-semibold border",
            categoryColors[product.category]
          )}>
            {product.category}
          </span>
          {product.sellerVerified && (
            <span className="verified-badge">
              <Shield className="w-3 h-3" />
              Verified
            </span>
          )}
        </div>

        {/* Name & Seller */}
        <h3 className="text-lg font-bold text-foreground mb-1 font-display group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">by {product.seller}</p>

        {/* Stats (for EAs and Signals) */}
        {(product.category === "EA" || product.category === "Signal") && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-center p-2 rounded-lg bg-profit/10">
              <p className="text-sm font-bold text-profit">+{product.stats.profit}%</p>
              <p className="text-xs text-muted-foreground">Profit</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-loss/10">
              <p className="text-sm font-bold text-loss">{product.stats.drawdown}%</p>
              <p className="text-xs text-muted-foreground">DD</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-primary/10">
              <p className="text-sm font-bold text-primary">{product.stats.winRate}%</p>
              <p className="text-xs text-muted-foreground">Win</p>
            </div>
          </div>
        )}

        {/* Rating & Downloads */}
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-accent fill-accent" />
            <span className="text-foreground font-medium">{product.rating}</span>
            <span>({product.reviews})</span>
          </div>
          <div className="flex items-center gap-1">
            <Download className="w-4 h-4" />
            <span>{product.downloads.toLocaleString()}</span>
          </div>
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between">
          <p className="text-2xl font-bold text-foreground font-display">${product.price}</p>
          <Button variant="emerald" size="sm" className="group/btn">
            <Eye className="w-4 h-4" />
            View
          </Button>
        </div>
      </div>
    </Link>
  );
};

const FeaturedProducts = () => {
  return (
    <section className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/5 to-background" />

      <div className="container relative z-10 px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <p className="section-label mb-2">MARKETPLACE</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground font-display">
              Trending Products
            </h2>
            <p className="text-muted-foreground mt-2 max-w-lg">
              Battle-tested EAs, signals, and indicators with verified live results. Every product backed by real trading data.
            </p>
          </div>
          <Button variant="outline_emerald" className="shrink-0 group">
            View All Products
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Products Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Categories */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-12">
          {["Expert Advisors", "Signals", "Indicators", "Courses", "Prop Firm Tools", "Discord Access"].map((cat) => (
            <Button key={cat} variant="glass" size="sm">
              {cat}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;