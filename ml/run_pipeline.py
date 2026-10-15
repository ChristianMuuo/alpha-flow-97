"""
AlphaFlow S-Tier - Master Machine Learning Training & Export Pipeline
Phase 4: ML Pipelines & Feature Store

Orchestrates:
1. Feature Store extraction & Automated Lookahead Leakage Test.
2. Market Regime Model execution & weight export.
3. Calibrated Directional Model execution & SHAP attribution.
4. GARCH(1,1) Volatility forecasting & VaR export.
5. Writes weights to `src/services/quant/models/` for TypeScript Edge inference.
"""

import os
import json
import math
import random
from features import Candle, FeatureStore
from regime_model import MarketRegimeModel
from directional_model import CalibratedDirectionalModel
from garch_volatility import GARCHVolatilityModel


def generate_synthetic_candles(n: int = 200, start_price: float = 1.0850) -> list[Candle]:
    """Generates synthetic intraday M15 candles with realistic geometric Brownian motion and CVD delta."""
    random.seed(42)
    candles = []
    price = start_price
    base_ts = 1728900000000  # Unix timestamp ms

    for i in range(n):
        ts = base_ts + i * 15 * 60 * 1000
        # Drift + shock
        ret = random.gauss(0.00002, 0.0008)
        new_price = max(0.5, price * math.exp(ret))
        high = max(price, new_price) + abs(random.gauss(0.0, 0.0003))
        low = min(price, new_price) - abs(random.gauss(0.0, 0.0003))
        vol = max(100.0, random.gauss(1500.0, 400.0))
        delta = (new_price - price) * vol * 500.0 + random.gauss(0.0, 50.0)

        candles.append(Candle(
            timestamp=ts,
            open=price,
            high=high,
            low=low,
            close=new_price,
            volume=vol,
            delta=delta
        ))
        price = new_price

    return candles


def main():
    print("=" * 70)
    print("AlphaFlow S-Tier - Phase 4 Machine Learning Pipeline & Feature Store")
    print("=" * 70)

    # 1. Generate & Ingest Candles
    print("[1/5] Ingesting candle dataset (200 M15 intervals)...")
    candles = generate_synthetic_candles(200, start_price=1.0850)
    print(f"      Candles loaded: {len(candles)} | Start: {candles[0].close:.5f} | End: {candles[-1].close:.5f}")

    # 2. Point-in-Time Feature Store & Lookahead Leakage Test
    print("[2/5] Extracting Point-in-Time Features & running Lookahead Leakage Check...")
    FeatureStore.test_no_lookahead_leakage(candles, eval_index=100)
    features = FeatureStore.extract_point_in_time_features(candles)
    print("      Leakage Test: PASSED (Zero future lookahead contamination)")
    print(f"      Realized Vol: {features['realized_vol']:.4f} | Parkinson Vol: {features['parkinson_vol']:.4f}")
    print(f"      EMA 12/26: {features['ema_ratio_12_26']:.5f} | CVD Z-Score: {features['cvd_zscore']:.2f}")

    # 3. Market Regime Model (GMM / Markov Switching)
    print("[3/5] Evaluating Statistical Market Regime Model...")
    regime_model = MarketRegimeModel()
    dominant_regime, prob = regime_model.predict_dominant_regime(features)
    all_probs = regime_model.predict_regime_probabilities(features)
    print(f"      Dominant State: {dominant_regime} ({prob * 100:.1f}% posterior probability)")
    print(f"      State Distribution: {all_probs}")

    # 4. Calibrated Directional Model & SHAP Feature Attributions
    print("[4/5] Evaluating Calibrated Directional Model with Isotonic Regression...")
    dir_model = CalibratedDirectionalModel()
    raw_prob, calib_prob = dir_model.predict_calibrated_probability(features)
    shap_factors = dir_model.compute_shap_explanations(features)
    print(f"      Raw Probability: {raw_prob:.4f} -> Calibrated Win Rate: {calib_prob * 100:.1f}%")
    print(f"      Brier Score OOS Benchmark: {dir_model.export_weights()['brier_score_oos']}")
    print("      Top SHAP Feature Drivers:")
    for f in shap_factors[:3]:
        print(f"        • {f['label']}: {f['explanation']}")

    # 5. GARCH(1,1) Volatility Forecaster
    print("[5/5] Running GARCH(1,1) Conditional Variance & VaR Filter...")
    closes = [c.close for c in candles]
    returns = FeatureStore.compute_log_returns(closes)
    garch_model = GARCHVolatilityModel()
    garch_metrics = garch_model.forecast_conditional_volatility(returns)
    print(f"      Annualized GARCH Vol: {garch_metrics['annualized_vol'] * 100:.2f}%")
    print(f"      Parametric VaR 95%: {garch_metrics['var_95_pct']}% | VaR 99%: {garch_metrics['var_99_pct']}%")
    print(f"      Kelly Fraction Scaling Multiplier: {garch_metrics['kelly_scale']}x")

    # 6. Export Weights to TypeScript Services Directory
    output_dir = os.path.join(os.path.dirname(__file__), "..", "src", "services", "quant", "models")
    os.makedirs(output_dir, exist_ok=True)

    regime_file = os.path.join(output_dir, "regime_weights.json")
    with open(regime_file, "w", encoding="utf-8") as f:
        json.dump(regime_model.export_weights(), f, indent=2)

    directional_file = os.path.join(output_dir, "directional_weights.json")
    with open(directional_file, "w", encoding="utf-8") as f:
        json.dump(dir_model.export_weights(), f, indent=2)

    garch_file = os.path.join(output_dir, "garch_weights.json")
    with open(garch_file, "w", encoding="utf-8") as f:
        json.dump(garch_model.export_weights(), f, indent=2)

    print("=" * 70)
    print(f"SUCCESS: Model weights exported to {output_dir}")
    print("Files created:")
    print(f"  • {regime_file}")
    print(f"  • {directional_file}")
    print(f"  • {garch_file}")
    print("=" * 70)


if __name__ == "__main__":
    main()
