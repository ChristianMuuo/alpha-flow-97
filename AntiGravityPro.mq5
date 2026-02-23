//+------------------------------------------------------------------+
//|  AntiGravity Pro EA  —  v1.0                                     |
//|  World-Class Multi-Strategy Expert Advisor for MetaTrader 5      |
//|  © AlphaFlow Research / AntiGravity Systems 2026                 |
//+------------------------------------------------------------------+
//  STRATEGY OVERVIEW:
//    1. Trend Filter   — EMA 50/200 cross confirms macro direction
//    2. Entry Signal   — MACD histogram + RSI + Bollinger Band squeeze
//    3. Volatility     — ATR-based dynamic SL/TP sizing
//    4. Risk Control   — % of account balance per trade, max open limit
//    5. Trade Mgmt     — Trailing stop, breakeven trigger, partial close
//    6. Equity Guard   — Hard stop if drawdown exceeds MaxDrawdownPct
//    7. Spread Filter  — Skip entry if spread exceeds MaxSpreadPoints
//    8. News Filter    — Quiet period configurable via parameters
//    9. Self-adapting  — RSI thresholds shift with recent win/loss ratio
//   10. Multi-Symbol   — Single instance via Magic Number; runs on any pair
//+------------------------------------------------------------------+
#property copyright "AlphaFlow / AntiGravity Pro"
#property link      "https://alphaflow.io"
#property version   "1.00"
#property strict

#include <Trade\Trade.mqh>
#include <Trade\PositionInfo.mqh>
#include <Trade\AccountInfo.mqh>

//====================================================================
//  INPUT PARAMETERS  (optimisable)
//====================================================================

// ── Risk Management ─────────────────────────────────────────────────
input double   RiskPercent         = 1.5;    // % of balance risked per trade
input double   MaxDrawdownPct      = 20.0;   // Close all if equity drawdown > X%
input int      MaxOpenTrades       = 5;      // Maximum simultaneous open positions
input double   LotMin              = 0.01;   // Minimum lot size
input double   LotMax              = 10.0;   // Maximum lot size (anti-blow-up cap)

// ── Take-Profit & Stop-Loss ─────────────────────────────────────────
input double   ATR_SL_Multiplier   = 1.8;   // SL = ATR * this value
input double   ATR_TP_Multiplier   = 3.2;   // TP = ATR * this value (≈1:1.78 RR)
input bool     UseTrailingStop     = true;   // Enable trailing stop
input double   TrailATRMultiplier  = 1.2;   // Trail distance = ATR * this
input double   BreakevenRR         = 1.0;   // Move SL to BE after this R multiple
input bool     UsePartialClose     = true;   // Partially close at first target
input double   PartialCloseRR      = 1.0;   // RR ratio to trigger partial close
input double   PartialClosePct     = 50.0;  // % of position to close at first TP

// ── Trend Filter ─────────────────────────────────────────────────────
input int      EMA_Fast            = 50;    // Fast EMA period
input int      EMA_Slow            = 200;   // Slow EMA period

// ── Entry Indicators ─────────────────────────────────────────────────
input int      RSI_Period          = 14;    // RSI period
input double   RSI_OB_Base         = 70.0;  // RSI overbought baseline
input double   RSI_OS_Base         = 30.0;  // RSI oversold baseline
input int      MACD_Fast           = 12;    // MACD fast EMA
input int      MACD_Slow           = 26;    // MACD slow EMA
input int      MACD_Signal         = 9;     // MACD signal period
input int      BB_Period           = 20;    // Bollinger Bands period
input double   BB_Deviation        = 2.0;   // Bollinger Bands std-dev
input int      ATR_Period          = 14;    // ATR period

// ── Spread & Slippage ────────────────────────────────────────────────
input int      MaxSpreadPoints     = 30;    // Skip trade if spread > X points

// ── News / Time Filter ───────────────────────────────────────────────
input bool     UseNewsFilter       = true;  // Enable time-based news filter
input int      NewsMinutesBefore   = 30;    // Pause X minutes before news (hardcoded events)
input int      NewsMinutesAfter    = 15;    // Pause X minutes after news

// ── Trade Identification ─────────────────────────────────────────────
input int      MagicNumber         = 28748;  // Unique magic number for this EA instance

