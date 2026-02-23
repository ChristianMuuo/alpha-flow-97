import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Candle, PriceLevel } from '@/lib/backtestSimulator';
import { Activity, DollarSign, BarChart2, Layers, TrendingUp, Crosshair, Clock } from 'lucide-react';

interface AdvancedRealTimeChartProps {
    candles: Candle[];
    currentCandle: Candle | null;
    volumeProfile: PriceLevel[];
    metrics: {
        totalTrades: number;
        winRate: number;
        profitFactor: number;
        maxDrawdown: number;
        netProfit: number;
        floatingPL?: number;
        equity?: number;
        activeTrade?: { type: 'buy' | 'sell', entryPrice: number, volume: number } | null;
        initialBalance: number;
        symbol?: string;
    };
    deepMetrics?: {
        trendStrength: number;
        institutionalActivity: string;
        imbalanceActive: boolean;
    };
    isActive: boolean;
}

interface LiveCandle {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    buyVolume: number;
    sellVolume: number;
    isClosed: boolean;
    cvd: number;
    vwap: number;
}

const CANDLE_WIDTH = 10;
const CANDLE_GAP = 2;
const MAX_CANDLES = 100;
const PRICE_RIGHT_PAD = 80;
const TIME_BOTTOM_PAD = 22;
const CVD_HEIGHT_RATIO = 0.22; // 22% of total for CVD

// MT4 dark color palette
const MT4 = {
    bg: '#0a0e14',
    grid: '#141a24',
    gridLine: '#1c2636',
    upCandle: '#26a69a',
    downCandle: '#ef5350',
    upWick: '#26a69a',
    downWick: '#ef5350',
    vwap: '#f0c040',
    currentPrice: '#ffffff',
    priceTag: '#1a2535',
    priceTagText: '#ffffff',
    buyLine: '#00e5a0',
    sellLine: '#ff5252',
    crosshair: 'rgba(180,180,180,0.5)',
    text: '#9ea8b8',
    axis: '#2a3547',
    cvdBull: '#26a69a',
    cvdBear: '#ef5350',
    spread: 'rgba(255,255,255,0.04)',
};

