
export interface Trade {
    id: number;
    time: number;
    type: 'buy' | 'sell';
    price: number;
    profit: number;
    symbol: string;
    volume: number;
}

export interface PriceLevel {
    price: number;
    volume: number;
    buyVolume: number;
    sellVolume: number;
}

export interface Candle {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    buyVolume: number;
    sellVolume: number;
    footprint: Record<string, PriceLevel>; // Key is price formatted as string
    vwap: number;
    cvd: number;
    ivbTop: number;
    ivbBottom: number;
    deepEffort: number;
    vTracker: number;
}

export interface DeepModelMetrics {
    trendStrength: number; // 0 to 100
    institutionalActivity: 'LOW' | 'MEDIUM' | 'HIGH';
    imbalanceActive: boolean;
}

export interface BacktestState {
    equity: number;
    balance: number;
    trades: Trade[];
    activeTrade: { type: 'buy' | 'sell', entryPrice: number, volume: number } | null;
    candles: Candle[];
    currentCandle: Candle;
    currentTime: number;
    maxDrawdown: number;
    volumeProfile: Record<string, PriceLevel>; // Session volume profile
}

export class BacktestSimulator {
    private state: BacktestState;
    private config: {
        initialBalance: number;
        winRate: number;
        avgWin: number;
        avgLoss: number;
        volatility: number;
        symbol: string;
    };
    private lastPrice: number;
    private tickCount: number = 0;
    private ticksPerCandle: number = 60; // Approximate ticks for a 1-minute candle building if derived from live trades

    // DeepCharts state
    private cumulativeVolume: number = 0;
    private cumulativePriceVolume: number = 0;
    private cumulativeDelta: number = 0;

    constructor(config: { initialBalance: number; winRate: number; avgWin: number; avgLoss: number; volatility: number; symbol?: string }) {
        this.config = { ...config, symbol: config.symbol || 'EURUSD' };
        this.lastPrice = 1.1000; // Starting price for EURUSD

        // Initialize first candle
        const initialCandle: Candle = {
            time: 0,
            open: this.lastPrice,
            high: this.lastPrice,
            low: this.lastPrice,
            close: this.lastPrice,
            volume: 0,
            buyVolume: 0,
            sellVolume: 0,
            footprint: {},
            vwap: this.lastPrice,
            cvd: 0,
            ivbTop: this.lastPrice,
            ivbBottom: this.lastPrice,
            deepEffort: 0,
            vTracker: 0
        };

        this.state = {
            equity: config.initialBalance,
            balance: config.initialBalance,
            trades: [],
            activeTrade: null,
            candles: [],
            currentCandle: initialCandle,
            currentTime: 0,
            maxDrawdown: 0,
            volumeProfile: {},
        };
    }

    // Initialize with a full historical candle directly
    processHistoricalCandle(historicalCandle: Candle) {
        if (!historicalCandle || isNaN(historicalCandle.close)) return;

        this.lastPrice = historicalCandle.close;
        this.cumulativeVolume += historicalCandle.volume;
        this.cumulativePriceVolume += historicalCandle.vwap * historicalCandle.volume;
        this.cumulativeDelta += historicalCandle.cvd;

        // Add to historical store
        this.state.candles.push(historicalCandle);

        // Update overall session volume profile
        Object.values(historicalCandle.footprint).forEach(level => {
            const priceKey = level.price.toFixed(4);
            if (!this.state.volumeProfile[priceKey]) {
                this.state.volumeProfile[priceKey] = { price: Number(priceKey), volume: 0, buyVolume: 0, sellVolume: 0 };
            }
            this.state.volumeProfile[priceKey].volume += level.volume;
            this.state.volumeProfile[priceKey].buyVolume += level.buyVolume;
            this.state.volumeProfile[priceKey].sellVolume += level.sellVolume;
        });

        // Setup the next currentCandle to start from the close of this historical one
        this.state.currentCandle = {
            time: historicalCandle.time + 60000, // Roughly Next minute
            open: historicalCandle.close,
            high: historicalCandle.close,
            low: historicalCandle.close,
            close: historicalCandle.close,
            volume: 0,
            buyVolume: 0,
            sellVolume: 0,
            footprint: {},
            vwap: historicalCandle.vwap,
            cvd: historicalCandle.cvd,
            ivbTop: historicalCandle.close,
            ivbBottom: historicalCandle.close,
            deepEffort: 0,
            vTracker: 0
        };

        this.simulateTrade(historicalCandle.close);
    }

