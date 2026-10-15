"""
AlphaFlow S-Tier - GARCH(1,1) Volatility & Dynamic Drawdown Forecaster
Phase 4: ML Pipelines & Feature Store

Model:
sigma_t^2 = omega + alpha * epsilon_{t-1}^2 + beta * sigma_{t-1}^2

Provides:
1. GARCH 1-step ahead conditional volatility forecast.
2. Parametric Value-at-Risk (VaR 95% & 99%).
3. Volatility-scaled Fractional Kelly Sizing multiplier.
"""

import math
from typing import List, Dict, Any, Tuple


class GARCHVolatilityModel:
    def __init__(
        self,
        omega: float = 0.000004,  # Baseline long-run variance weight
        alpha: float = 0.095,     # Shock reaction coefficient (ARCH)
        beta: float = 0.890       # Persistence coefficient (GARCH)
    ):
        self.omega = omega
        self.alpha = alpha
        self.beta = beta
        assert (alpha + beta) < 1.0, "GARCH(1,1) parameters must satisfy stationarity: alpha + beta < 1"
        self.unconditional_variance = omega / (1.0 - alpha - beta)

    def forecast_conditional_volatility(
        self,
        returns: List[float],
        annualize_periods: int = 35040 # M15 periods per year
    ) -> Dict[str, float]:
        """
        Runs recursive GARCH filter over returns series to calculate current conditional variance.
        """
        if not returns:
            return {
                "annualized_vol": 0.018,
                "period_vol": 0.0001,
                "var_95_pct": 0.00016,
                "var_99_pct": 0.00023,
                "kelly_scale": 1.0,
            }

        # Initialize with sample variance
        mean_ret = sum(returns) / len(returns)
        init_var = sum((r - mean_ret) ** 2 for r in returns) / max(1, len(returns) - 1)
        sigma2 = max(1e-8, init_var)

        for r in returns:
            eps2 = (r - mean_ret) ** 2
            sigma2 = self.omega + self.alpha * eps2 + self.beta * sigma2

        period_vol = math.sqrt(sigma2)
        annualized_vol = period_vol * math.sqrt(annualize_periods)

        # Parametric VaR (Gaussian assumption on standardized residuals)
        # 95% Z = 1.645, 99% Z = 2.326
        var_95 = 1.645 * period_vol
        var_99 = 2.326 * period_vol

        # Target annual volatility for prop account = 15% (0.15)
        # Volatility scaling multiplier for Fractional Kelly
        target_vol = 0.15
        vol_ratio = target_vol / max(0.05, annualized_vol)
        # Clamp multiplier between 0.3x and 1.5x
        kelly_scale = round(max(0.3, min(1.5, vol_ratio)), 3)

        return {
            "annualized_vol": round(annualized_vol, 4),
            "period_vol": round(period_vol, 6),
            "var_95_pct": round(var_95 * 100, 3),
            "var_99_pct": round(var_99 * 100, 3),
            "kelly_scale": kelly_scale,
        }

    def export_weights(self) -> Dict[str, Any]:
        return {
            "model_name": "AlphaFlow-GARCH11-v1",
            "version": "1.0.0",
            "omega": self.omega,
            "alpha": self.alpha,
            "beta": self.beta,
            "unconditional_variance": round(self.unconditional_variance, 8),
            "target_volatility": 0.15,
        }
