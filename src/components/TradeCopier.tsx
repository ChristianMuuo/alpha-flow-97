import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Network, Link2, Copy, Power, RefreshCw, Layers, ArrowLeftRight, TrendingUp, TrendingDown } from 'lucide-react';

interface MasterAccount {
    id: string;
    name: string;
    location: string;
    ping: number;
    winRate: number;
    drawdown: number;
    monthlyReturn: number;
    subscribers: number;
    verified: boolean;
}

interface CopiedTrade {
    id: number;
    symbol: string;
    type: 'buy' | 'sell';
    lots: number;
    openPrice: number;
    closePrice: number;
    profit: number;
    time: string;
}

const MASTERS: MasterAccount[] = [
    { id: 'm1', name: 'AlphaFlow Signal Pro', location: 'London EQ2', ping: 12, winRate: 73.4, drawdown: 8.2, monthlyReturn: 14.7, subscribers: 1840, verified: true },
    { id: 'm2', name: 'Gold Pulse Master', location: 'New York NY4', ping: 34, winRate: 68.1, drawdown: 11.5, monthlyReturn: 11.2, subscribers: 924, verified: true },
    { id: 'm3', name: 'BTC Whale Tracker', location: 'Singapore SG1', ping: 88, winRate: 81.0, drawdown: 19.3, monthlyReturn: 27.4, subscribers: 3211, verified: false },
];

const generateTrade = (id: number): CopiedTrade => {
    const symbols = ['EURUSD', 'GBPUSD', 'XAUUSD', 'BTCUSDT', 'USDJPY'];
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const type = Math.random() > 0.5 ? 'buy' : 'sell';
    const profit = (Math.random() - 0.35) * 300;
    const open = symbol === 'BTCUSDT' ? 64000 + Math.random() * 2000 : symbol === 'XAUUSD' ? 2320 + Math.random() * 30 : 1.08 + Math.random() * 0.05;
    const close = open + (type === 'buy' ? 1 : -1) * (profit > 0 ? 0.001 : -0.001) * Math.abs(profit / 10);
    const hours = Math.floor(Math.random() * 8);
    const minutes = Math.floor(Math.random() * 60);
    const d = new Date();
    d.setHours(d.getHours() - hours, d.getMinutes() - minutes);
    const time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    return { id, symbol, type, lots: +(Math.random() * 0.5 + 0.01).toFixed(2), openPrice: +open.toFixed(symbol === 'BTCUSDT' ? 1 : 5), closePrice: +close.toFixed(symbol === 'BTCUSDT' ? 1 : 5), profit: +profit.toFixed(2), time };
};

