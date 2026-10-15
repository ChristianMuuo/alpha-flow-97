/**
 * AlphaFlow S-Tier - Calibrated Directional Signal Model & SHAP Interpreter
 * Phase 4: Machine Learning & Feature Store
 * 
 * Implements client / edge inference for the walk-forward calibrated directional model
 * trained in `ml/directional_model.py`.
 */

import directionalWeights from "./models/directional_weights.json";

export interface ShapFactor {
  feature: string;
  label: string;
  value: number;
  impactPct: number;
  direction: "BULLISH" | "BEARISH";
  explanation: string;
}

export interface DirectionalInferenceResult {
  symbol: string;
  rawProbability: number;
  calibratedWinProbability: number;
  brierScoreBenchmark: number;
  signalDirection: "BUY" | "SELL" | "NEUTRAL";
  shapAttributions: ShapFactor[];
  topBullishCatalyst: string;
  topBearishCatalyst: string;
}

export class CalibratedAlphaModel {
  private weights = directionalWeights;

  private normalize(featureName: string, value: number): number {
    const scaling = (this.weights.scaling as any)[featureName] || [0.0, 1.0];
    const [mean, std] = scaling;
    return (value - mean) / Math.max(1e-6, std);
  }

  private applyIsotonicCalibration(rawProb: number): number {
    const knots = this.weights.calibration_knots as [number, number][];
    if (rawProb <= knots[0][0]) return knots[0][1];
    if (rawProb >= knots[knots.length - 1][0]) return knots[knots.length - 1][1];

    for (let i = 0; i < knots.length - 1; i++) {
      const [x0, y0] = knots[i];
      const [x1, y1] = knots[i + 1];
      if (rawProb >= x0 && rawProb <= x1) {
        const t = (rawProb - x0) / (x1 - x0);
        return y0 + t * (y1 - y0);
      }
    }
    return rawProb;
  }

  public predictDirectionalAlpha(
    symbol = "EURUSD",
    inputs: {
      emaRatio12_26?: number;
      emaRatio50_200?: number;
      rsi14?: number;
      cvdZScore?: number;
      parkinsonVol?: number;
      sessionCode?: number;
    } = {}
  ): DirectionalInferenceResult {
    const features: Record<string, number> = {
      ema_ratio_12_26: inputs.emaRatio12_26 ?? 1.0004,
      ema_ratio_50_200: inputs.emaRatio50_200 ?? 1.0008,
      rsi_14: inputs.rsi14 ?? 54.0,
      cvd_zscore: inputs.cvdZScore ?? 1.25,
      parkinson_vol: inputs.parkinsonVol ?? 0.016,
      session_code: inputs.sessionCode ?? 2.0,
    };

    let logit = this.weights.intercept;
    const shapFactors: ShapFactor[] = [];

    const labelMap: Record<string, string> = {
      ema_ratio_12_26: "Fast EMA (12/26) Momentum",
      ema_ratio_50_200: "Macro Structure (50/200) Trend",
      rsi_14: "RSI Oscillatory Equilibrium",
      cvd_zscore: "Cumulative Volume Delta (CVD) Absorption",
      parkinson_vol: "Intraday Parkinson Volatility Shock",
      session_code: "London/NY Overlap Killzone Bonus",
    };

    for (const [fName, weight] of Object.entries(this.weights.weights)) {
      const val = features[fName] ?? 0.0;
      const normVal = this.normalize(fName, val);
      const contribution = (weight as number) * normVal;
      logit += contribution;

      const pctImpact = Number((contribution * 8.5).toFixed(2));
      const direction: "BULLISH" | "BEARISH" = pctImpact >= 0 ? "BULLISH" : "BEARISH";

      shapFactors.push({
        feature: fName,
        label: labelMap[fName] || fName,
        value: Number(val.toFixed(5)),
        impactPct: pctImpact,
        direction,
        explanation: `${pctImpact > 0 ? "+" : ""}${pctImpact}% toward ${direction} bias`,
      });
    }

    // Sort SHAP by absolute impact descending
    shapFactors.sort((a, b) => Math.abs(b.impactPct) - Math.abs(a.impactPct));

    const rawProb = 1.0 / (1.0 + Math.exp(-Math.max(-15.0, Math.min(15.0, logit))));
    const calibratedProb = this.applyIsotonicCalibration(rawProb);

    let signalDirection: "BUY" | "SELL" | "NEUTRAL" = "NEUTRAL";
    if (calibratedProb >= 0.58) signalDirection = "BUY";
    else if (calibratedProb <= 0.42) signalDirection = "SELL";

    const topBull = shapFactors.find((f) => f.direction === "BULLISH");
    const topBear = shapFactors.find((f) => f.direction === "BEARISH");

    return {
      symbol,
      rawProbability: Number(rawProb.toFixed(4)),
      calibratedWinProbability: Number((calibratedProb * 100).toFixed(1)),
      brierScoreBenchmark: this.weights.brier_score_oos,
      signalDirection,
      shapAttributions: shapFactors,
      topBullishCatalyst: topBull ? `${topBull.label} (${topBull.explanation})` : "Neutral",
      topBearishCatalyst: topBear ? `${topBear.label} (${topBear.explanation})` : "Neutral",
    };
  }
}

export const calibratedAlphaModel = new CalibratedAlphaModel();
