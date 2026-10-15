/**
 * AlphaFlow S-Tier - GARCH(1,1) Volatility & Risk Sizing Engine
 * Phase 4: Machine Learning & Feature Store
 * 
 * Implements client / edge inference for the GARCH(1,1) recursive volatility model
 * trained in `ml/garch_volatility.py`.
 */

import garchWeights from "./models/garch_weights.json";

export interface GarchForecastResult {
  annualizedVolatilityPct: number;
  periodVariance: number;
  var95Pct: number;
  var99Pct: number;
  volatilityScaledKellyMultiplier: number;
  isVolatilitySpike: boolean;
  recommendation: string;
}

export class GarchForecaster {
  private weights = garchWeights;

  public forecastVolatility(returns: number[] = []): GarchForecastResult {
    const defaultReturns = [
      0.0004, -0.0002, 0.0007, -0.0005, 0.0003, -0.0001, 0.0008, -0.0003,
      0.0002, 0.0005, -0.0006, 0.0009, -0.0004, 0.0001, -0.0002, 0.0003,
    ];

    const rets = returns.length > 5 ? returns : defaultReturns;

    const meanRet = rets.reduce((a, b) => a + b, 0) / rets.length;
    const sampleVar =
      rets.reduce((acc, r) => acc + Math.pow(r - meanRet, 2), 0) /
      Math.max(1, rets.length - 1);

    let sigma2 = Math.max(1e-8, sampleVar);

    for (const r of rets) {
      const eps2 = Math.pow(r - meanRet, 2);
      sigma2 = this.weights.omega + this.weights.alpha * eps2 + this.weights.beta * sigma2;
    }

    const periodVol = Math.sqrt(sigma2);
    const annualizedVol = periodVol * Math.sqrt(35040); // M15 periods per year

    const var95 = 1.645 * periodVol * 100;
    const var99 = 2.326 * periodVol * 100;

    const targetVol = this.weights.target_volatility;
    const volRatio = targetVol / Math.max(0.05, annualizedVol);
    const kellyScale = Number(Math.max(0.3, Math.min(1.5, volRatio)).toFixed(3));
    const isSpike = annualizedVol > targetVol * 1.5;

    let recommendation = "Normal market volatility. Standard 1/3 Fractional Kelly sizing engaged.";
    if (isSpike) {
      recommendation = `High volatility regime (${(annualizedVol * 100).toFixed(1)}% vs target 15%). Position sizing scaled down to ${kellyScale}x.`;
    } else if (kellyScale > 1.2) {
      recommendation = `Low quiet volatility (${(annualizedVol * 100).toFixed(1)}%). Sizing scaled to ${kellyScale}x optimal risk.`;
    }

    return {
      annualizedVolatilityPct: Number((annualizedVol * 100).toFixed(2)),
      periodVariance: Number(sigma2.toFixed(8)),
      var95Pct: Number(var95.toFixed(3)),
      var99Pct: Number(var99.toFixed(3)),
      volatilityScaledKellyMultiplier: kellyScale,
      isVolatilitySpike: isSpike,
      recommendation,
    };
  }
}

export const garchForecaster = new GarchForecaster();