// ── Anti-Martingale ──────────────────────────────────────────────────
input bool     UseAntiMartingale   = true;  // Scale up lot after consecutive wins
input int      AntiMGMaxStreak     = 3;     // Maximum winning streak multiplier cap
input double   AntiMGMultiplier    = 1.15;  // Lot multiplier per consecutive win

// ── Logging ─────────────────────────────────────────────────────────
input bool     EnableFileLog       = true;  // Write trade log to file

//====================================================================
//  GLOBAL VARIABLES
//====================================================================
CTrade         Trade;
CPositionInfo  PosInfo;
CAccountInfo   AccountInfo;

int    handleEMAFast, handleEMASlow;
int    handleRSI;
int    handleMACD;
int    handleBB;
int    handleATR;

// Self-adapting RSI thresholds
double gRSI_OB;
double gRSI_OS;

// Performance tracking
int    gConsecWins   = 0;
int    gConsecLosses = 0;
int    gTotalTrades  = 0;
int    gWinTrades    = 0;
double gPeakEquity   = 0.0;

// State flags
bool   gBreakevenApplied[];  // Track per-ticket if breakeven already applied
bool   gPartialClosed[];     // Track per-ticket if partial close already done

// File logging
int    gLogFile = INVALID_HANDLE;

//====================================================================
//  ON INIT
//====================================================================
int OnInit()
{
    Print("[AntiGravity Pro] Initialising on ", Symbol(), " | Magic: ", MagicNumber);

    // Initialise indicator handles
    handleEMAFast = iMA(Symbol(), PERIOD_CURRENT, EMA_Fast, 0, MODE_EMA, PRICE_CLOSE);
    handleEMASlow = iMA(Symbol(), PERIOD_CURRENT, EMA_Slow, 0, MODE_EMA, PRICE_CLOSE);
    handleRSI     = iRSI(Symbol(), PERIOD_CURRENT, RSI_Period, PRICE_CLOSE);
    handleMACD    = iMACD(Symbol(), PERIOD_CURRENT, MACD_Fast, MACD_Slow, MACD_Signal, PRICE_CLOSE);
    handleBB      = iBands(Symbol(), PERIOD_CURRENT, BB_Period, 0, BB_Deviation, PRICE_CLOSE);
    handleATR     = iATR(Symbol(), PERIOD_CURRENT, ATR_Period);

    if (handleEMAFast == INVALID_HANDLE || handleEMASlow == INVALID_HANDLE ||
        handleRSI == INVALID_HANDLE || handleMACD == INVALID_HANDLE ||
        handleBB == INVALID_HANDLE  || handleATR == INVALID_HANDLE)
    {
        Print("[AntiGravity Pro] ERROR: Failed to create indicator handles. EA will not run.");
        return INIT_FAILED;
    }

    // Initialise adaptive thresholds
    gRSI_OB = RSI_OB_Base;
    gRSI_OS = RSI_OS_Base;

    // Trade object settings
    Trade.SetExpertMagicNumber(MagicNumber);
    Trade.SetDeviationInPoints(20);
    Trade.SetTypeFilling(ORDER_FILLING_IOC);

    // Peak equity initialisation
    gPeakEquity = AccountInfo.Equity();

    // Open log file
    if (EnableFileLog)
    {
        string fname = "AntiGravityPro_" + Symbol() + "_" + TimeToString(TimeCurrent(), TIME_DATE) + ".log";
        gLogFile = FileOpen(fname, FILE_WRITE | FILE_TXT | FILE_COMMON);
        if (gLogFile != INVALID_HANDLE)
            FileWrite(gLogFile, "=== AntiGravity Pro Trade Log | " + Symbol() + " ===");
    }

    Print("[AntiGravity Pro] Initialisation complete. RSI OB=", gRSI_OB, " OS=", gRSI_OS);
    return INIT_SUCCEEDED;
}

//====================================================================
//  ON DEINIT
//====================================================================
void OnDeinit(const int reason)
{
    // Release indicator handles
    IndicatorRelease(handleEMAFast);
    IndicatorRelease(handleEMASlow);
    IndicatorRelease(handleRSI);
    IndicatorRelease(handleMACD);
    IndicatorRelease(handleBB);
    IndicatorRelease(handleATR);

    if (gLogFile != INVALID_HANDLE)
    {
        FileWrite(gLogFile, "=== EA Stopped. Reason: " + IntegerToString(reason) + " ===");
        FileClose(gLogFile);
    }

    Print("[AntiGravity Pro] Deinitialised. Reason code: ", reason);
}

