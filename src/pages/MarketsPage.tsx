import { useState } from 'react';
import TradingViewChart from '@/components/TradingViewChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Globe, Clock } from 'lucide-react';
import SEO from '@/components/SEO';

const currencyPairs = {
  major: [
    { symbol: 'FX:EURUSD', name: 'EUR/USD', description: 'Euro / US Dollar' },
    { symbol: 'FX:GBPUSD', name: 'GBP/USD', description: 'British Pound / US Dollar' },
    { symbol: 'FX:USDJPY', name: 'USD/JPY', description: 'US Dollar / Japanese Yen' },
    { symbol: 'FX:USDCHF', name: 'USD/CHF', description: 'US Dollar / Swiss Franc' },
    { symbol: 'FX:AUDUSD', name: 'AUD/USD', description: 'Australian Dollar / US Dollar' },
    { symbol: 'FX:USDCAD', name: 'USD/CAD', description: 'US Dollar / Canadian Dollar' },
  ],
  cross: [
    { symbol: 'FX:EURGBP', name: 'EUR/GBP', description: 'Euro / British Pound' },
    { symbol: 'FX:EURJPY', name: 'EUR/JPY', description: 'Euro / Japanese Yen' },
    { symbol: 'FX:GBPJPY', name: 'GBP/JPY', description: 'British Pound / Japanese Yen' },
    { symbol: 'FX:AUDNZD', name: 'AUD/NZD', description: 'Australian Dollar / New Zealand Dollar' },
    { symbol: 'FX:CADJPY', name: 'CAD/JPY', description: 'Canadian Dollar / Japanese Yen' },
    { symbol: 'FX:CHFJPY', name: 'CHF/JPY', description: 'Swiss Franc / Japanese Yen' },
  ],
  exotic: [
    { symbol: 'FX:USDZAR', name: 'USD/ZAR', description: 'US Dollar / South African Rand' },
    { symbol: 'FX:USDMXN', name: 'USD/MXN', description: 'US Dollar / Mexican Peso' },
    { symbol: 'FX:USDTRY', name: 'USD/TRY', description: 'US Dollar / Turkish Lira' },
    { symbol: 'FX:EURTRY', name: 'EUR/TRY', description: 'Euro / Turkish Lira' },
    { symbol: 'FX:USDHKD', name: 'USD/HKD', description: 'US Dollar / Hong Kong Dollar' },
    { symbol: 'FX:USDSGD', name: 'USD/SGD', description: 'US Dollar / Singapore Dollar' },
  ],
  crypto: [
    { symbol: 'BINANCE:BTCUSDT', name: 'BTC/USDT', description: 'Bitcoin / Tether' },
    { symbol: 'BINANCE:ETHUSDT', name: 'ETH/USDT', description: 'Ethereum / Tether' },
    { symbol: 'BINANCE:XRPUSDT', name: 'XRP/USDT', description: 'Ripple / Tether' },
    { symbol: 'BINANCE:SOLUSDT', name: 'SOL/USDT', description: 'Solana / Tether' },
  ],
};

const timeframes = ['1 Min', '5 Min', '15 Min', '1 Hour', '4 Hour', 'Daily', 'Weekly'];

const MarketsPage = () => {
  const [selectedPair, setSelectedPair] = useState(currencyPairs.major[0]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('Daily');

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Live Markets"
        description="Real-time forex and crypto market analysis with interactive charts."
      />
      <div className="container mx-auto px-4 pt-32 pb-20">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <Globe className="h-3 w-3 mr-1" />
            Live Markets
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Real-Time{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Market Analysis
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Interactive charts with live data from global forex and crypto markets
          </p>
        </div>

        {/* Main Chart */}
        <Card className="border-border/50 bg-card/50 backdrop-blur mb-8">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  {selectedPair.name}
                </CardTitle>
                <p className="text-muted-foreground">{selectedPair.description}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {timeframes.map((tf) => (
                  <Badge
                    key={tf}
                    variant={selectedTimeframe === tf ? 'default' : 'outline'}
                    className="cursor-pointer hover:bg-primary/20 transition-colors"
                    onClick={() => setSelectedTimeframe(tf)}
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {tf}
                  </Badge>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <TradingViewChart symbol={selectedPair.symbol} height={500} />
          </CardContent>
        </Card>

        {/* Currency Pair Selector */}
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle>Select Currency Pair</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="major" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="major">Major Pairs</TabsTrigger>
                <TabsTrigger value="cross">Cross Pairs</TabsTrigger>
                <TabsTrigger value="exotic">Exotic Pairs</TabsTrigger>
                <TabsTrigger value="crypto">Crypto</TabsTrigger>
              </TabsList>

              {Object.entries(currencyPairs).map(([category, pairs]) => (
                <TabsContent key={category} value={category}>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {pairs.map((pair) => (
                      <button
                        key={pair.symbol}
                        onClick={() => setSelectedPair(pair)}
                        className={`p-4 rounded-lg border transition-all text-left ${selectedPair.symbol === pair.symbol
                            ? 'border-primary bg-primary/10'
                            : 'border-border/50 bg-background/50 hover:border-primary/50'
                          }`}
                      >
                        <div className="font-semibold">{pair.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{pair.description}</div>
                      </button>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Multi-Chart Grid */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Quick View - Major Pairs</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {currencyPairs.major.slice(0, 4).map((pair) => (
              <Card key={pair.symbol} className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {pair.name}
                    <Badge variant="outline" className="text-xs">{pair.description}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TradingViewChart symbol={pair.symbol} height={300} />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketsPage;
