import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Shield, AlertTriangle, TrendingDown, Percent, Settings2,
    Calculator, Clock, Newspaper, Activity, Lock
} from 'lucide-react';

interface SessionState {
    london: boolean;
    newYork: boolean;
    tokyo: boolean;
    sydney: boolean;
}

export const RiskManager = () => {
    const [riskPerTrade, setRiskPerTrade] = useState(1);
    const [maxDailyDrawdown, setMaxDailyDrawdown] = useState(5);
    const [trailingStop, setTrailingStop] = useState(20);
    const [maxOpenTrades, setMaxOpenTrades] = useState(3);
    const [smartRecovery, setSmartRecovery] = useState(true);
    const [newsFilter, setNewsFilter] = useState(true);
    const [isSaved, setIsSaved] = useState(false);

    // Position Calculator
    const [accountBalance, setAccountBalance] = useState(10000);
    const [stopLossPips, setStopLossPips] = useState(30);
    const calculatedLot = ((accountBalance * (riskPerTrade / 100)) / (stopLossPips * 10)).toFixed(2);

    // Sessions
    const [sessions, setSessions] = useState<SessionState>({
        london: true, newYork: true, tokyo: false, sydney: false
    });

    // Live Risk Meter (simulated)
    const [liveRisk, setLiveRisk] = useState(0);
    useEffect(() => {
        const t = setInterval(() => setLiveRisk(v => Math.min(100, Math.max(0, v + (Math.random() - 0.4) * 8))), 2000);
        return () => clearInterval(t);
    }, []);

    const riskColor = liveRisk > 70 ? 'bg-red-500' : liveRisk > 40 ? 'bg-yellow-400' : 'bg-emerald-500';
    const riskLabel = liveRisk > 70 ? 'HIGH' : liveRisk > 40 ? 'MEDIUM' : 'LOW';
    const riskTextColor = liveRisk > 70 ? 'text-red-400' : liveRisk > 40 ? 'text-yellow-400' : 'text-emerald-400';

    const handleSave = () => {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    const toggleSession = (key: keyof SessionState) => {
        setSessions(s => ({ ...s, [key]: !s[key] }));
    };

    return (
        <div className="space-y-4 mt-2 pb-4">

            {/* Live Risk Meter */}
            <Card className="bg-black/60 border-white/10">
                <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-sm font-bold">
                            <Activity className="w-4 h-4 text-purple-400" />
                            Live Portfolio Risk Meter
                        </div>
                        <Badge className={`text-xs font-bold font-mono border-0 ${liveRisk > 70 ? 'bg-red-500/20 text-red-400' : liveRisk > 40 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                            {riskLabel} — {liveRisk.toFixed(0)}%
                        </Badge>
                    </div>
                    <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-700 ${riskColor}`}
                            style={{ width: `${liveRisk}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                        <span>SAFE</span><span>CAUTION</span><span>DANGER</span>
                    </div>
                </CardContent>
            </Card>

            {/* Position Size Calculator */}
            <Card className="bg-black/60 border-white/10">
                <CardHeader className="pb-3 pt-4">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Calculator className="w-4 h-4 text-blue-400" />
                        Position Size Calculator
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400 font-medium">Account Balance ($)</label>
                            <input
                                type="number"
                                value={accountBalance}
                                onChange={e => setAccountBalance(Number(e.target.value))}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-500/50"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400 font-medium">Stop Loss (Pips)</label>
                            <input
                                type="number"
                                value={stopLossPips}
                                min={1}
                                onChange={e => setStopLossPips(Number(e.target.value))}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-500/50"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400 font-medium">Recommended Lot Size</label>
                            <div className="w-full bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2 text-emerald-400 font-bold font-mono text-sm">
                                {calculatedLot} lots
                            </div>
                        </div>
                    </div>
                    <p className="text-[11px] text-gray-600">Risk = {riskPerTrade}% of ${accountBalance.toLocaleString()} = ${(accountBalance * riskPerTrade / 100).toFixed(2)} / {stopLossPips} pip SL × $10/pip = <span className="text-white">{calculatedLot} lots</span></p>
                </CardContent>
            </Card>

            {/* Risk Parameters */}
            <Card className="bg-black/60 border-white/10">
                <CardHeader className="pb-3 pt-4">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Shield className="w-4 h-4 text-emerald-500" />
                        Risk Parameters
                    </CardTitle>
                    <CardDescription>Configure institutional-grade risk limits.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Risk per trade */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-medium text-foreground">
                                <Percent className="w-3.5 h-3.5 text-purple-400" />
                                Risk Per Trade — <span className="text-purple-400 font-mono">{riskPerTrade}%</span>
                            </label>
                            <input
                                type="range" min="0.1" max="5" step="0.1"
                                value={riskPerTrade}
                                onChange={e => setRiskPerTrade(parseFloat(e.target.value))}
                                className="w-full accent-purple-500"
                            />
                            <div className="flex justify-between text-[10px] text-gray-600"><span>0.1%</span><span>5%</span></div>
                        </div>

                        {/* Max Daily Drawdown */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-medium text-foreground">
                                <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                                Max Daily Drawdown — <span className="text-red-400 font-mono">{maxDailyDrawdown}%</span>
                            </label>
                            <input
                                type="range" min="1" max="15" step="1"
                                value={maxDailyDrawdown}
                                onChange={e => setMaxDailyDrawdown(parseFloat(e.target.value))}
                                className="w-full accent-red-500"
                            />
                            <div className="flex justify-between text-[10px] text-gray-600"><span>1%</span><span>15%</span></div>
                        </div>

                        {/* Trailing Stop */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-medium text-foreground">
                                <Lock className="w-3.5 h-3.5 text-blue-400" />
                                Trailing Stop — <span className="text-blue-400 font-mono">{trailingStop} pips</span>
                            </label>
                            <input
                                type="range" min="5" max="100" step="5"
                                value={trailingStop}
                                onChange={e => setTrailingStop(parseInt(e.target.value))}
                                className="w-full accent-blue-500"
                            />
                            <div className="flex justify-between text-[10px] text-gray-600"><span>5p</span><span>100p</span></div>
                        </div>

                        {/* Max Open Trades */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-medium text-foreground">
                                <Activity className="w-3.5 h-3.5 text-orange-400" />
                                Max Open Trades — <span className="text-orange-400 font-mono">{maxOpenTrades}</span>
                            </label>
                            <input
                                type="range" min="1" max="10" step="1"
                                value={maxOpenTrades}
                                onChange={e => setMaxOpenTrades(parseInt(e.target.value))}
                                className="w-full accent-orange-500"
                            />
                            <div className="flex justify-between text-[10px] text-gray-600"><span>1</span><span>10</span></div>
                        </div>
                    </div>

                    {/* Smart Recovery + News Filter toggles */}
                    <div className="space-y-3">
                        {[
                            {
                                id: 'recovery',
                                icon: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
                                label: 'Smart Recovery Mode',
                                desc: 'Automatically scales down lot size by 50% after 3 consecutive losses.',
                                value: smartRecovery,
                                toggle: () => setSmartRecovery(v => !v),
                                color: 'emerald',
                            },
                            {
                                id: 'news',
                                icon: <Newspaper className="w-4 h-4 text-pink-400" />,
                                label: 'News Blackout Filter',
                                desc: 'Pause trading 15 min before and after high-impact news events (NFP, CPI, FOMC).',
                                value: newsFilter,
                                toggle: () => setNewsFilter(v => !v),
                                color: 'pink',
                            },
                        ].map(({ id, icon, label, desc, value, toggle, color }) => (
                            <div key={id} className="p-3 bg-white/3 rounded-lg border border-white/8 flex items-center justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    {icon}
                                    <div>
                                        <h4 className="text-sm font-bold">{label}</h4>
                                        <p className="text-xs text-gray-500 mt-0.5 max-w-sm">{desc}</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                    <input type="checkbox" className="sr-only peer" checked={value} onChange={toggle} />
                                    <div className={`w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-${color}-500`} />
                                </label>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Session Filter */}
            <Card className="bg-black/60 border-white/10">
                <CardHeader className="pb-3 pt-4">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Clock className="w-4 h-4 text-sky-400" />
                        Trading Session Filter
                    </CardTitle>
                    <CardDescription>Enable trading only during selected market sessions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {([
                            { key: 'london', label: 'London', hours: '08:00–17:00 UTC', color: 'blue' },
                            { key: 'newYork', label: 'New York', hours: '13:00–22:00 UTC', color: 'emerald' },
                            { key: 'tokyo', label: 'Tokyo', hours: '00:00–09:00 UTC', color: 'purple' },
                            { key: 'sydney', label: 'Sydney', hours: '22:00–07:00 UTC', color: 'orange' },
                        ] as { key: keyof SessionState, label: string, hours: string, color: string }[]).map(({ key, label, hours, color }) => {
                            const on = sessions[key];
                            return (
                                <button
                                    key={key}
                                    onClick={() => toggleSession(key)}
                                    className={`rounded-xl p-3 border text-left transition-all ${on
                                        ? `bg-${color}-500/15 border-${color}-500/40`
                                        : 'bg-white/3 border-white/8 opacity-50'
                                        }`}
                                >
                                    <div className={`flex items-center gap-1.5 mb-1 text-sm font-bold ${on ? `text-${color}-400` : 'text-gray-500'}`}>
                                        <span className={`w-2 h-2 rounded-full ${on ? `bg-${color}-400 animate-pulse` : 'bg-gray-600'}`} />
                                        {label}
                                    </div>
                                    <div className="text-[10px] text-gray-600 font-mono">{hours}</div>
                                </button>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleSave} className="gap-2" variant={isSaved ? 'emerald' : 'default'}>
                    <Settings2 className="w-4 h-4" />
                    {isSaved ? '✓ Settings Saved!' : 'Apply Risk Rules'}
                </Button>
            </div>
        </div>
    );
};