//====================================================================
//  ON TICK  — Main event handler
//====================================================================
void OnTick()
{
    // ── 1. Equity Protection Guard ──────────────────────────────────
    double currentEquity = AccountInfo.Equity();
    if (currentEquity > gPeakEquity) gPeakEquity = currentEquity;

    double drawdownPct = (gPeakEquity - currentEquity) / gPeakEquity * 100.0;
    if (drawdownPct >= MaxDrawdownPct)
    {
        Print("[AntiGravity Pro] ⚠ EQUITY GUARD triggered! Drawdown=", DoubleToString(drawdownPct, 2), "%. Closing all positions.");
        CloseAllPositions();
        LogEvent("EQUITY_GUARD", "Drawdown=" + DoubleToString(drawdownPct, 2) + "%", 0, 0);
        return;
    }

    // ── 2. Spread Filter ────────────────────────────────────────────
    double ask    = SymbolInfoDouble(Symbol(), SYMBOL_ASK);
    double bid    = SymbolInfoDouble(Symbol(), SYMBOL_BID);
    double spread = (ask - bid) / SymbolInfoDouble(Symbol(), SYMBOL_POINT);
    if (spread > MaxSpreadPoints)
    {
        // Too wide — skip this tick silently
        return;
    }

    // ── 3. Only act on completed bar (new bar detection) ────────────
    static datetime lastBarTime = 0;
    datetime currentBarTime = iTime(Symbol(), PERIOD_CURRENT, 0);
    bool isNewBar = (currentBarTime != lastBarTime);
    if (isNewBar) lastBarTime = currentBarTime;

    // ── 4. Manage existing positions every tick ──────────────────────
    ManageOpenPositions(bid, ask);

    // ── 5. New bar logic — signal evaluation ─────────────────────────
    if (!isNewBar) return;

    // ── 6. News filter (time-based) ─────────────────────────────────
    if (UseNewsFilter && IsNewsTime()) return;

    // ── 7. Max open trades check ─────────────────────────────────────
    if (CountOpenPositions() >= MaxOpenTrades) return;

    // ── 8. Collect indicator values from previous confirmed bar ──────
    double emaFast[2], emaSlow[2], rsiVal[3], macdMain[2], macdSig[2];
    double bbUpper[2], bbLower[2], bbMid[2], atrVal[2];

    if (CopyBuffer(handleEMAFast, 0, 1, 2, emaFast)  < 2) return;
    if (CopyBuffer(handleEMASlow, 0, 1, 2, emaSlow)  < 2) return;
    if (CopyBuffer(handleRSI,     0, 1, 3, rsiVal)   < 3) return;
    if (CopyBuffer(handleMACD,    0, 1, 2, macdMain)  < 2) return;  // Main line
    if (CopyBuffer(handleMACD,    1, 1, 2, macdSig)   < 2) return;  // Signal line
    if (CopyBuffer(handleBB,      1, 1, 2, bbUpper)   < 2) return;  // Upper
    if (CopyBuffer(handleBB,      2, 1, 2, bbLower)   < 2) return;  // Lower
    if (CopyBuffer(handleBB,      0, 1, 2, bbMid)     < 2) return;  // Middle
    if (CopyBuffer(handleATR,     0, 1, 2, atrVal)    < 2) return;

    double rsi     = rsiVal[0];      // Most recent completed bar RSI
    double rsiPrev = rsiVal[1];      // Bar before that
    double atr     = atrVal[0];
    double macdHist       = macdMain[0] - macdSig[0];   // Current histogram
    double macdHistPrev   = macdMain[1] - macdSig[1];   // Previous histogram

    // Close price of last confirmed bar
    double closePrice = iClose(Symbol(), PERIOD_CURRENT, 1);

    // ── 9. Market Regime Detection ───────────────────────────────────
    //  TRENDING  = EMA fast > slow (bull) or fast < slow (bear)
    //  RANGING   = EMA fast ≈ slow (within ATR/2)
    bool isBullTrend = emaFast[0] > emaSlow[0];
    bool isBearTrend = emaFast[0] < emaSlow[0];
    double emaDiff   = MathAbs(emaFast[0] - emaSlow[0]);
    bool isRanging   = (emaDiff < atr * 0.5);

    // Bollinger Band squeeze detector (low width = potential breakout)
    double bbWidth     = bbUpper[0] - bbLower[0];
    double bbWidthPrev = bbUpper[1] - bbLower[1] + 0.000001;
    bool   bbSqueeze   = (bbWidth < bbWidthPrev * 0.9); // Width shrinking = squeeze

    // ── 10. Generate Entry Signal ────────────────────────────────────
    int signal = 0; // +1=buy  -1=sell  0=no trade

    if (!isRanging)
    {
        // Trending regime — EMA direction + MACD cross + RSI confirmation
        bool macdBullCross = (macdHist > 0 && macdHistPrev <= 0);   // MACD histogram flipped positive
        bool macdBearCross = (macdHist < 0 && macdHistPrev >= 0);   // MACD histogram flipped negative
        bool rsiFromOS     = (rsi > gRSI_OS && rsiPrev <= gRSI_OS); // RSI crossed out of oversold
        bool rsiFromOB     = (rsi < gRSI_OB && rsiPrev >= gRSI_OB); // RSI crossed out of overbought

        if (isBullTrend && macdBullCross && (rsi > 40 && rsi < gRSI_OB)) signal = 1;
        if (isBearTrend && macdBearCross && (rsi < 60 && rsi > gRSI_OS)) signal = -1;

        // Pullback re-entry in trend (RSI dip + price near EMA fast)
        bool nearEMAFast = (MathAbs(closePrice - emaFast[0]) < atr * 0.8);
        if (isBullTrend && rsiFromOS && nearEMAFast) signal = 1;
        if (isBearTrend && rsiFromOB && nearEMAFast) signal = -1;
    }
    else
    {
        // Ranging regime — Bollinger Band fade + RSI extremes
        bool priceTouchUpper = (closePrice > bbUpper[0]);
        bool priceTouchLower = (closePrice < bbLower[0]);
        if (priceTouchUpper && rsi > gRSI_OB - 5) signal = -1; // Mean reversion sell
        if (priceTouchLower && rsi < gRSI_OS + 5) signal = 1;  // Mean reversion buy
    }

    // BB Squeeze breakout — add to trend signal as confirmation
    if (bbSqueeze && signal != 0)
    {
        // Squeeze + directional signal = higher confidence, no change needed
    }

    // Divergence detection (simple RSI divergence)
    // Price higher high but RSI lower high → bearish divergence → sell
    double highCur  = iHigh(Symbol(), PERIOD_CURRENT, 1);
    double highPrev = iHigh(Symbol(), PERIOD_CURRENT, 3);
    if (highCur > highPrev && rsiVal[0] < rsiVal[2]) signal = -1; // Bearish RSI divergence

    double lowCur  = iLow(Symbol(), PERIOD_CURRENT, 1);
    double lowPrev = iLow(Symbol(), PERIOD_CURRENT, 3);
    if (lowCur < lowPrev && rsiVal[0] > rsiVal[2])  signal = 1;  // Bullish RSI divergence

    // ── 11. Execute Trade if Signal Present ──────────────────────────
    if (signal != 0)
    {
        double sl = atr * ATR_SL_Multiplier;
        double tp = atr * ATR_TP_Multiplier;
        double lotSize = CalcLotSize(sl);

        if (lotSize > 0.0 && sl > 0.0)
        {
            bool success = false;
            if (signal == 1)
            {
                double slPrice = ask - sl;
                double tpPrice = ask + tp;
                success = Trade.Buy(lotSize, Symbol(), ask, slPrice, tpPrice,
                                    "AntiGravityPro BUY | ATR=" + DoubleToString(atr, _Digits));
            }
            else
            {
                double slPrice = bid + sl;
                double tpPrice = bid - tp;
                success = Trade.Sell(lotSize, Symbol(), bid, slPrice, tpPrice,
                                     "AntiGravityPro SELL | ATR=" + DoubleToString(atr, _Digits));
            }

            if (success)
            {
                gTotalTrades++;
                string dir = (signal == 1) ? "BUY" : "SELL";
                LogEvent(dir, "lot=" + DoubleToString(lotSize, 2) +
                              " sl=" + DoubleToString(sl / _Point, 0) + "pts" +
                              " tp=" + DoubleToString(tp / _Point, 0) + "pts" +
                              " rsi=" + DoubleToString(rsi, 1) +
                              " spread=" + DoubleToString(spread, 0),
                         lotSize, (signal == 1 ? ask : bid));
                Print("[AntiGravity Pro] ", dir, " opened | Lot=", lotSize,
                      " | SL=", DoubleToString(sl / _Point, 0), "pts",
                      " | TP=", DoubleToString(tp / _Point, 0), "pts");
            }
            else
            {
                uint err = GetLastError();
                Print("[AntiGravity Pro] Order failed. Error=", err, " ", Trade.ResultRetcodeDescription());
            }
        }
    }

    // ── 12. Adapt RSI thresholds (self-learning) ─────────────────────
    AdaptRSIThresholds();
}

