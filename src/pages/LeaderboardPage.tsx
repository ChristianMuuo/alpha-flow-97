import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Shield, Star, Filter, ArrowUpDown, ExternalLink } from "lucide-react";
import SEO from "@/components/SEO";

const traders = [
  { rank: 1, name: "AlphaEdge Capital", avatar: "AE", gain: 847.2, drawdown: 8.4, sharpe: 3.2, winRate: 78, trades: 1247, broker: "FTMO", verified: true, followers: 12400 },
  { rank: 2, name: "Vortex Systems", avatar: "VS", gain: 623.8, drawdown: 12.1, sharpe: 2.8, winRate: 72, trades: 892, broker: "MyForexFunds", verified: true, followers: 8900 },
  { rank: 3, name: "Quantum Flow", avatar: "QF", gain: 512.4, drawdown: 15.3, sharpe: 2.4, winRate: 68, trades: 2103, broker: "The5%ers", verified: true, followers: 7200 },
  { rank: 4, name: "Silent Sniper", avatar: "SS", gain: 445.1, drawdown: 9.8, sharpe: 2.6, winRate: 74, trades: 567, broker: "FTMO", verified: true, followers: 5600 },
  { rank: 5, name: "Momentum Masters", avatar: "MM", gain: 398.7, drawdown: 18.2, sharpe: 2.1, winRate: 65, trades: 1834, broker: "Fidelcrest", verified: true, followers: 4800 },
  { rank: 6, name: "Precision Pro", avatar: "PP", gain: 356.2, drawdown: 11.5, sharpe: 2.3, winRate: 71, trades: 743, broker: "E8 Funding", verified: true, followers: 4200 },
  { rank: 7, name: "Night Owl Trading", avatar: "NO", gain: 312.8, drawdown: 14.7, sharpe: 2.0, winRate: 66, trades: 1521, broker: "FTMO", verified: true, followers: 3800 },
  { rank: 8, name: "GridMaster Elite", avatar: "GE", gain: 287.4, drawdown: 22.1, sharpe: 1.7, winRate: 62, trades: 3247, broker: "MyForexFunds", verified: true, followers: 3400 },
  { rank: 9, name: "Scalp King", avatar: "SK", gain: 264.9, drawdown: 16.8, sharpe: 1.9, winRate: 64, trades: 4521, broker: "The5%ers", verified: true, followers: 3100 },
  { rank: 10, name: "Trend Rider", avatar: "TR", gain: 241.3, drawdown: 13.2, sharpe: 2.1, winRate: 69, trades: 612, broker: "FTMO", verified: true, followers: 2800 },
  { rank: 11, name: "ICT Student", avatar: "IS", gain: 218.7, drawdown: 19.4, sharpe: 1.8, winRate: 61, trades: 892, broker: "Fidelcrest", verified: true, followers: 2500 },
  { rank: 12, name: "SMC Trader", avatar: "ST", gain: 195.2, drawdown: 17.6, sharpe: 1.9, winRate: 63, trades: 1124, broker: "E8 Funding", verified: true, followers: 2200 },
];

const timeframes = ["All Time", "This Year", "This Month", "This Week"];
const brokers = ["All Brokers", "FTMO", "MyForexFunds", "The5%ers", "Fidelcrest", "E8 Funding"];

export default function LeaderboardPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("All Time");
  const [selectedBroker, setSelectedBroker] = useState("All Brokers");
  const [sortBy, setSortBy] = useState("gain");

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Leaderboard"
        description="Rankings of top performing traders verified by Myfxbook and prop firms."
      />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent" />
        <div className="container mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 mb-6">
              <Trophy className="w-3 h-3 mr-1" />
              Live Performance Rankings
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-foreground">Global</span>{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Leaderboard
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Real verified performance from top traders. All results connected to live broker accounts via Myfxbook, FXBlue, and prop firm APIs.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 px-4 border-y border-border/50">
        <div className="container mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="w-4 h-4" />
                <span>Filter:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {timeframes.map((tf) => (
                  <Button
                    key={tf}
                    variant={selectedTimeframe === tf ? "emerald" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedTimeframe(tf)}
                  >
                    {tf}
                  </Button>
                ))}
              </div>
              <div className="h-6 w-px bg-border hidden sm:block" />
              <select
                value={selectedBroker}
                onChange={(e) => setSelectedBroker(e.target.value)}
                className="bg-secondary/50 border border-border rounded-lg px-3 py-1.5 text-sm"
              >
                {brokers.map((broker) => (
                  <option key={broker} value={broker}>{broker}</option>
                ))}
              </select>
            </div>
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowUpDown className="w-4 h-4" />
              Sort by Gain
            </Button>
          </div>
        </div>
      </section>

      {/* Leaderboard Table */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-secondary/30 border-b border-border/50 text-sm font-medium text-muted-foreground">
              <div className="col-span-1">Rank</div>
              <div className="col-span-3">Trader</div>
              <div className="col-span-1 text-right">Gain</div>
              <div className="col-span-1 text-right hidden md:block">Drawdown</div>
              <div className="col-span-1 text-right hidden lg:block">Sharpe</div>
              <div className="col-span-1 text-right hidden lg:block">Win Rate</div>
              <div className="col-span-1 text-right hidden md:block">Trades</div>
              <div className="col-span-1 hidden sm:block">Broker</div>
              <div className="col-span-2 text-right">Action</div>
            </div>

            {/* Rows */}
            {traders.map((trader) => (
              <div
                key={trader.rank}
                className="grid grid-cols-12 gap-4 px-6 py-5 border-b border-border/30 hover:bg-secondary/20 transition-colors items-center"
              >
                <div className="col-span-1">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${trader.rank === 1 ? "bg-yellow-500/20 text-yellow-400" :
                      trader.rank === 2 ? "bg-gray-400/20 text-gray-300" :
                        trader.rank === 3 ? "bg-orange-500/20 text-orange-400" :
                          "bg-secondary text-muted-foreground"
                    }`}>
                    {trader.rank}
                  </div>
                </div>
                <div className="col-span-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center font-bold text-sm text-white">
                    {trader.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{trader.name}</span>
                      {trader.verified && (
                        <Shield className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{trader.followers.toLocaleString()} followers</div>
                  </div>
                </div>
                <div className="col-span-1 text-right">
                  <span className="text-emerald-400 font-bold flex items-center justify-end gap-1">
                    <TrendingUp className="w-4 h-4" />
                    +{trader.gain}%
                  </span>
                </div>
                <div className="col-span-1 text-right hidden md:block">
                  <span className={`font-medium ${trader.drawdown < 15 ? "text-emerald-400" : trader.drawdown < 20 ? "text-yellow-400" : "text-red-400"}`}>
                    {trader.drawdown}%
                  </span>
                </div>
                <div className="col-span-1 text-right hidden lg:block">
                  <span className={`font-medium ${trader.sharpe >= 2 ? "text-emerald-400" : "text-yellow-400"}`}>
                    {trader.sharpe}
                  </span>
                </div>
                <div className="col-span-1 text-right hidden lg:block">
                  <span className="text-foreground">{trader.winRate}%</span>
                </div>
                <div className="col-span-1 text-right hidden md:block">
                  <span className="text-muted-foreground">{trader.trades.toLocaleString()}</span>
                </div>
                <div className="col-span-1 hidden sm:block">
                  <Badge variant="outline" className="text-xs">{trader.broker}</Badge>
                </div>
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <Button variant="ghost" size="sm">
                    <Star className="w-4 h-4" />
                  </Button>
                  <Button variant="outline_emerald" size="sm" className="gap-1">
                    View <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              Load More Traders
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