export const AdvancedRealTimeChart: React.FC<AdvancedRealTimeChartProps> = ({
    candles,
    currentCandle,
    volumeProfile,
    metrics,
    deepMetrics,
    isActive
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const animFrameRef = useRef<number>(0);
    const renderDataRef = useRef<{ candles: LiveCandle[], currentPrice: number }>({ candles: [], currentPrice: 0 });
    const mouseRef = useRef<{ x: number, y: number } | null>(null);
    const [liveTime, setLiveTime] = useState(new Date());

    // Tick the clock every second
    useEffect(() => {
        const timer = setInterval(() => setLiveTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Build live candle list from incoming props
    useEffect(() => {
        const liveCandles: LiveCandle[] = [...candles.map(c => ({
            time: c.time,
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close,
            volume: c.volume,
            buyVolume: c.buyVolume,
            sellVolume: c.sellVolume,
            isClosed: true,
            cvd: c.cvd,
            vwap: c.vwap,
        }))];

        if (currentCandle) {
            liveCandles.push({
                time: currentCandle.time,
                open: currentCandle.open,
                high: currentCandle.high,
                low: currentCandle.low,
                close: currentCandle.close,
                volume: currentCandle.volume,
                buyVolume: currentCandle.buyVolume,
                sellVolume: currentCandle.sellVolume,
                isClosed: false,
                cvd: currentCandle.cvd,
                vwap: currentCandle.vwap,
            });
        }

        renderDataRef.current.candles = liveCandles.slice(-MAX_CANDLES);
        if (currentCandle) {
            renderDataRef.current.currentPrice = currentCandle.close;
        }
    }, [candles, currentCandle]);

    const drawChart = useCallback(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const W = container.clientWidth;
        const H = container.clientHeight;
        if (canvas.width !== W || canvas.height !== H) {
            canvas.width = W;
            canvas.height = H;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const data = renderDataRef.current.candles;
        const currentPrice = renderDataRef.current.currentPrice;
        const mouse = mouseRef.current;

        // Layout split
        const mainH = Math.floor(H * (1 - CVD_HEIGHT_RATIO)) - TIME_BOTTOM_PAD;
        const cvdTop = mainH + TIME_BOTTOM_PAD;
        const cvdH = H - cvdTop;
        const chartW = W - PRICE_RIGHT_PAD;

        // ── Background ──
        ctx.fillStyle = MT4.bg;
        ctx.fillRect(0, 0, W, H);

        // ── Divider between main and CVD ──
        ctx.fillStyle = MT4.axis;
        ctx.fillRect(0, mainH, chartW, 1);
        ctx.fillRect(0, cvdTop - 1, chartW, 1);

        // ── Price axis background ──
        ctx.fillStyle = '#0d1320';
        ctx.fillRect(chartW, 0, PRICE_RIGHT_PAD, H);

        if (data.length === 0) {
            ctx.fillStyle = '#555';
            ctx.font = '13px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('Fetching market data...', W / 2, H / 2);
            return;
        }

        // ── Price Range ──
        let minP = Math.min(...data.map(c => c.low));
        let maxP = Math.max(...data.map(c => c.high));
        const pRange = maxP - minP || 0.001;
        const padding = pRange * 0.12;
        minP -= padding;
        maxP += padding;
        const effectiveRange = maxP - minP;

        const toY = (price: number) => ((maxP - price) / effectiveRange) * mainH;

        // ── Grid lines ──
        const gridLevels = 7;
        ctx.setLineDash([1, 3]);
        ctx.strokeStyle = MT4.gridLine;
        ctx.lineWidth = 1;
        for (let i = 0; i <= gridLevels; i++) {
            const price = minP + effectiveRange * (i / gridLevels);
            const y = toY(price);
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(chartW, y);
            ctx.stroke();

            // Price labels
            ctx.setLineDash([]);
            ctx.fillStyle = MT4.text;
            ctx.font = '10px monospace';
            ctx.textAlign = 'left';
            const label = price < 10 ? price.toFixed(5) : price.toFixed(2);
            ctx.fillText(label, chartW + 4, y + 3.5);
            ctx.setLineDash([1, 3]);
        }
        ctx.setLineDash([]);

        // ── Candle positions ──
        const totalCandleW = CANDLE_WIDTH + CANDLE_GAP;
        const startX = chartW - data.length * totalCandleW;

        // ── VWAP line ──
        ctx.beginPath();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = MT4.vwap;
        ctx.lineWidth = 1.5;
        let vwapStarted = false;
        data.forEach((candle, i) => {
            if (!candle.vwap || candle.vwap === 0) return;
            const x = startX + i * totalCandleW + CANDLE_WIDTH / 2;
            const y = toY(candle.vwap);
            if (!vwapStarted) {
                ctx.moveTo(x, y);
                vwapStarted = true;
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();
        ctx.setLineDash([]);

        // VWAP label on right axis
        if (vwapStarted && data.length > 0) {
            const lastVwap = data[data.length - 1]?.vwap;
            if (lastVwap) {
                const vy = toY(lastVwap);
                ctx.fillStyle = MT4.vwap;
                ctx.font = 'bold 9px monospace';
                ctx.textAlign = 'left';
                ctx.fillText('VWAP', chartW + 4, vy - 2);
            }
        }

        // ── Draw Candles ──
        data.forEach((candle, i) => {
            const x = startX + i * totalCandleW;
            const isUp = candle.close >= candle.open;
            const color = isUp ? MT4.upCandle : MT4.downCandle;
            const wickColor = isUp ? MT4.upWick : MT4.downWick;

            ctx.globalAlpha = candle.isClosed ? 1 : 0.85;

            const yHigh = toY(candle.high);
            const yLow = toY(candle.low);
            const yOpen = toY(candle.open);
            const yClose = toY(candle.close);
            const bodyTop = Math.min(yOpen, yClose);
            const bodyH = Math.max(1.5, Math.abs(yOpen - yClose));
            const xCenter = x + CANDLE_WIDTH / 2;

            // Wick
            ctx.strokeStyle = wickColor;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(xCenter, yHigh);
            ctx.lineTo(xCenter, bodyTop);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(xCenter, bodyTop + bodyH);
            ctx.lineTo(xCenter, yLow);
            ctx.stroke();

            // Body
            ctx.fillStyle = color;
            if (isUp) {
                ctx.fillRect(x, bodyTop, CANDLE_WIDTH, bodyH);
            } else {
                ctx.fillRect(x, bodyTop, CANDLE_WIDTH, bodyH);
                // Hollow bearish body outline
                ctx.strokeStyle = color;
                ctx.lineWidth = 1;
                ctx.strokeRect(x, bodyTop, CANDLE_WIDTH, bodyH);
            }
        });
        ctx.globalAlpha = 1;

        // ── Active Trade Entry Line ──
        if (metrics.activeTrade) {
            const entryY = toY(metrics.activeTrade.entryPrice);
            const isBuy = metrics.activeTrade.type === 'buy';
            const lineColor = isBuy ? MT4.buyLine : MT4.sellLine;

            ctx.setLineDash([5, 3]);
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(0, entryY);
            ctx.lineTo(chartW, entryY);
            ctx.stroke();
            ctx.setLineDash([]);

            // Arrow + label
            const label = `${isBuy ? '▲ BUY' : '▼ SELL'}  ${metrics.activeTrade.entryPrice < 10 ? metrics.activeTrade.entryPrice.toFixed(5) : metrics.activeTrade.entryPrice.toFixed(2)}  (${metrics.activeTrade.volume} lot)`;
            ctx.font = 'bold 10px monospace';
            const tw = ctx.measureText(label).width + 14;
            ctx.fillStyle = lineColor + '28';
            ctx.fillRect(chartW - tw - 4, entryY - 9, tw, 18);
            ctx.strokeStyle = lineColor + '66';
            ctx.lineWidth = 1;
            ctx.strokeRect(chartW - tw - 4, entryY - 9, tw, 18);
            ctx.fillStyle = lineColor;
            ctx.textAlign = 'right';
            ctx.fillText(label, chartW - 8, entryY + 4);
        }

        // ── Current Price Line ──
        if (currentPrice > 0) {
            const y = toY(currentPrice);
            // Spread band
            const spreadPips = 0.00015;
            const spreadY1 = toY(currentPrice + spreadPips / 2);
            const spreadY2 = toY(currentPrice - spreadPips / 2);
            ctx.fillStyle = MT4.spread;
            ctx.fillRect(0, spreadY1, chartW, spreadY2 - spreadY1);

            ctx.setLineDash([2, 3]);
            ctx.strokeStyle = MT4.currentPrice;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(chartW, y);
            ctx.stroke();
            ctx.setLineDash([]);

            // Bid tag
            const priceLabel = currentPrice < 10 ? currentPrice.toFixed(5) : currentPrice.toFixed(2);
            ctx.fillStyle = '#1a3d5c';
            ctx.fillRect(chartW, y - 9, PRICE_RIGHT_PAD, 18);
            ctx.fillStyle = '#4dd9fa';
            ctx.font = 'bold 11px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(priceLabel, chartW + PRICE_RIGHT_PAD / 2, y + 4);
        }

        // ── Time axis (bottom of main chart) ──
        ctx.fillStyle = MT4.text;
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        const timeStepCandles = Math.max(1, Math.floor(data.length / 8));
        data.forEach((candle, i) => {
            if (i % timeStepCandles === 0 && candle.time > 0) {
                const x = startX + i * totalCandleW + CANDLE_WIDTH / 2;
                if (x < 0 || x > chartW) return;
                const dt = new Date(candle.time);
                const label = `${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}`;
                ctx.fillText(label, x, mainH + 14);
            }
        });

        // ── MT4 Watermark ──
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        ctx.font = 'bold 13px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(metrics.symbol || 'EURUSD', 10, 22);
        ctx.fillStyle = 'rgba(255,255,255,0.10)';
        ctx.font = '10px monospace';
        ctx.fillText('M1  ·  Leverage 1:3000  ·  ECN', 10, 36);

        // ── Live Price HUD (top-right corner of chart) ──
        if (currentPrice > 0) {
            const sym = metrics.symbol || 'EURUSD';
            const priceStr = currentPrice < 10 ? currentPrice.toFixed(5) : currentPrice.toFixed(2);
            ctx.font = 'bold 12px monospace';
            const symW = ctx.measureText(sym + '  ').width;
            ctx.font = 'bold 14px monospace';
            const priceW = ctx.measureText(priceStr).width;
            const hudW = symW + priceW + 28;
            const hudH = 30;
            const hudX = chartW - hudW - 10;
            const hudY = 8;
            // Background
            ctx.fillStyle = 'rgba(0,12,8,0.82)';
            ctx.beginPath();
            if ((ctx as any).roundRect) (ctx as any).roundRect(hudX, hudY, hudW, hudH, 5);
            else ctx.rect(hudX, hudY, hudW, hudH);
            ctx.fill();
            // Emerald border
            ctx.strokeStyle = 'rgba(78,210,160,0.55)';
            ctx.lineWidth = 1;
            ctx.stroke();
            // Pulse dot
            ctx.fillStyle = '#4ed2a0';
            ctx.beginPath();
            ctx.arc(hudX + 10, hudY + hudH / 2, 3, 0, Math.PI * 2);
            ctx.fill();
            // Symbol label
            ctx.fillStyle = '#4ed2a0';
            ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(sym, hudX + 18, hudY + 19);
            // Price value
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px monospace';
            ctx.fillText('  ' + priceStr, hudX + 18 + ctx.measureText(sym).width, hudY + 20);
        }

        // ── OHLC info bar ──
        if (currentCandle) {
            const ohlcLabels: [string, string, string][] = [
                ['O', currentCandle.open < 10 ? currentCandle.open.toFixed(5) : currentCandle.open.toFixed(2), '#aaa'],
                ['H', currentCandle.high < 10 ? currentCandle.high.toFixed(5) : currentCandle.high.toFixed(2), MT4.upCandle],
                ['L', currentCandle.low < 10 ? currentCandle.low.toFixed(5) : currentCandle.low.toFixed(2), MT4.downCandle],
                ['C', currentCandle.close < 10 ? currentCandle.close.toFixed(5) : currentCandle.close.toFixed(2), currentCandle.close >= currentCandle.open ? MT4.upCandle : MT4.downCandle],
            ];
            let ox = 10;
            const ohlcY = 52;
            ohlcLabels.forEach(([lbl, val, color]) => {
                ctx.fillStyle = 'rgba(255,255,255,0.35)';
                ctx.font = '10px monospace';
                ctx.textAlign = 'left';
                ctx.fillText(lbl + ':', ox, ohlcY);
                ox += ctx.measureText(lbl + ':').width + 2;
                ctx.fillStyle = color;
                ctx.fillText(val, ox, ohlcY);
                ox += ctx.measureText(val).width + 10;
            });
        }

        // ── CVD Subplot ──
        const cvdData = data.filter(c => c.cvd !== undefined);
        if (cvdData.length > 0) {
            ctx.fillStyle = '#0c1018';
            ctx.fillRect(0, cvdTop, chartW, cvdH);

            // CVD label
            ctx.fillStyle = MT4.text;
            ctx.font = '9px monospace';
            ctx.textAlign = 'left';
            ctx.fillText('CVD — Cumulative Volume Delta', 8, cvdTop + 11);

            const cvdValues = cvdData.map(c => c.cvd);
            const cvdMin = Math.min(...cvdValues);
            const cvdMax = Math.max(...cvdValues);
            const cvdRange = Math.max(cvdMax - cvdMin, 1);

            const toCvdY = (val: number) => cvdTop + cvdH - 4 - ((val - cvdMin) / cvdRange) * (cvdH - 20);

            // Zero line
            const zeroY = toCvdY(0);
            ctx.setLineDash([2, 3]);
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, zeroY);
            ctx.lineTo(chartW, zeroY);
            ctx.stroke();
            ctx.setLineDash([]);

            // CVD bars
            data.forEach((candle, i) => {
                const x = startX + i * totalCandleW;
                const val = candle.cvd ?? 0;
                const y = toCvdY(val);
                const barH = Math.abs(y - zeroY);
                ctx.fillStyle = val >= 0 ? MT4.cvdBull + 'cc' : MT4.cvdBear + 'cc';
                ctx.fillRect(x, Math.min(y, zeroY), CANDLE_WIDTH, Math.max(barH, 1));
            });

            // Current CVD value
            if (currentCandle) {
                const cv = currentCandle.cvd;
                ctx.fillStyle = cv >= 0 ? MT4.cvdBull : MT4.cvdBear;
                ctx.font = 'bold 9px monospace';
                ctx.textAlign = 'right';
                ctx.fillText((cv >= 0 ? '+' : '') + cv.toFixed(2), chartW - 5, cvdTop + 11);
            }
        }

        // ── Crosshair ──
        if (mouse) {
            ctx.strokeStyle = MT4.crosshair;
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            // Horizontal
            ctx.beginPath();
            ctx.moveTo(0, mouse.y);
            ctx.lineTo(chartW, mouse.y);
            ctx.stroke();
            // Vertical
            ctx.beginPath();
            ctx.moveTo(mouse.x, 0);
            ctx.lineTo(mouse.x, mainH);
            ctx.stroke();
            ctx.setLineDash([]);

            // Price at crosshair
            if (mouse.y < mainH) {
                const crossPrice = maxP - (mouse.y / mainH) * effectiveRange;
                const crossLabel = crossPrice < 10 ? crossPrice.toFixed(5) : crossPrice.toFixed(2);
                ctx.fillStyle = '#1e3a52';
                ctx.fillRect(chartW, mouse.y - 9, PRICE_RIGHT_PAD, 18);
                ctx.fillStyle = '#aad4f5';
                ctx.font = '10px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(crossLabel, chartW + PRICE_RIGHT_PAD / 2, mouse.y + 4);
            }
        }

    }, [candles, currentCandle, metrics]);

    // Animation loop
    useEffect(() => {
        const loop = () => {
            drawChart();
            animFrameRef.current = requestAnimationFrame(loop);
        };
        animFrameRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animFrameRef.current);
    }, [drawChart]);

    // Mouse events for crosshair
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }, []);

    const handleMouseLeave = useCallback(() => {
        mouseRef.current = null;
    }, []);

    const maxVol = Math.max(...volumeProfile.map(p => p.volume), 1);
    const sessionPOCLevel = volumeProfile.length > 0
        ? [...volumeProfile].sort((a, b) => b.volume - a.volume)[0]?.price
        : 0;

    const floatingPLColor = (metrics.floatingPL ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400';

    return (
        <div className="flex flex-col gap-2 h-full">

            {/* ─── Top Metrics Bar ─── */}
            <div className="grid grid-cols-4 md:grid-cols-8 gap-1.5">
                {/* Symbol + Live Price card */}
                <div className="col-span-2 p-2 bg-black/80 rounded border border-emerald-500/30 flex flex-col gap-0.5 relative overflow-hidden">
                    <div className="text-[9px] text-emerald-500/70 uppercase flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                        LIVE · {metrics.symbol || 'EURUSD'} · 1:3000
                    </div>
                    <div className="text-lg font-bold font-mono text-emerald-300 tracking-wider">
                        {currentCandle
                            ? (currentCandle.close < 10 ? currentCandle.close.toFixed(5) : currentCandle.close.toFixed(2))
                            : '—'}
                    </div>
                    <div className="absolute top-0 right-0 bottom-0 w-1 bg-emerald-500/20" />
                </div>
                {[
                    { label: 'NET P/L', value: `$${metrics.netProfit.toFixed(2)}`, color: metrics.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400', icon: <DollarSign className="w-3 h-3" /> },
                    { label: 'EQUITY', value: `$${(metrics.equity ?? metrics.initialBalance).toFixed(2)}`, color: 'text-blue-300', icon: <TrendingUp className="w-3 h-3" /> },
                    { label: 'TRADES', value: String(metrics.totalTrades), color: 'text-white', icon: <Activity className="w-3 h-3" /> },
                    { label: 'WIN RATE', value: `${(metrics.winRate * 100).toFixed(1)}%`, color: 'text-blue-400', icon: <BarChart2 className="w-3 h-3" /> },
                    { label: 'PROFIT F.', value: metrics.profitFactor?.toFixed(2) ?? '–', color: 'text-purple-400', icon: <Layers className="w-3 h-3" /> },
                    { label: 'MAX DD', value: `${metrics.maxDrawdown.toFixed(1)}%`, color: metrics.maxDrawdown > 15 ? 'text-red-400' : 'text-yellow-400', icon: <TrendingUp className="w-3 h-3 rotate-180" /> },
                ].map(({ label, value, color, icon }) => (
                    <div key={label} className="p-2 bg-black/60 rounded border border-white/5 flex flex-col gap-0.5">
                        <div className="text-[9px] text-gray-500 uppercase flex items-center gap-1">{icon} {label}</div>
                        <div className={`text-sm font-bold font-mono ${color}`}>{value}</div>
                    </div>
                ))}
            </div>

            {/* ─── Active Trade Banner ─── */}
            {metrics.activeTrade && (
                <div className={`flex items-center gap-4 px-4 py-2 rounded border text-sm ${metrics.activeTrade.type === 'buy' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                    <span className={`font-bold text-lg ${metrics.activeTrade.type === 'buy' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {metrics.activeTrade.type === 'buy' ? '▲ LONG' : '▼ SHORT'}
                    </span>
                    <span className="text-gray-400 font-mono text-xs">Entry: <span className="text-white">{metrics.activeTrade.entryPrice < 10 ? metrics.activeTrade.entryPrice.toFixed(5) : metrics.activeTrade.entryPrice.toFixed(2)}</span></span>
                    <span className="text-gray-400 text-xs">Volume: <span className="text-white">{metrics.activeTrade.volume} lot</span></span>
                    <span className="ml-auto text-xs text-gray-400">Floating P/L:
                        <span className={`ml-1 font-bold font-mono ${floatingPLColor}`}>
                            {(metrics.floatingPL ?? 0) >= 0 ? '+' : ''}${(metrics.floatingPL ?? 0).toFixed(2)}
                        </span>
                    </span>
                </div>
            )}

            {/* ─── Main Chart + Volume Profile ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 flex-1 min-h-0">

                {/* Canvas */}
                <div
                    ref={containerRef}
                    className="lg:col-span-3 rounded border border-white/8 bg-[#0a0e14] relative overflow-hidden cursor-crosshair"
                    style={{ minHeight: '400px' }}
                >
                    <canvas
                        ref={canvasRef}
                        className="w-full h-full"
                        style={{ display: 'block' }}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                    />

                    {/* Live badge */}
                    {isActive && (
                        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/70 px-2.5 py-1 rounded text-xs text-emerald-400 border border-emerald-500/25 backdrop-blur">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                            LIVE MARKET
                        </div>
                    )}

                    {/* Clock */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/50 px-2 py-1 rounded text-[10px] text-gray-500 font-mono border border-white/5">
                        <Clock className="w-3 h-3" />
                        {liveTime.toUTCString().slice(17, 25)} UTC
                    </div>
                </div>

                {/* Volume Profile Sidebar */}
                <div className="bg-black/70 rounded border border-white/8 p-2 flex flex-col overflow-hidden">
                    <div className="text-[9px] font-bold text-gray-600 mb-2 uppercase tracking-widest">Volume Profile</div>

                    <div className="flex-1 overflow-y-auto space-y-px text-[10px] scrollbar-thin scrollbar-thumb-white/10">
                        {volumeProfile.length === 0 && (
                            <div className="text-gray-700 text-center mt-8 text-xs">Accumulating data...</div>
                        )}
                        {volumeProfile.slice(0, 60).map((level) => {
                            const widthPercent = (level.volume / maxVol) * 100;
                            const isPOC = level.price === sessionPOCLevel;
                            return (
                                <div key={level.price} className={`flex items-center gap-1 h-[14px] ${isPOC ? 'bg-amber-500/10' : ''}`}>
                                    <div className={`w-[58px] text-right font-mono shrink-0 ${isPOC ? 'text-amber-400 font-bold' : 'text-gray-600'}`}>
                                        {level.price.toFixed(4)}
                                    </div>
                                    <div className="flex-1 h-[10px] relative bg-black/30 rounded-sm overflow-hidden flex">
                                        <div style={{ width: `${(level.buyVolume / maxVol) * 100}%` }} className={`h-full shrink-0 ${isPOC ? 'bg-emerald-400' : 'bg-emerald-600/50'}`} />
                                        <div style={{ width: `${(level.sellVolume / maxVol) * 100}%` }} className={`h-full shrink-0 ${isPOC ? 'bg-red-400' : 'bg-red-600/50'}`} />
                                    </div>
                                    {isPOC && <span className="text-amber-500 text-[8px] shrink-0">POC</span>}
                                </div>
                            );
                        })}
                    </div>

                    {/* Footprint for current candle */}
                    {currentCandle && Object.keys(currentCandle.footprint).length > 0 && (
                        <div className="border-t border-white/5 mt-2 pt-2">
                            <div className="text-[9px] font-bold text-gray-600 mb-1 uppercase tracking-widest">Footprint</div>
                            <div className="space-y-px text-[10px] overflow-y-auto max-h-[110px]">
                                {Object.values(currentCandle.footprint)
                                    .sort((a, b) => b.price - a.price)
                                    .slice(0, 20)
                                    .map(fp => (
                                        <div key={fp.price} className="flex justify-between font-mono px-1">
                                            <span className="text-gray-600">{fp.price.toFixed(4)}</span>
                                            <span className="text-red-400">{fp.sellVolume.toFixed(1)}</span>
                                            <span className="text-emerald-400">{fp.buyVolume.toFixed(1)}</span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ─── DeepCharts Indicators ─── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 text-xs">
                <div className="p-2 bg-emerald-500/5 border border-emerald-500/10 rounded">
                    <div className="text-emerald-400 font-bold mb-0.5 text-[10px] uppercase tracking-wide">Deep Effort</div>
                    <div className="text-gray-400 font-mono">
                        {currentCandle ? currentCandle.deepEffort.toFixed(2) : '0'} v/pip
                        <span className={`ml-2 font-bold ${deepMetrics?.institutionalActivity === 'HIGH' ? 'text-red-400' : deepMetrics?.institutionalActivity === 'MEDIUM' ? 'text-yellow-400' : 'text-gray-500'}`}>
                            {deepMetrics?.institutionalActivity || 'LOW'}
                        </span>
                    </div>
                </div>
                <div className="p-2 bg-purple-500/5 border border-purple-500/10 rounded">
                    <div className="text-purple-400 font-bold mb-0.5 text-[10px] uppercase tracking-wide">V-Tracker</div>
                    <div className="text-gray-400 font-mono">{currentCandle ? currentCandle.vTracker.toFixed(2) : '0'} v/min</div>
                </div>
                <div className="p-2 bg-blue-500/5 border border-blue-500/10 rounded">
                    <div className="text-blue-400 font-bold mb-0.5 text-[10px] uppercase tracking-wide">IVB Bands</div>
                    <div className="text-gray-400 font-mono text-[10px]">
                        ↑ {currentCandle?.ivbTop?.toFixed(4) ?? '–'} / ↓ {currentCandle?.ivbBottom?.toFixed(4) ?? '–'}
                    </div>
                </div>
                <div className="p-2 bg-orange-500/5 border border-orange-500/10 rounded">
                    <div className="text-orange-400 font-bold mb-0.5 text-[10px] uppercase tracking-wide">Trend Strength</div>
                    <div className="text-gray-400 flex items-center gap-2">
                        <div className="flex-1 bg-black/40 rounded h-1.5">
                            <div className="h-full rounded bg-gradient-to-r from-blue-500 to-orange-400" style={{ width: `${deepMetrics?.trendStrength ?? 0}%` }} />
                        </div>
                        <span className="font-mono">{deepMetrics ? deepMetrics.trendStrength.toFixed(0) : '0'}</span>
                        {deepMetrics?.imbalanceActive && <span className="text-red-400 font-bold text-[10px]">⚡ IMB</span>}
                    </div>
                </div>
            </div>
        </div>
    );
};