    // Process a real live tick
    processTick(price: number, volume: number, isBuyerMaker: boolean): { equity: number; currentCandle: Candle; lastTrade?: Trade; deepMetrics?: DeepModelMetrics } {
        this.state.currentTime = Date.now();
        this.tickCount++;

        const newPrice = price;
        const tickVolume = volume;
        const isBuy = !isBuyerMaker; // In crypto trades, if it's NOT buyer maker, it means the taker was a BUYER (Aggressive Buy)

        // Update Current Candle
        const candle = this.state.currentCandle;
        candle.close = newPrice;
        candle.high = Math.max(candle.high, newPrice);
        candle.low = Math.min(candle.low, newPrice);

        candle.volume += tickVolume;
        if (isBuy) candle.buyVolume += tickVolume;
        else candle.sellVolume += tickVolume;

        // Update Footprint for current candle
        const priceKey = newPrice.toFixed(4); // Group by pip
        if (!candle.footprint[priceKey]) {
            candle.footprint[priceKey] = { price: Number(priceKey), volume: 0, buyVolume: 0, sellVolume: 0 };
        }
        candle.footprint[priceKey].volume += tickVolume;
        if (isBuy) candle.footprint[priceKey].buyVolume += tickVolume;
        else candle.footprint[priceKey].sellVolume += tickVolume;

        // Update Session Volume Profile
        if (!this.state.volumeProfile[priceKey]) {
            this.state.volumeProfile[priceKey] = { price: Number(priceKey), volume: 0, buyVolume: 0, sellVolume: 0 };
        }
        this.state.volumeProfile[priceKey].volume += tickVolume;
        if (isBuy) this.state.volumeProfile[priceKey].buyVolume += tickVolume;
        else this.state.volumeProfile[priceKey].sellVolume += tickVolume;

        // DeepCharts Metrics Calculations
        this.cumulativeVolume += tickVolume;
        this.cumulativePriceVolume += newPrice * tickVolume;
        candle.vwap = this.cumulativeVolume > 0 ? this.cumulativePriceVolume / this.cumulativeVolume : newPrice;

        const delta = (isBuy ? tickVolume : -tickVolume);
        this.cumulativeDelta += delta;
        candle.cvd = this.cumulativeDelta;

        // Calculate Deep Effort (Order Flow Intensity)
        // Ratio of total volume to the price range expanded. High effort with low price movement = institutional absorption.
        const priceRange = Math.abs(candle.high - candle.low) || 0.0001;
        candle.deepEffort = candle.volume / (priceRange * 10000); // Normalized Volume per Pip

        // Calculate V-Tracker (Volume Velocity)
        // Purely mathematical: Rate of volume addition per tick over rolling period
        const timeElapsedMin = Math.max((this.state.currentTime - candle.time) / 60000, 0.016); // avoid div 0, min 1 sec
        candle.vTracker = candle.volume / timeElapsedMin;

        // Calculate IVB (Imbalance Value Band)
        // Find POC (Point of Control) for the candle to center the bands around high liquidity nodes
        let maxVolPrice = newPrice;
        let maxVol = 0;
        Object.values(candle.footprint).forEach(level => {
            if (level.volume > maxVol) {
                maxVol = level.volume;
                maxVolPrice = level.price;
            }
        });

        // Bands expand dynamically based on local standard deviation (simulated here via config volatility scale of POC)
        candle.ivbTop = maxVolPrice + (this.config.volatility * 0.00005);
        candle.ivbBottom = maxVolPrice - (this.config.volatility * 0.00005);

        this.lastPrice = newPrice;

        // Check if we should close the candle (simulated time boundary)
        if (this.tickCount >= this.ticksPerCandle) {
            this.state.candles.push({ ...candle }); // Archive candle
            this.tickCount = 0;
            // Start new candle
            this.state.currentCandle = {
                time: this.state.currentTime,
                open: newPrice,
                high: newPrice,
                low: newPrice,
                close: newPrice,
                volume: 0,
                buyVolume: 0,
                sellVolume: 0,
                footprint: {},
                vwap: candle.vwap, // Carry over VWAP
                cvd: candle.cvd,
                ivbTop: newPrice,
                ivbBottom: newPrice,
                deepEffort: 0,
                vTracker: 0
            };
        }

        const trade = this.simulateTrade(newPrice);

        // Max Drawdown tracking
        const currentDrawdown = ((this.config.initialBalance - this.state.equity) / this.config.initialBalance) * 100;
        if (currentDrawdown > this.state.maxDrawdown) {
            this.state.maxDrawdown = currentDrawdown;
        }

        // Generate aggregate DeepMetrics mathematically
        // Trend Strength is functionally derived from the dominance of Order Flow Delta relative to total volume
        const deltaPercentage = this.cumulativeVolume > 0 ? (Math.abs(this.cumulativeDelta) / this.cumulativeVolume) * 100 : 0;
        // Map 0-50% delta to a 0-100 trend strength score
        const trendStrength = Math.min(100, deltaPercentage * 2);

        // Institutional Activity is detected by extreme deep effort metrics (high volume absorbed in tight ranges)
        const institutionalActivity = candle.deepEffort > 500 ? 'HIGH' : (candle.deepEffort > 200 ? 'MEDIUM' : 'LOW');

        // Imbalance Active if raw delta flow is exceptionally directional on the tick level
        const imbalanceActive = Math.abs(delta) > (candle.volume * 0.1);

        return {
            equity: this.state.equity,
            currentCandle: this.state.currentCandle,
            lastTrade: trade,
            deepMetrics: {
                trendStrength,
                institutionalActivity,
                imbalanceActive
            }
        };
    }

