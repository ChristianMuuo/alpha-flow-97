# Model Card: AlphaFlow Statistical Market Regime Classifier (`REGIME_HMM_V1`)

**Model Architecture:** Gaussian Mixture Model with Markov Regime Switching (GMM-HMM)  
**Version:** 1.0.0  
**Phase:** Stage 4 Machine Learning Pipeline & Statistical Feature Store  
**Runtime:** Python Offline Training (`ml/regime_model.py`) $\rightarrow$ Zero-Latency Edge/Client TypeScript Inference (`src/services/quant/statRegimeEngine.ts`)

---

## 1. Intended Use & Scope
- **Primary Domain:** Classify foreign exchange and financial asset price action into 4 empirical market regimes.
- **Decision Support:** Automatically throttles or scales risk multipliers (1.0x, 0.5x, 0.25x) and suggests compatible execution playbooks.
- **Target Assets:** FX Majors (EURUSD, GBPUSD, USDJPY), Metals (XAUUSD), and Crypto (BTCUSDT).

---

## 2. Market Regime States
| Regime ID | Title | Centroid Features (Trend, Vol, CVD) | Recommended Strategy | Risk Multiplier |
| :--- | :--- | :--- | :--- | :--- |
| `BULLISH_EXPANSION` | Bullish Institutional Expansion | `[+0.65, 0.42, +1.45]` | FVG Continuation, Order Block Mitigation | `1.0x` |
| `BEARISH_EXPANSION` | Bearish Institutional Expansion | `[-0.68, 0.48, -1.52]` | Breaker Block Flip, AMD Short | `1.0x` |
| `CONSOLIDATION_ACCUMULATION` | Range Liquidity Accumulation | `[+0.04, 0.22, +0.12]` | Asian Range Extreme Fade, Mean Reversion | `0.5x` |
| `VOLATILITY_NEWS_SHOCK` | Volatility News Shock / Whiplash | `[+0.15, 0.94, -0.28]` | Post-News Reversal, Capital Preservation | `0.25x` / Stand Down |

---

## 3. Transition Probability Matrix
Empirical Markov transition probabilities $P(S_t = j \mid S_{t-1} = i)$:
- `BULLISH_EXPANSION` $\rightarrow$ `BULLISH_EXPANSION`: **72%** persistence
- `BEARISH_EXPANSION` $\rightarrow$ `BEARISH_EXPANSION`: **70%** persistence
- `CONSOLIDATION` $\rightarrow$ `CONSOLIDATION`: **58%** persistence
- `VOLATILITY_NEWS_SHOCK` $\rightarrow$ `CONSOLIDATION`: **35%** decay probability

---

## 4. Input Features & Stationarity
1. **Trend Score:** Bounded between -1.0 and +1.0 via fast EMA (12/26) ratio and RSI (14) distance from equilibrium.
2. **Volatility Percentile:** Normalized Parkinson intraday high/low dispersion.
3. **Cumulative Volume Delta (CVD) Z-Score:** Rolling 14-period normalized orderbook aggressive delta.

---

## 5. Limitations & Caveats
- **News Spikes:** GMM inference operates on completed candle intervals (M15). Sudden sub-second flash crashes rely on immediate stop-loss circuit breakers in MT5 rather than model regime recalculation.
- **Stationarity:** Regime centroids should be retrained quarterly to account for structural macro shifts (e.g. central bank rate regimes).
