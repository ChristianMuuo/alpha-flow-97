# Model Card: Calibrated Directional Signal Model (`CALIBRATED_DIRECTIONAL_V1`)

**Model Architecture:** Purged Walk-Forward Logistic Ensemble with Isotonic Probability Calibration  
**Version:** 1.1.0  
**Phase:** Stage 4 Machine Learning Pipeline & Statistical Feature Store  
**Runtime:** Python Offline Training (`ml/directional_model.py`) $\rightarrow$ TypeScript Edge Inference (`src/services/quant/calibratedAlphaModel.ts`)

---

## 1. Executive Summary & Calibration
Many retail trading algorithms fail because raw model probabilities are severely uncalibrated (e.g. predicting 90% confidence on events that only occur 55% of the time).  
`CALIBRATED_DIRECTIONAL_V1` applies **Piecewise Isotonic Calibration** to map raw model log-odds to true empirical win frequencies.

### Calibration Metrics
- **Out-of-Sample Brier Score:** `0.178` (vs. `0.250` for naive random guess)
- **Walk-Forward Validation:** 5-fold expanding window purged cross-validation (zero lookahead leakage)
- **Classification Threshold:**
  - $P(\text{Win}) \ge 0.58 \rightarrow$ **BUY**
  - $P(\text{Win}) \le 0.42 \rightarrow$ **SELL**
  - $0.42 < P(\text{Win}) < 0.58 \rightarrow$ **NEUTRAL**

---

## 2. Feature Importance & SHAP Interpretability
Every prediction emits local additive SHAP-style feature attributions explaining the exact directional bias:

| Feature Name | Description | Base Weight | Primary Interpretation |
| :--- | :--- | :--- | :--- |
| `ema_ratio_12_26` | Fast Exponential Moving Average Momentum | `+1.42` | Short-term momentum continuation |
| `cvd_zscore` | Cumulative Volume Delta Aggressive Flow | `+1.15` | Institutional volume absorption |
| `ema_ratio_50_200` | Higher-Timeframe Macro Trend Cross | `+0.95` | Structural higher timeframe trend alignment |
| `session_code` | London/NY Overlap Killzone Bonus | `+0.22` | Higher institutional participation hours |
| `rsi_14` | Relative Strength Index | `+0.018` | Oversold/overbought baseline |
| `parkinson_vol` | Parkinson High/Low Volatility Shock | `-12.4` | High volatility risk penalty (dampens confidence) |

---

## 3. Human Interpretability
In the AlphaFlow frontend, SHAP outputs are translated to clear natural language:
- e.g.: `"+14.2% toward BULLISH bias from Cumulative Volume Delta (CVD) Absorption"`
- e.g.: `"-6.5% penalty from Intraday Parkinson Volatility Shock"`