export const TradeCopier = () => {
    const [selectedMaster, setSelectedMaster] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [multiplier, setMultiplier] = useState(1);
    const [isCopying, setIsCopying] = useState(false);
    const [reverseCopy, setReverseCopy] = useState(false);
    const [history, setHistory] = useState<CopiedTrade[]>([]);
    const [copyStats, setCopyStats] = useState({ total: 0, netPL: 0, since: '' });
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Seed initial history
    useEffect(() => {
        setHistory(Array.from({ length: 8 }, (_, i) => generateTrade(i + 1)));
    }, []);

    // When copying, add trades over time
    useEffect(() => {
        if (isCopying) {
            intervalRef.current = setInterval(() => {
                setHistory(prev => {
                    const next = [generateTrade(prev.length + 1), ...prev].slice(0, 20);
                    const netPL = next.reduce((acc, t) => acc + t.profit, 0);
                    setCopyStats(s => ({ total: next.length, netPL: +netPL.toFixed(2), since: s.since || new Date().toLocaleTimeString() }));
                    return next;
                });
            }, 4000);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [isCopying]);

    const master = MASTERS.find(m => m.id === selectedMaster);

    const connect = () => {
        if (!selectedMaster) return;
        setIsConnected(true);
        setCopyStats({ total: 0, netPL: 0, since: '' });
    };

    const disconnect = () => {
        setIsConnected(false);
        setIsCopying(false);
    };

    return (
        <div className="space-y-4 mt-2 pb-4">

            {/* Stats Header - only when copying */}
            {isCopying && (
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: 'Copied Trades', value: String(copyStats.total), color: 'text-white' },
                        { label: 'Net Copied P/L', value: `${copyStats.netPL >= 0 ? '+' : ''}$${copyStats.netPL.toFixed(2)}`, color: copyStats.netPL >= 0 ? 'text-emerald-400' : 'text-red-400' },
                        { label: 'Active Since', value: copyStats.since || '—', color: 'text-gray-400' },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="bg-black/60 border border-white/8 rounded-xl p-3 text-center">
                            <div className="text-[10px] text-gray-500 uppercase mb-1">{label}</div>
                            <div className={`font-bold font-mono text-sm ${color}`}>{value}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Master Selection */}
            <Card className="bg-black/60 border-white/10">
                <CardHeader className="pb-3 pt-4">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Network className="w-4 h-4 text-blue-400" />
                        Select Master Account
                    </CardTitle>
                    <CardDescription>Choose a verified signal provider to copy.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {MASTERS.map(m => (
                        <div
                            key={m.id}
                            onClick={() => !isConnected && setSelectedMaster(m.id)}
                            className={`rounded-xl p-3 border cursor-pointer transition-all ${selectedMaster === m.id
                                ? 'bg-blue-500/10 border-blue-500/40'
                                : 'bg-white/3 border-white/8 hover:border-white/20'
                                } ${isConnected && selectedMaster !== m.id ? 'opacity-30 pointer-events-none' : ''}`}
                        >
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                                        {m.name.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 text-sm font-bold">
                                            {m.name}
                                            {m.verified && <Badge className="bg-emerald-500/15 text-emerald-400 border-0 text-[9px] px-1.5 py-0">VERIFIED</Badge>}
                                        </div>
                                        <div className="text-[11px] text-gray-500">{m.location} · {m.ping}ms ping · {m.subscribers.toLocaleString()} subscribers</div>
                                    </div>
                                </div>
                                <div className="flex gap-3 text-xs">
                                    <div className="text-center">
                                        <div className="text-emerald-400 font-bold font-mono">+{m.monthlyReturn}%</div>
                                        <div className="text-gray-600 text-[10px]">Monthly</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-blue-400 font-bold font-mono">{m.winRate}%</div>
                                        <div className="text-gray-600 text-[10px]">Win Rate</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-red-400 font-bold font-mono">{m.drawdown}%</div>
                                        <div className="text-gray-600 text-[10px]">Max DD</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Connection row */}
                    <div className="flex items-center justify-between pt-2 gap-4 flex-wrap">
                        <div className="flex items-center gap-2 text-sm">
                            {isConnected ? (
                                <><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-emerald-400">Connected to <strong>{master?.name}</strong></span></>
                            ) : (
                                <span className="text-gray-500">{selectedMaster ? 'Ready to connect' : 'Select a master above'}</span>
                            )}
                        </div>
                        <Button
                            variant={isConnected ? 'outline' : 'default'}
                            onClick={isConnected ? disconnect : connect}
                            disabled={!selectedMaster}
                            className="gap-2"
                        >
                            <Power className="w-4 h-4" />
                            {isConnected ? 'Disconnect' : 'Connect to Master'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Configuration */}
            <Card className={`bg-black/60 border-white/10 transition-opacity duration-300 ${isConnected ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                <CardHeader className="pb-3 pt-4">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Copy className="w-4 h-4 text-purple-400" />
                        Copier Configuration
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Lot multiplier */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-medium">
                                <Layers className="w-3.5 h-3.5 text-purple-400" />
                                Lot Size Multiplier — <span className="text-purple-400 font-mono">{multiplier}x</span>
                            </label>
                            <input
                                type="range" min="0.1" max="10" step="0.1"
                                value={multiplier}
                                onChange={e => setMultiplier(parseFloat(e.target.value))}
                                className="w-full accent-purple-500"
                            />
                            <div className="flex justify-between text-[10px] text-gray-600"><span>0.1x</span><span>10x</span></div>
                        </div>

                        {/* Order Types */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-medium">
                                <RefreshCw className="w-3.5 h-3.5 text-orange-400" />
                                Mirrored Order Types
                            </label>
                            <div className="flex flex-wrap gap-2 pt-1">
                                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 cursor-pointer hover:bg-emerald-500/30">Market Orders</Badge>
                                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 cursor-pointer hover:bg-blue-500/30">Pending Orders</Badge>
                                <Badge className="bg-red-500/20 text-red-400 border-red-500/30 cursor-pointer hover:bg-red-500/30">SL/TP Updates</Badge>
                            </div>
                        </div>
                    </div>

                    {/* Symbol Mapping */}
                    <div className="border border-white/8 rounded-xl overflow-hidden">
                        <div className="bg-white/5 px-4 py-2 text-[10px] font-bold text-gray-500 flex justify-between uppercase tracking-wide">
                            <span>Master Symbol</span>
                            <Link2 className="w-3 h-3" />
                            <span>Local Symbol</span>
                        </div>
                        {['EURUSD', 'GBPUSD', 'XAUUSD', 'BTCUSDT'].map(sym => (
                            <div key={sym} className="px-4 py-2 flex justify-between text-sm items-center bg-black/20 border-t border-white/5">
                                <span className="font-mono text-gray-300">{sym}</span>
                                <span className="text-gray-600 text-xs">auto-mapped →</span>
                                <span className="font-mono text-emerald-400">{sym}</span>
                            </div>
                        ))}
                    </div>

                    {/* Reverse Copy Toggle */}
                    <div className="p-3 bg-white/3 border border-white/8 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <ArrowLeftRight className="w-4 h-4 text-yellow-400" />
                            <div>
                                <h4 className="text-sm font-bold">Reverse Copy</h4>
                                <p className="text-xs text-gray-500">Invert master's direction — BUY becomes SELL and vice versa.</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input type="checkbox" className="sr-only peer" checked={reverseCopy} onChange={() => setReverseCopy(v => !v)} />
                            <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500" />
                        </label>
                    </div>

                    {/* Start / Stop */}
                    <Button
                        className={`w-full py-5 text-base font-bold shadow-lg transition-all ${isCopying
                            ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/40 outline outline-2 outline-red-500/20'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-blue-500/25'
                            }`}
                        onClick={() => setIsCopying(v => !v)}
                    >
                        {isCopying ? '⏹ STOP TRADE COPIER' : '▶ START TRADE COPIER'}
                    </Button>
                </CardContent>
            </Card>

            {/* Copy History */}
            <Card className="bg-black/60 border-white/10">
                <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-base flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-gray-400" />
                        Copy History
                        {isCopying && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block ml-1" />}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 pb-1">
                    <div className="overflow-hidden rounded-b-xl">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="bg-white/5 text-gray-500 uppercase text-[10px]">
                                    <th className="text-left px-4 py-2">Symbol</th>
                                    <th className="text-left px-4 py-2">Type</th>
                                    <th className="text-right px-4 py-2">Lots</th>
                                    <th className="text-right px-4 py-2">Open</th>
                                    <th className="text-right px-4 py-2">Close</th>
                                    <th className="text-right px-4 py-2">P/L</th>
                                    <th className="text-right px-4 py-2">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {history.map(t => (
                                    <tr key={t.id} className="hover:bg-white/3 transition-colors">
                                        <td className="px-4 py-2 font-mono font-bold text-white">{t.symbol}</td>
                                        <td className="px-4 py-2">
                                            <span className={`flex items-center gap-1 font-bold ${t.type === 'buy' ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {t.type === 'buy' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                                {t.type.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-right font-mono text-gray-400">{t.lots}</td>
                                        <td className="px-4 py-2 text-right font-mono text-gray-400">{t.openPrice}</td>
                                        <td className="px-4 py-2 text-right font-mono text-gray-400">{t.closePrice}</td>
                                        <td className={`px-4 py-2 text-right font-bold font-mono ${t.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {t.profit >= 0 ? '+' : ''}${t.profit.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-2 text-right text-gray-600 font-mono">{t.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {history.length === 0 && (
                            <div className="text-center py-8 text-gray-600 text-sm">No copied trades yet</div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
