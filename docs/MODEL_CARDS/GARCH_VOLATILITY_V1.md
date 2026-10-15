# Model Card: GARCH(1,1) Volatility & Dynamic Risk Model (`GARCH_VOLATILITY_V1`)

**Model Architecture:** Generalized Autoregressive Conditional Heteroskedasticity (GARCH 1,1)  
**Version:** 1.0.0  
**Phase:** Stage 4 Machine Learning Pipeline & Statistical Feature Store  
**Runtime:** Python Training (`ml/garch_volatility.py`) $\rightarrow$ TypeScript Inference (`src/services/quant/garchForecaster.ts`)

---

## 1. Specification & Mathematical Formulation
$$\sigma_t^2 = \omega + \alpha \epsilon_{t-1}^2 + \beta \sigma_{t-1}^2$$

- **$\omega$ (Omega):** `0.000004` (Baseline long-run variance floor)
- **$\alpha$ (Alpha - ARCH reaction):** `0.095` (Immediate sensitivity to recent shocks)
- **$\beta$ (Beta - GARCH persistence):** `0.890` (Volatility memory & clustering persistence)
- **Stationarity Condition:** $\alpha + \beta = 0.985 < 1.0$ (Strictly stationary)

---

## 2. Risk Metrics Provided
1. **Conditional Volatility Forecast:** Annualized percentage volatility for the upcoming trade horizon.
2. **Parametric Value-at-Risk (VaR):**
   - **VaR 95%:** 1-period maximum expected loss at 95% confidence ($1.645 \cdot \sigma_t$)
   - **VaR 99%:** 1-period tail risk at 99% confidence ($2.326 \cdot \sigma_t$)
3. **Volatility-Scaled Kelly Multiplier:**
   $$M_{\text{Kelly}} = \max\left(0.3, \min\left(1.5, \frac{\sigma_{\text{target}}}{\sigma_{\text{GARCH}}}\right)\right)$$
   Where $\sigma_{\text{target}} = 15\%$ annual volatility for prop firm accounts. Automatically scales down lot sizes when market enters high-variance clusters.
