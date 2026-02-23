import React, { useEffect, useRef } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';

interface DataPoint {
    time: number;
    equity: number;
    balance: number;
}

interface RealTimeBacktestChartProps {
    data: DataPoint[];
    isActive: boolean;
    metrics: {
        totalTrades: number;
        winRate: number;
        profitFactor: number;
        maxDrawdown: number;
        netProfit: number;
        initialBalance: number;
    };
}

export const RealTimeBacktestChart: React.FC<RealTimeBacktestChartProps> = ({
    data,
    isActive,
    metrics
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to the right as new data comes in
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
        }
    }, [data]);

    const currentEquity = data.length > 0 ? data[data.length - 1].equity : metrics.initialBalance;
    const isProfitable = currentEquity >= metrics.initialBalance;
    const profitPercentage = ((currentEquity - metrics.initialBalance) / metrics.initialBalance) * 100;

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Live Metrics Cards */}
                <Card className="p-4 bg-background/50 backdrop-blur border-border/50">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase">Net Profit</span>
                    </div>
                    <div className={`text-2xl font-bold ${isProfitable ? 'text-emerald-400' : 'text-red-400'}`}>
                        ${metrics.netProfit.toFixed(2)}
                    </div>
                    <div className={`text-xs ${isProfitable ? 'text-emerald-400/80' : 'text-red-400/80'}`}>
                        {profitPercentage > 0 ? '+' : ''}{profitPercentage.toFixed(2)}%
                    </div>
                </Card>

                <Card className="p-4 bg-background/50 backdrop-blur border-border/50">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Activity className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase">Total Trades</span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        {metrics.totalTrades}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        Win Rate: <span className="text-emerald-400">{(metrics.winRate * 100).toFixed(1)}%</span>
                    </div>
                </Card>

                <Card className="p-4 bg-background/50 backdrop-blur border-border/50">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase">Profit Factor</span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                        {metrics.profitFactor.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        Target: 2.0+
                    </div>
                </Card>

                <Card className="p-4 bg-background/50 backdrop-blur border-border/50">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <TrendingDown className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase">Max Drawdown</span>
                    </div>
                    <div className="text-2xl font-bold text-yellow-400">
                        {metrics.maxDrawdown.toFixed(2)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                        Risk Level: Low
                    </div>
                </Card>
            </div>

            {/* Chart Area */}
            <Card className="p-1 bg-background/50 backdrop-blur border-border/50 overflow-hidden relative h-[400px]">
                {isActive && (
                    <div className="absolute top-4 right-4 z-10 flex items-center gap-2 animate-pulse">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-xs text-emerald-500 font-medium">LIVE SIMULATION</span>
                    </div>
                )}
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis
                            dataKey="time"
                            hide={true}
                        />
                        <YAxis
                            domain={['auto', 'auto']}
                            orientation="right"
                            tick={{ fill: '#666', fontSize: 12 }}
                            tickFormatter={(value) => `$${value}`}
                            stroke="#333"
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#000', borderColor: '#333', color: '#fff' }}
                            itemStyle={{ color: '#10b981' }}
                            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Equity']}
                            labelFormatter={() => ''}
                        />
                        <Area
                            type="monotone"
                            dataKey="equity"
                            stroke="#10b981"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorEquity)"
                            isAnimationActive={false}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </Card>

            <div className="text-xs text-center text-muted-foreground">
                * Simulation based on historical tick data logic. Past performance does not guarantee future results.
            </div>
        </div>
    );
};
