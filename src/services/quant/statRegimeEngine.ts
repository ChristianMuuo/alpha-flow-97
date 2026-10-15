/**
 * AlphaFlow S-Tier - Statistical Market Regime Engine
 * Phase 4: Machine Learning & Feature Store
 * 
 * Implements client-side / edge inference for the Gaussian Mixture & Markov
 * Switching Regime Model trained in `ml/regime_model.py`.
 * 
 * Replaces naive hour-based heuristics with empirical posterior distributions.
 */

import regimeWeights from "./models/regime_weights.json";

export type StatisticalRegimeType =
  | "BULLISH_EXPANSION"
  | "BEARISH_EXPANSION"
  | "CONSOLIDATION_ACCUMULATION"
  | "VOLATILITY_NEWS_SHOCK";

export interface RegimeInferenceResult {
  dominantRegime: StatisticalRegimeType;
  confidencePct: number;
  posteriorDistribution: Record<StatisticalRegimeType, number>;
  transitionProbabilities: Record<StatisticalRegimeType, number>;
  volatilityIndex: number; // 0 - 100
  trendStrength: number;   // 0 - 100
  recommendedAction: string;
}

export class StatisticalRegimeEngine {
  private weights = regimeWeights;
  private currentRegime: StatisticalRegimeType = "CONSOLIDATION_ACCUMULATION";

  private gaussianDensity(x: number[], mean: number[], varDiag: number[]): number {
    let logProb = 0.0;
    for (let i = 0; i < x.length; i++) {
      const diff = x[i] - mean[i];
      const v = Math.max(1e-5, varDiag[i]);
      logProb += -0.5 * (Math.log(2.0 * Math.PI * v) + (diff * diff) / v);
    }
    return Math.exp(Math.max(-50.0, logProb));
  }

  /**
   * Infer current market regime from live price, volatility, and volume delta telemetry.
   */
  public inferRegime(inputs: {
    emaRatio12_26?: number;
    rsi14?: number;
    parkinsonVol?: number;
    cvdZScore?: number;
  }): RegimeInferenceResult {
    const emaRatio = inputs.emaRatio12_26 ?? 1.0;
    const rsi = inputs.rsi14 ?? 50.0;
    const trendScore = Math.max(-1.0, Math.min(1.0, (emaRatio - 1.0) * 80.0 + (rsi - 50.0) / 50.0));

    const parkinsonVol = inputs.parkinsonVol ?? 0.018;
    const volPct = Math.max(0.0, Math.min(1.0, (parkinsonVol - 0.008) / (0.040 - 0.008)));
    const cvdZ = Math.max(-3.0, Math.min(3.0, inputs.cvdZScore ?? 0.0));

    const x = [trendScore, volPct, cvdZ];

    const transitionPriors = (this.weights.transition_matrix as any)[this.currentRegime] || this.weights.priors;

    const likelihoods: Record<string, number> = {};
    const regimes = this.weights.regimes as StatisticalRegimeType[];

    for (const r of regimes) {
      const mean = (this.weights.centroids as any)[r];
      const variance = (this.weights.variances as any)[r];
      const dens = this.gaussianDensity(x, mean, variance);
      const prior = transitionPriors[r] ?? 0.25;
      likelihoods[r] = dens * prior;
    }

    const total = Object.values(likelihoods).reduce((a, b) => a + b, 0);
    const posteriors: Record<StatisticalRegimeType, number> = {
      BULLISH_EXPANSION: 0.25,
      BEARISH_EXPANSION: 0.25,
      CONSOLIDATION_ACCUMULATION: 0.25,
      VOLATILITY_NEWS_SHOCK: 0.25,
    };

    if (total > 0) {
      for (const r of regimes) {
        posteriors[r] = Number((likelihoods[r] / total).toFixed(4));
      }
    }

    // Determine dominant regime
    let maxProb = -1;
    let dominant: StatisticalRegimeType = "CONSOLIDATION_ACCUMULATION";
    for (const r of regimes) {
      if (posteriors[r] > maxProb) {
        maxProb = posteriors[r];
        dominant = r;
      }
    }

    this.currentRegime = dominant;

    const actions: Record<StatisticalRegimeType, string> = {
      BULLISH_EXPANSION: "Follow 15M Bullish Fair Value Gaps. Target Buy-Side Liquidity with 1.0x risk.",
      BEARISH_EXPANSION: "Sell rallies into Premium Order Blocks. Target Sell-Side Liquidity with 1.0x risk.",
      CONSOLIDATION_ACCUMULATION: "Fade session high/low liquidity sweeps only. Reduce risk to 0.5x.",
      VOLATILITY_NEWS_SHOCK: "High spread shock risk. Stand down or reduce position risk to 0.25x.",
    };

    return {
      dominantRegime: dominant,
      confidencePct: Math.round(maxProb * 100),
      posteriorDistribution: posteriors,
      transitionProbabilities: transitionPriors,
      volatilityIndex: Math.round(volPct * 100),
      trendStrength: Math.round(Math.abs(trendScore) * 100),
      recommendedAction: actions[dominant],
    };
  }
}

export const statRegimeEngine = new StatisticalRegimeEngine();
