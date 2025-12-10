import { TrendingUp, TrendingDown, Shield, ExternalLink, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Trader {
  rank: number;
  name: string;
  avatar: string;
  verified: boolean;
  profit: number;
  drawdown: number;
  winRate: number;
  trades: number;
  equity: number;
  brokerConnected: "myfxbook" | "fxblue" | "darwinex";
}

const mockLeaderboard: Trader[] = [
  { rank: 1, name: "AlphaQuant", avatar: "🏆", verified: true, profit: 312.4, drawdown: 8.2, winRate: 78, trades: 1247, equity: 147892, brokerConnected: "myfxbook" },
  { rank: 2, name: "NeuralFX_Pro", avatar: "🥈", verified: true, profit: 287.1, drawdown: 11.5, winRate: 73, trades: 892, equity: 98432, brokerConnected: "fxblue" },
  { rank: 3, name: "ICT_Master", avatar: "🥉", verified: true, profit: 243.8, drawdown: 9.8, winRate: 71, trades: 2134, equity: 156780, brokerConnected: "myfxbook" },
  { rank: 4, name: "SmartMoney_Mike", avatar: "🎯", verified: true, profit: 198.2, drawdown: 14.2, winRate: 68, trades: 567, equity: 67543, brokerConnected: "darwinex" },
  { rank: 5, name: "OrderFlow_King", avatar: "👑", verified: true, profit: 176.9, drawdown: 12.8, winRate: 72, trades: 1456, equity: 234567, brokerConnected: "myfxbook" },
  { rank: 6, name: "PropFirm_Ace", avatar: "⚡", verified: true, profit: 156.4, drawdown: 7.5, winRate: 75, trades: 345, equity: 45678, brokerConnected: "fxblue" },
];

const brokerLogos = {
  myfxbook: "MFX",
  fxblue: "FXB",
  darwinex: "DWX",
};

const Leaderboard = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/3 rounded-full blur-[200px]" />

      <div className="container relative z-10 px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="section-label mb-2">LIVE PERFORMANCE</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground font-display mb-4">
            Top <span className="emerald-text">Verified</span> Traders
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real-time rankings connected to Myfxbook, FXBlue, and Darwinex. 
            Every number verified. Zero fake screenshots.
          </p>
        </div>

        {/* Leaderboard Table */}
        <div className="max-w-5xl mx-auto">
          <div className="card-glass rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-3">Trader</div>
              <div className="col-span-2 text-right">Profit</div>
              <div className="col-span-2 text-right">Drawdown</div>
              <div className="col-span-2 text-right">Win Rate</div>
              <div className="col-span-2 text-right">Equity</div>
            </div>

            {/* Rows */}
            {mockLeaderboard.map((trader, index) => (
              <div 
                key={trader.rank}
                className={cn(
                  "grid grid-cols-12 gap-4 p-4 items-center transition-all duration-300 hover:bg-primary/5 group cursor-pointer",
                  index !== mockLeaderboard.length - 1 && "border-b border-border/50"
                )}
              >
                {/* Rank */}
                <div className="col-span-1 text-center">
                  {trader.rank <= 3 ? (
                    <span className="text-2xl">{trader.avatar}</span>
                  ) : (
                    <span className="text-lg font-bold text-muted-foreground font-display">{trader.rank}</span>
                  )}
                </div>

                {/* Trader Info */}
                <div className="col-span-3 flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {trader.name}
                      </span>
                      {trader.verified && (
                        <Shield className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span className="px-1.5 py-0.5 rounded bg-secondary text-[10px] font-mono">
                        {brokerLogos[trader.brokerConnected]}
                      </span>
                      <span>{trader.trades} trades</span>
                    </div>
                  </div>
                </div>

                {/* Profit */}
                <div className="col-span-2 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <TrendingUp className="w-4 h-4 text-profit" />
                    <span className="font-bold text-profit font-display">+{trader.profit}%</span>
                  </div>
                </div>

                {/* Drawdown */}
                <div className="col-span-2 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <TrendingDown className="w-4 h-4 text-loss" />
                    <span className="font-medium text-loss">{trader.drawdown}%</span>
                  </div>
                </div>

                {/* Win Rate */}
                <div className="col-span-2 text-right">
                  <span className="font-medium text-foreground">{trader.winRate}%</span>
                </div>

                {/* Equity */}
                <div className="col-span-2 text-right">
                  <span className="font-bold text-foreground font-display">${trader.equity.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-8">
            <Button variant="outline_emerald" size="lg" className="group">
              <Trophy className="w-5 h-5" />
              View Full Leaderboard
              <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-8 mt-16 text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-xs font-bold">MFX</div>
            <span className="text-sm">Myfxbook Verified</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-xs font-bold">FXB</div>
            <span className="text-sm">FXBlue Connected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-xs font-bold">DWX</div>
            <span className="text-sm">Darwinex Synced</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Leaderboard;