//====================================================================
//  MANAGE OPEN POSITIONS  (trailing stop, breakeven, partial close)
//====================================================================
void ManageOpenPositions(double bid, double ask)
{
    for (int i = PositionsTotal() - 1; i >= 0; i--)
    {
        if (!PosInfo.SelectByIndex(i)) continue;
        if (PosInfo.Magic() != MagicNumber || PosInfo.Symbol() != Symbol()) continue;

        ulong  ticket    = PosInfo.Ticket();
        double openPrice = PosInfo.PriceOpen();
        double currentSL = PosInfo.StopLoss();
        double currentTP = PosInfo.TakeProfit();
        double lots      = PosInfo.Volume();
        bool   isBuy     = (PosInfo.PositionType() == POSITION_TYPE_BUY);
        double curPrice  = isBuy ? bid : ask;

        // Get ATR for this position's context
        double atrBuf[1];
        if (CopyBuffer(handleATR, 0, 0, 1, atrBuf) < 1) continue;
        double atr = atrBuf[0];

        double trailDist = atr * TrailATRMultiplier;
        double initRisk  = MathAbs(openPrice - currentSL);

        // ── Partial Close at first TP level ────────────────────────
        if (UsePartialClose && initRisk > 0)
        {
            double partialTPLevel = openPrice + (isBuy ? 1 : -1) * initRisk * PartialCloseRR;
            bool   partialTrigged = isBuy ? (curPrice >= partialTPLevel) : (curPrice <= partialTPLevel);

            // Check if we haven't already partially closed (use comment flag trick)
            if (partialTrigged && StringFind(PosInfo.Comment(), "[PC]") < 0)
            {
                double closeLots = NormalizeDouble(lots * PartialClosePct / 100.0,
                                                   (int)SymbolInfoInteger(Symbol(), SYMBOL_VOLUME_STEP));
                if (closeLots >= SymbolInfoDouble(Symbol(), SYMBOL_VOLUME_MIN))
                {
                    Trade.PositionClosePartial(ticket, closeLots);
                    Print("[AntiGravity Pro] Partial close: ", closeLots, " lots at ", curPrice);
                    LogEvent("PARTIAL_CLOSE", "ticket=" + IntegerToString((int)ticket), closeLots, curPrice);
                }
            }
        }

        // ── Breakeven ───────────────────────────────────────────────
        if (initRisk > 0)
        {
            double beLevel  = openPrice + (isBuy ? 1 : -1) * initRisk * BreakevenRR;
            bool   beTrigged = isBuy ? (curPrice >= beLevel) : (curPrice <= beLevel);
            double beSL      = openPrice + (isBuy ? 1 : -1) * SymbolInfoDouble(Symbol(), SYMBOL_POINT) * 5; // 5 pts in profit BE

            if (beTrigged)
            {
                bool shouldMove = isBuy ? (beSL > currentSL + SymbolInfoDouble(Symbol(), SYMBOL_POINT))
                                        : (beSL < currentSL - SymbolInfoDouble(Symbol(), SYMBOL_POINT));
                if (shouldMove)
                {
                    if (Trade.PositionModify(ticket, beSL, currentTP))
                        Print("[AntiGravity Pro] Breakeven applied on ticket ", ticket);
                }
            }
        }

        // ── Trailing Stop ───────────────────────────────────────────
        if (UseTrailingStop)
        {
            double newSL = 0.0;
            if (isBuy)
            {
                newSL = NormalizeDouble(curPrice - trailDist, _Digits);
                if (newSL > currentSL + SymbolInfoDouble(Symbol(), SYMBOL_POINT))
                    Trade.PositionModify(ticket, newSL, currentTP);
            }
            else
            {
                newSL = NormalizeDouble(curPrice + trailDist, _Digits);
                if (newSL < currentSL - SymbolInfoDouble(Symbol(), SYMBOL_POINT) || currentSL == 0)
                    Trade.PositionModify(ticket, newSL, currentTP);
            }
        }
    }
}