    private simulateTrade(newPrice: number): Trade | undefined {
        let closedTrade: Trade | undefined;

        // If we have an active trade, calculate floating P/L based on real price movements
        if (this.state.activeTrade) {
            const isBuy = this.state.activeTrade.type === 'buy';
            const priceDiff = isBuy ? (newPrice - this.state.activeTrade.entryPrice) : (this.state.activeTrade.entryPrice - newPrice);

            // Normalize P/L calculation across Crypto (BTC=$60k) and Forex (EUR=$1.1)
            // 1:3000 leverage — 1 standard lot ($100,000 notional) magnified by 3000/500 = 6× vs legacy 1:500 baseline
            const percentMove = priceDiff / this.state.activeTrade.entryPrice;
            const positionSizeUSD = 100000 * this.state.activeTrade.volume * 6; // 1:3000 leverage amplifier
            const floatingPL = percentMove * positionSizeUSD;

            this.state.equity = this.state.balance + floatingPL;

            // Deterministic Take Profit / Stop Loss based on real market movement
            if (floatingPL > this.config.avgWin || floatingPL < -this.config.avgLoss) {
                this.state.balance += floatingPL;
                this.state.equity = this.state.balance;

                closedTrade = {
                    id: this.state.trades.length + 1,
                    time: this.state.currentTime,
                    type: this.state.activeTrade.type,
                    price: newPrice,
                    profit: floatingPL,
                    symbol: this.config.symbol,
                    volume: this.state.activeTrade.volume
                };
                this.state.trades.push(closedTrade);
                this.state.activeTrade = null; // Clear position
            }
        } else {
            // Equity equals balance when no trades are open
            this.state.equity = this.state.balance;

            // Deterministic Algorithmic Trade Entry Logic
            // Looking for VWAP cross-over + Strong Order Flow Delta
            const currentCandle = this.state.currentCandle;
            const candleCvd = currentCandle.buyVolume - currentCandle.sellVolume;

            // Rules for a BUY: Price above VWAP + Buying Delta dominates volume
            const buyCondition = newPrice > currentCandle.vwap && candleCvd > (currentCandle.volume * 0.05);

            // Rules for a SELL: Price below VWAP + Selling Delta dominates volume
            const sellCondition = newPrice < currentCandle.vwap && candleCvd < -(currentCandle.volume * 0.05);

            // 0.001 absolute volume catches both live crypto micro-ticks and forex history blocks
            if (buyCondition && currentCandle.volume > 0.001) {
                this.state.activeTrade = {
                    type: 'buy',
                    entryPrice: newPrice,
                    volume: 1.0 // Standard 1 Lot
                };
            } else if (sellCondition && currentCandle.volume > 0.001) {
                this.state.activeTrade = {
                    type: 'sell',
                    entryPrice: newPrice,
                    volume: 1.0 // Standard 1 Lot
                };
            }
        }

        return closedTrade;
    }

    getMetrics() {
        const wins = this.state.trades.filter(t => t.profit > 0).length;
        // const losses = this.state.trades.length - wins; 
        const winRate = this.state.trades.length > 0 ? wins / this.state.trades.length : 0;

        const totalGrossProfit = this.state.trades.filter(t => t.profit > 0).reduce((acc, t) => acc + t.profit, 0);
        const totalGrossLoss = Math.abs(this.state.trades.filter(t => t.profit < 0).reduce((acc, t) => acc + t.profit, 0));
        // Calculate current floating P/L
        let floatingPL = 0;
        if (this.state.activeTrade) {
            const isBuy = this.state.activeTrade.type === 'buy';
            const priceDiff = isBuy ? (this.lastPrice - this.state.activeTrade.entryPrice) : (this.state.activeTrade.entryPrice - this.lastPrice);
            const percentMove = priceDiff / this.state.activeTrade.entryPrice;
            floatingPL = percentMove * 100000 * this.state.activeTrade.volume * 6; // 1:3000 leverage
        }

        const profitFactor = totalGrossLoss > 0 ? totalGrossProfit / totalGrossLoss : (totalGrossProfit > 0 ? 99 : 1);

        return {
            totalTrades: this.state.trades.length,
            winRate,
            profitFactor,
            maxDrawdown: this.state.maxDrawdown,
            netProfit: this.state.balance - this.config.initialBalance, // Realized Net Profit
            floatingPL: floatingPL, // Current open position P/L
            equity: this.state.equity,
            activeTrade: this.state.activeTrade,
            initialBalance: this.config.initialBalance,
            symbol: this.config.symbol,
            history: this.state.candles,
            volumeProfile: Object.values(this.state.volumeProfile).sort((a, b) => b.price - a.price)
        };
    }
}
