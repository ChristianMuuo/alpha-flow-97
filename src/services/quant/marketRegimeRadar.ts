/**
 * Market Regime Radar & Macro Confluence Clustering Engine
 * Classifies market conditions into 4 distinct quantitative regimes
 * and maps them to institutional playbook strategies and risk parameters.
 */

export type MarketRegimeType =
  | "BULLISH_EXPANSION"
  | "BEARISH_EXPANSION"
  | "CONSOLIDATION_ACCUMULATION"
  | "VOLATILITY_NEWS_SHOCK";

export interface MarketRegimeInfo {
  id: MarketRegimeType;
  title: string;
  badgeColor: string;
  badgeBorder: string;
  textColor: string;
  volatilityIndex: number; // 0 - 100
  trendStrength: number; // 0 - 100
  recommendedStrategies: string[];
  riskGuidance: string;
  riskMultiplier: number; // e.g. 1.0 (normal), 0.5 (half risk), 0.25 (quarter risk)
  killzoneStatus: string;
  keyRule: string;
}

const REGIMES: Record<MarketRegimeType, MarketRegimeInfo> = {
  BULLISH_EXPANSION: {
    id: "BULLISH_EXPANSION",
    title: "Bullish Institutional Expansion",
    badgeColor: "bg-emerald-500/15",
    badgeBorder: "border-emerald-500/30",
    textColor: "text-emerald-400",
    volatilityIndex: 42,
    trendStrength: 86,
    recommendedStrategies: ["Silver Bullet 15M", "Bullish FVG Continuation", "Order Block Mitigation"],
    riskGuidance: "Standard Risk (1.0% - 1.5%). High trend continuation probability.",
    riskMultiplier: 1.0,
    killzoneStatus: "Optimal Draw on Liquidity toward Buy-Side Liquidity (BSL)",
    keyRule: "Do not counter-trend short without confirmed HTF Market Structure Shift (MSS)."
  },
  BEARISH_EXPANSION: {
    id: "BEARISH_EXPANSION",
    title: "Bearish Institutional Expansion",
    badgeColor: "bg-red-500/15",
    badgeBorder: "border-red-500/30",
    textColor: "text-red-400",
    volatilityIndex: 48,
    trendStrength: 88,
    recommendedStrategies: ["Bearish Breaker Block Flip", "AMD Liquidity Run (Short)", "Discount FVG Target"],
    riskGuidance: "Standard Risk (1.0% - 1.5%). Sell rallies into Premium FVGs.",
    riskMultiplier: 1.0,
    killzoneStatus: "Targeting Sell-Side Liquidity (SSL) & Equal Lows",
    keyRule: "Look for displacement candles breaking internal swing lows before shorting."
  },
  CONSOLIDATION_ACCUMULATION: {
    id: "CONSOLIDATION_ACCUMULATION",
    title: "Consolidation & Liquidity Building",
    badgeColor: "bg-amber-500/15",
    badgeBorder: "border-amber-500/30",
    textColor: "text-amber-400",
    volatilityIndex: 22,
    trendStrength: 24,
    recommendedStrategies: ["Asian Range High/Low Sweep", "Mean Reversion Range Extremes", "Patience / Stand Down"],
    riskGuidance: "Conservative Risk (0.50%). Avoid breakout trades inside the range.",
    riskMultiplier: 0.5,
    killzoneStatus: "Trapped Volume / Liquidity Pooling on both sides",
    keyRule: "Trade only fakeout sweeps of the range extremes. Do not chase internal candles."
  },
  VOLATILITY_NEWS_SHOCK: {
    id: "VOLATILITY_NEWS_SHOCK",
    title: "High Volatility News Shock / Whip-saw",
    badgeColor: "bg-purple-500/15",
    badgeBorder: "border-purple-500/30",
    textColor: "text-purple-400",
    volatilityIndex: 94,
    trendStrength: 52,
    recommendedStrategies: ["Post-News Liquidity Sweep Reversal", "Capital Preservation (No Trade)"],
    riskGuidance: "Ultra-Conservative Risk (0.25%) or Stand Down. Spread expansion hazard.",
    riskMultiplier: 0.25,
    killzoneStatus: "Red Folder News Event Impact Zone",
    keyRule: "Allow 15 minutes post-release for spreads to normalize before entering any limit orders."
  }
};

import { statRegimeEngine } from "./statRegimeEngine";

export const marketRegimeRadar = {
  detectCurrentRegime(
    utcHour: number = new Date().getUTCHours(),
    telemetry?: {
      emaRatio12_26?: number;
      rsi14?: number;
      parkinsonVol?: number;
      cvdZScore?: number;
    }
  ): MarketRegimeInfo {
    // Stage 4 Upgrade: Evaluate empirical Gaussian Mixture & Markov transition state
    const inference = statRegimeEngine.inferRegime(telemetry || {
      emaRatio12_26: utcHour >= 12 && utcHour <= 16 ? 1.0025 : 0.9992,
      rsi14: utcHour >= 12 ? 58.0 : 47.0,
      parkinsonVol: utcHour >= 18 ? 0.038 : 0.016,
      cvdZScore: utcHour >= 12 && utcHour <= 16 ? 1.4 : -0.2,
    });

    const base = REGIMES[inference.dominantRegime] || REGIMES.CONSOLIDATION_ACCUMULATION;
    return {
      ...base,
      volatilityIndex: inference.volatilityIndex,
      trendStrength: inference.trendStrength,
      riskGuidance: `${base.riskGuidance} (ML Confidence: ${inference.confidencePct}%)`,
    };
  },

  getAllRegimes(): MarketRegimeInfo[] {
    return Object.values(REGIMES);
  }
};