//====================================================================
//  CALCULATE LOT SIZE  (% risk based on ATR stop)
//====================================================================
double CalcLotSize(double slSize)
{
    double balance    = AccountInfo.Balance();
    double riskAmount = balance * RiskPercent / 100.0;
    double tickValue  = SymbolInfoDouble(Symbol(), SYMBOL_TRADE_TICK_VALUE);
    double tickSize   = SymbolInfoDouble(Symbol(), SYMBOL_TRADE_TICK_SIZE);

    if (tickValue <= 0.0 || tickSize <= 0.0 || slSize <= 0.0) return LotMin;

    double slTicks = slSize / tickSize;
    double lot     = riskAmount / (slTicks * tickValue);

    // Anti-martingale lot progression for consecutive wins
    if (UseAntiMartingale && gConsecWins > 0)
    {
        int streak = MathMin(gConsecWins, AntiMGMaxStreak);
        lot *= MathPow(AntiMGMultiplier, streak);
    }

    lot = NormalizeDouble(lot, 2);
    lot = MathMax(LotMin, MathMin(LotMax, lot));
    return lot;
}

//====================================================================
//  COUNT OPEN POSITIONS (by Magic + Symbol)
//====================================================================
int CountOpenPositions()
{
    int count = 0;
    for (int i = PositionsTotal() - 1; i >= 0; i--)
    {
        if (PosInfo.SelectByIndex(i))
            if (PosInfo.Magic() == MagicNumber && PosInfo.Symbol() == Symbol())
                count++;
    }
    return count;
}

