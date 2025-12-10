import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Sale {
  id: number;
  product: string;
  price: number;
  buyer: string;
  timeAgo: string;
}

const mockSales: Omit<Sale, "id" | "timeAgo">[] = [
  { product: "Vortex Sniper EA", price: 799, buyer: "John" },
  { product: "Quantum Scalper Pro", price: 499, buyer: "Sarah" },
  { product: "ICT Killzone Indicator", price: 297, buyer: "Michael" },
  { product: "Smart Money Signals", price: 149, buyer: "David" },
  { product: "Neural Net EA v3", price: 1299, buyer: "Emma" },
  { product: "Liquidity Hunter", price: 399, buyer: "James" },
  { product: "Order Block Scanner", price: 249, buyer: "Lisa" },
  { product: "Prop Firm Passer EA", price: 599, buyer: "Alex" },
];

const LiveTicker = ({ className }: { className?: string }) => {
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    // Initial sales
    const initialSales = mockSales.slice(0, 5).map((sale, i) => ({
      ...sale,
      id: i,
      timeAgo: `${Math.floor(Math.random() * 10) + 1}m ago`
    }));
    setSales(initialSales);

    // Add new sales periodically
    const interval = setInterval(() => {
      const randomSale = mockSales[Math.floor(Math.random() * mockSales.length)];
      const newSale: Sale = {
        ...randomSale,
        id: Date.now(),
        timeAgo: "Just now"
      };
      setSales(prev => [newSale, ...prev.slice(0, 4)]);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={cn("overflow-hidden", className)}>
      <div className="flex items-center gap-8 animate-ticker whitespace-nowrap">
        {sales.map((sale) => (
          <div 
            key={sale.id}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border/30 backdrop-blur-sm"
          >
            <span className="flex h-2 w-2 rounded-full bg-profit animate-pulse" />
            <span className="text-sm text-muted-foreground">
              <span className="text-foreground font-medium">{sale.buyer}</span>
              {" bought "}
              <span className="text-primary font-medium">{sale.product}</span>
              {" for "}
              <span className="text-profit font-bold">${sale.price}</span>
              {" • "}
              <span className="text-muted-foreground">{sale.timeAgo}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveTicker;