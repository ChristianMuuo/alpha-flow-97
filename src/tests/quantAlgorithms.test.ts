import { describe, it, expect } from "vitest";
import { monteCarloEngine } from "@/services/quant/monteCarloEngine";
import { statRegimeEngine } from "@/services/quant/statRegimeEngine";
import { calibratedAlphaModel } from "@/services/quant/calibratedAlphaModel";
import { garchForecaster } from "@/services/quant/garchForecaster";

describe("Quantitative Algorithms & Financial Math Test Suite", () => {
  describe("Monte Carlo Stochastic Simulation Engine", () => {
    it("should compute valid ruin probability, pass probability, and VaR bounds", () => {
      const results = monteCarloEngine.runSimulation({
        startingBalance: 100000,
        profitTarget: 10000,
        dailyDrawdownLimit: 5000,
        maxTrailingDrawdown: 10000,
        winRate: 0.58,
        avgWinR: 2.0,
        avgLossR: 1.0,
        riskPerTradePct: 0.01,
        tradesPerSimulation: 30,
        numSimulations: 1000,
      });

      expect(results.passProbability).toBeGreaterThanOrEqual(0);
      expect(results.passProbability).toBeLessThanOrEqual(100);
      expect(results.ruinProbability).toBeGreaterThanOrEqual(0);
      expect(results.ruinProbability).toBeLessThanOrEqual(100);

      // Tail risk: Conditional VaR (Expected Shortfall) must be >= Value at Risk (95%)
      expect(results.conditionalVaR95).toBeGreaterThanOrEqual(results.valueAtRisk95);

      // Full Kelly calculation: 0.58 - (0.42 / 2.0) = 0.58 - 0.21 = 0.37 (37%)
      expect(results.fullKellyFraction).toBeCloseTo(37.0, 0);
      expect(results.halfKellyFraction).toBeCloseTo(18.5, 0);
    });

    it("should correctly adapt via the simulate() interface used by Agent Tool Registry", () => {
      const sim = monteCarloEngine.simulate({
        initialBalance: 100000,
        winRatePct: 60,
        riskRewardRatio: 2.5,
        riskPerTradePct: 1,
        simulationsCount: 500,
        tradesPerSim: 25,
      });

      expect(sim.pathsEvaluated).toBe(500);
      expect(typeof sim.ruinProbability).toBe("number");
      expect(typeof sim.medianReturnPct).toBe("number");
      expect(typeof sim.optimalKellyFraction).toBe("number");
      expect(sim.optimalKellyFraction).toBeGreaterThan(0);
    });

    it("should signal higher ruin probability when win rate drops and risk per trade spikes", () => {
      const safeSim = monteCarloEngine.runSimulation({
        startingBalance: 100000,
        winRate: 0.65,
        avgWinR: 2.0,
        riskPerTradePct: 0.005,
        numSimulations: 500,
        tradesPerSimulation: 30,
      });

      const recklessSim = monteCarloEngine.runSimulation({
        startingBalance: 100000,
        winRate: 0.30,
        avgWinR: 1.0,
        riskPerTradePct: 0.08, // Reckless 8% risk per trade
        numSimulations: 500,
        tradesPerSimulation: 30,
      });

      expect(recklessSim.ruinProbability).toBeGreaterThan(safeSim.ruinProbability);
      expect(recklessSim.expectedMaxDrawdownPct).toBeGreaterThan(safeSim.expectedMaxDrawdownPct);
    });
  });

  describe("Statistical Regime Inference Engine (Gaussian Mixture Model)", () => {
    it("should infer dominant regime and valid posterior distribution", () => {
      const inference = statRegimeEngine.inferRegime({
        emaRatio12_26: 1.002,
        rsi14: 62,
        parkinsonVol: 0.015,
        cvdZScore: 1.4,
      });

      expect(["BULLISH_EXPANSION", "BEARISH_EXPANSION", "CONSOLIDATION_ACCUMULATION", "VOLATILITY_NEWS_SHOCK"]).toContain(
        inference.dominantRegime
      );

      expect(inference.confidencePct).toBeGreaterThanOrEqual(0);
      expect(inference.confidencePct).toBeLessThanOrEqual(100);

      // Verify posterior distribution sums to ~1.0
      const posteriors = inference.posteriorDistribution;
      const sum =
        posteriors.BULLISH_EXPANSION +
        posteriors.BEARISH_EXPANSION +
        posteriors.CONSOLIDATION_ACCUMULATION +
        posteriors.VOLATILITY_NEWS_SHOCK;
      expect(sum).toBeCloseTo(1.0, 1);
      expect(inference.recommendedAction).toBeDefined();
      expect(inference.recommendedAction.length).toBeGreaterThan(10);
    });

    it("should detect bearish expansion on strongly negative trend inputs", () => {
      const bearish = statRegimeEngine.inferRegime({
        emaRatio12_26: 0.985,
        rsi14: 28,
        parkinsonVol: 0.022,
        cvdZScore: -2.5,
      });

      expect(bearish.dominantRegime).toBe("BEARISH_EXPANSION");
      expect(bearish.posteriorDistribution.BEARISH_EXPANSION).toBeGreaterThan(
        bearish.posteriorDistribution.BULLISH_EXPANSION
      );
    });
  });

  describe("Calibrated Directional Signal Model & SHAP Interpreter", () => {
    it("should produce isotonic-calibrated win probabilities and SHAP factor attributions", () => {
      const alpha = calibratedAlphaModel.predictDirectionalAlpha("EURUSD", {
        emaRatio12_26: 1.0015,
        emaRatio50_200: 1.004,
        rsi14: 58,
        realizedVol10: 0.012,
        parkinsonVol: 0.011,
        returnMomentum5: 0.003,
        cvdZScore: 1.8,
        sessionNyOverlap: 1,
      });

      expect(alpha.symbol).toBe("EURUSD");
      expect(alpha.calibratedWinProbability).toBeGreaterThanOrEqual(0);
      expect(alpha.calibratedWinProbability).toBeLessThanOrEqual(100);
      expect(["BUY", "SELL", "NEUTRAL"]).toContain(alpha.signalDirection);

      // Verify SHAP factors are populated with explanations
      expect(alpha.shapAttributions.length).toBeGreaterThan(0);
      for (const factor of alpha.shapAttributions) {
        expect(factor.feature).toBeDefined();
        expect(["BULLISH", "BEARISH"]).toContain(factor.direction);
        expect(typeof factor.impactPct).toBe("number");
        expect(factor.explanation.length).toBeGreaterThan(5);
      }
    });
  });

  describe("GARCH(1,1) Volatility & Risk-Scaling Engine", () => {
    it("should calculate annualized volatility and monotonic Value-at-Risk", () => {
      const forecast = garchForecaster.forecastVolatility([
        0.001, -0.0008, 0.0012, -0.0005, 0.0007, -0.0004, 0.0015, -0.0002, 0.0006,
      ]);

      expect(forecast.annualizedVolatilityPct).toBeGreaterThan(0);
      expect(forecast.var95Pct).toBeGreaterThan(0);
      expect(forecast.var99Pct).toBeGreaterThan(forecast.var95Pct); // 99% VaR must exceed 95% VaR
      expect(forecast.volatilityScaledKellyMultiplier).toBeGreaterThanOrEqual(0.3);
      expect(forecast.volatilityScaledKellyMultiplier).toBeLessThanOrEqual(1.5);
      expect(forecast.recommendation).toBeDefined();
    });
  });
});