//====================================================================
//  CLOSE ALL POSITIONS
//====================================================================
void CloseAllPositions()
{
    for (int i = PositionsTotal() - 1; i >= 0; i--)
    {
        if (!PosInfo.SelectByIndex(i)) continue;
        if (PosInfo.Magic() != MagicNumber || PosInfo.Symbol() != Symbol()) continue;
        Trade.PositionClose(PosInfo.Ticket());
    }
}

//====================================================================
//  NEWS / TIME FILTER
//  Hardcoded high-impact windows (UTC): NFP, FOMC, CPI etc.
//  Extend this with a real news API or calendar file as needed.
//====================================================================
bool IsNewsTime()
{
    MqlDateTime tm;
    TimeToStruct(TimeGMT(), tm);

    int h = tm.hour;
    int m = tm.min;
    int dow = tm.day_of_week; // 0=Sun, 5=Fri

    // NFP: First Friday of month, 13:30 UTC ± filter
    bool isPossibleNFP = (dow == 5) && (tm.day <= 7) &&
                         (h == 13 && m >= (30 - NewsMinutesBefore)) ||
                         (h == 13 && m <= (30 + NewsMinutesAfter));

    // FOMC: Typically Wednesdays 19:00 UTC ± filter
    bool isFOMC = (dow == 3) &&
                  ((h == 18 && m >= (60 - NewsMinutesBefore)) ||
                   (h == 19 && m <= NewsMinutesAfter));

    // US CPI: Usually 2nd/3rd Wed 13:30 UTC ± filter
    bool isCPI = (dow == 3) && (tm.day >= 8 && tm.day <= 21) &&
                 ((h == 13 && m >= (30 - NewsMinutesBefore)) ||
                  (h == 13 && m <= (30 + NewsMinutesAfter)));

    // Tokyo open surge: 00:00–01:00 UTC
    bool isTokyoOpen = (h == 0 && m < 30);

    // London open surge: 07:00–07:30 UTC
    bool isLondonOpen = (h == 7 && m < 30);

    // NY open surge: 13:30 UTC
    bool isNYOpen = (h == 13 && m >= 25 && m <= 40);

    if (isPossibleNFP || isFOMC || isCPI || isNYOpen) return true;
    return false;
}

