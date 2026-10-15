"""
AlphaFlow S-Tier - Statistical Market Regime Model (GMM / Markov Switching)
Phase 4: ML Pipelines & Feature Store

Defines 4 Institutional Market States:
0: BULLISH_EXPANSION (High trend, positive CVD, moderate volatility)
1: BEARISH_EXPANSION (High negative trend, negative CVD, moderate volatility)
2: CONSOLIDATION_ACCUMULATION (Low trend, neutral CVD, low volatility)
3: VOLATILITY_NEWS_SHOCK (Extreme Parkinson/realized volatility, erratic delta)

Exports mathematical cluster centroids, covariance diagonals, and transition matrix
for lightweight, zero-latency inference in TypeScript Edge and browser clients.
"""

import math
import json
from typing import List, Dict, Any, Tuple


class MarketRegimeModel:
    REGIMES = [
        "BULLISH_EXPANSION",
        "BEARISH_EXPANSION",
        "CONSOLIDATION_ACCUMULATION",
        "VOLATILITY_NEWS_SHOCK",
    ]

    def __init__(self):
        # 4 Regime Centroids in normalized feature space:
        # Features: [trend_score (-1 to +1), volatility_percentile (0 to 1), cvd_zscore (-3 to +3)]
        self.centroids = {
            "BULLISH_EXPANSION": [0.65, 0.42, 1.45],
            "BEARISH_EXPANSION": [-0.68, 0.48, -1.52],
            "CONSOLIDATION_ACCUMULATION": [0.04, 0.22, 0.12],
            "VOLATILITY_NEWS_SHOCK": [0.15, 0.94, -0.28],
        }

        # Diagonal variances per regime feature
        self.variances = {
            "BULLISH_EXPANSION": [0.08, 0.04, 0.35],
            "BEARISH_EXPANSION": [0.08, 0.04, 0.35],
            "CONSOLIDATION_ACCUMULATION": [0.03, 0.02, 0.18],
            "VOLATILITY_NEWS_SHOCK": [0.25, 0.08, 1.20],
        }

        # Prior probabilities
        self.priors = {
            "BULLISH_EXPANSION": 0.28,
            "BEARISH_EXPANSION": 0.26,
            "CONSOLIDATION_ACCUMULATION": 0.36,
            "VOLATILITY_NEWS_SHOCK": 0.10,
        }

        # Markov Transition Matrix: P(State_t = j | State_{t-1} = i)
        self.transition_matrix = {
            "BULLISH_EXPANSION": {
                "BULLISH_EXPANSION": 0.72,
                "BEARISH_EXPANSION": 0.06,
                "CONSOLIDATION_ACCUMULATION": 0.17,
                "VOLATILITY_NEWS_SHOCK": 0.05,
            },
            "BEARISH_EXPANSION": {
                "BULLISH_EXPANSION": 0.07,
                "BEARISH_EXPANSION": 0.70,
                "CONSOLIDATION_ACCUMULATION": 0.18,
                "VOLATILITY_NEWS_SHOCK": 0.05,
            },
            "CONSOLIDATION_ACCUMULATION": {
                "BULLISH_EXPANSION": 0.20,
                "BEARISH_EXPANSION": 0.19,
                "CONSOLIDATION_ACCUMULATION": 0.58,
                "VOLATILITY_NEWS_SHOCK": 0.03,
            },
            "VOLATILITY_NEWS_SHOCK": {
                "BULLISH_EXPANSION": 0.25,
                "BEARISH_EXPANSION": 0.25,
                "CONSOLIDATION_ACCUMULATION": 0.35,
                "VOLATILITY_NEWS_SHOCK": 0.15,
            },
        }

    def _gaussian_density(self, x: List[float], mean: List[float], var: List[float]) -> float:
        """Computes multivariate Gaussian density with diagonal covariance."""
        log_prob = 0.0
        for i in range(len(x)):
            diff = x[i] - mean[i]
            v = max(1e-5, var[i])
            log_prob += -0.5 * (math.log(2.0 * math.pi * v) + (diff * diff) / v)
        return math.exp(max(-50.0, log_prob))

    def predict_regime_probabilities(
        self,
        features: Dict[str, float],
        previous_regime: str = "CONSOLIDATION_ACCUMULATION"
    ) -> Dict[str, float]:
        """
        Calculates posterior probability for each regime using Bayes rule and Markov transition priors.
        """
        # Map raw feature store outputs to standardized feature space:
        # trend_score: derived from EMA ratio & RSI
        ema_ratio = features.get("ema_ratio_12_26", 1.0)
        rsi = features.get("rsi_14", 50.0)
        trend_score = max(-1.0, min(1.0, (ema_ratio - 1.0) * 80.0 + (rsi - 50.0) / 50.0))

        # volatility_percentile: based on Parkinson vol relative to typical FX vol (0.012 to 0.035)
        parkinson_vol = features.get("parkinson_vol", 0.018)
        vol_pct = max(0.0, min(1.0, (parkinson_vol - 0.008) / (0.040 - 0.008)))

        # cvd_zscore
        cvd_z = max(-3.0, min(3.0, features.get("cvd_zscore", 0.0)))

        x = [trend_score, vol_pct, cvd_z]

        # Prior given previous state from transition matrix
        trans_priors = self.transition_matrix.get(previous_regime, self.priors)

        likelihoods = {}
        for regime in self.REGIMES:
            dens = self._gaussian_density(x, self.centroids[regime], self.variances[regime])
            prior = trans_priors.get(regime, 0.25)
            likelihoods[regime] = dens * prior

        total = sum(likelihoods.values())
        if total <= 0:
            return {r: 0.25 for r in self.REGIMES}

        return {r: round(likelihoods[r] / total, 4) for r in self.REGIMES}

    def predict_dominant_regime(
        self,
        features: Dict[str, float],
        previous_regime: str = "CONSOLIDATION_ACCUMULATION"
    ) -> Tuple[str, float]:
        probs = self.predict_regime_probabilities(features, previous_regime)
        dominant = max(probs.items(), key=lambda kv: kv[1])
        return dominant[0], dominant[1]

    def export_weights(self) -> Dict[str, Any]:
        """Exports weights dictionary serializable to JSON."""
        return {
            "model_name": "AlphaFlow-Regime-GMM-v1",
            "version": "1.0.0",
            "regimes": self.REGIMES,
            "centroids": self.centroids,
            "variances": self.variances,
            "priors": self.priors,
            "transition_matrix": self.transition_matrix,
        }