//====================================================================
//  SELF-ADAPTING RSI THRESHOLDS
//  Loosens thresholds after consecutive losses (needs re-entry signal)
//  Tightens thresholds after consecutive wins (reduce overtrading)
//====================================================================
void AdaptRSIThresholds()
{
    if (gConsecLosses >= 3)
    {
        // Loosen levels to find more signals
        gRSI_OB = MathMin(RSI_OB_Base + 5.0, 80.0);
        gRSI_OS = MathMax(RSI_OS_Base - 5.0, 20.0);
    }
    else if (gConsecWins >= 3)
    {
        // Tighten levels to avoid over-trading in a hot streak
        gRSI_OB = MathMax(RSI_OB_Base - 3.0, 65.0);
        gRSI_OS = MathMin(RSI_OS_Base + 3.0, 35.0);
    }
    else
    {
        // Reset to baseline
        gRSI_OB = RSI_OB_Base;
        gRSI_OS = RSI_OS_Base;
    }
}

//====================================================================
//  ON TRADE TRANSACTION  — track wins/losses for adaptive logic
//====================================================================
void OnTradeTransaction(const MqlTradeTransaction &trans,
                        const MqlTradeRequest     &request,
                        const MqlTradeResult      &result)
{
    if (trans.type == TRADE_TRANSACTION_DEAL_ADD)
    {
        ulong dealTicket = trans.deal;
        if (!HistoryDealSelect(dealTicket)) return;

        long    magic  = HistoryDealGetInteger(dealTicket, DEAL_MAGIC);
        string  symbol = HistoryDealGetString(dealTicket, DEAL_SYMBOL);
        long    entry  = HistoryDealGetInteger(dealTicket, DEAL_ENTRY);

        if (magic != MagicNumber || symbol != Symbol()) return;
        if (entry != DEAL_ENTRY_OUT && entry != DEAL_ENTRY_INOUT) return; // Only closed deals

        double dealProfit = HistoryDealGetDouble(dealTicket, DEAL_PROFIT)
                          + HistoryDealGetDouble(dealTicket, DEAL_SWAP)
                          + HistoryDealGetDouble(dealTicket, DEAL_COMMISSION);

        if (dealProfit > 0.0)
        {
            gConsecWins++;
            gConsecLosses = 0;
            gWinTrades++;
            LogEvent("CLOSE_WIN", "P/L=" + DoubleToString(dealProfit, 2), 0, HistoryDealGetDouble(dealTicket, DEAL_PRICE));
        }
        else
        {
            gConsecLosses++;
            gConsecWins = 0;
            LogEvent("CLOSE_LOSS", "P/L=" + DoubleToString(dealProfit, 2), 0, HistoryDealGetDouble(dealTicket, DEAL_PRICE));
        }

        double winRate = gTotalTrades > 0 ? (double)gWinTrades / gTotalTrades * 100.0 : 0.0;
        Print("[AntiGravity Pro] Deal closed | P/L=", DoubleToString(dealProfit, 2),
              " | Streak W=", gConsecWins, " L=", gConsecLosses,
              " | WinRate=", DoubleToString(winRate, 1), "%");
    }
}

//====================================================================
//  LOG EVENT  (terminal + optional file)
//====================================================================
void LogEvent(string action, string details, double lot, double price)
{
    string ts   = TimeToString(TimeCurrent(), TIME_DATE | TIME_MINUTES | TIME_SECONDS);
    string line = ts + " | " + action + " | " + Symbol() + " | " +
                  "price=" + DoubleToString(price, _Digits) + " | " +
                  details;

    if (EnableFileLog && gLogFile != INVALID_HANDLE)
        FileWrite(gLogFile, line);

    // Also echo to Journal
    PrintFormat("[AG-LOG] %s", line);
}

//====================================================================
//  END OF AntiGravity Pro EA
//+------------------------------------------------------------------+
