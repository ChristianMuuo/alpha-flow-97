import { z } from "zod";

// ============================================================================
// 1. RESEARCH & MARKET INTELLIGENCE AGENT
// ============================================================================
export const MacroCatalystSchema = z.object({
  title: z.string(),
  currency: z.string(),
  impact: z.enum(["HIGH", "MEDIUM", "LOW"]),
  time: z.string(),
  forecast: z.string(),
  previous: z.string(),
  sourceCitation: z.string(),
  conflictFlag: z.boolean().default(false),
});

export const ResearchIntelOutputSchema = z.object({
  symbol: z.string(),
  macroCatalysts: z.array(MacroCatalystSchema),
  overallMacroBias: z.enum(["BULLISH", "BEARISH", "NEUTRAL", "HIGH_VOLATILITY"]),
  quietPeriodActive: z.boolean(),
  bullCase: z.string(),
  bearCase: z.string(),
  invalidationTriggers: z.string(),
  riskDisclaimer: z.string(),
  sources: z.array(z.string()),
});

export type ResearchIntelOutput = z.infer<typeof ResearchIntelOutputSchema>;

// ============================================================================
// 2. QUANTITATIVE ANALYST AGENT
// ============================================================================
export const QuantAnalystOutputSchema = z.object({
  symbol: z.string(),
  marketRegime: z.enum([
    "TRENDING_BULLISH",
    "TRENDING_BEARISH",
    "MEAN_REVERTING_RANGE",
    "HIGH_VOLATILITY_EXPANSION",
  ]),
  confidencePct: z.number().min(0).max(100),
  adxStrength: z.number(),
  zScoreSpread: z.number(),
  cvdDivergence: z.string(),
  statisticalAssumptions: z.array(z.string()),
  invalidationLevel: z.number(),
  plainLanguageSummary: z.string(),
});

export type QuantAnalystOutput = z.infer<typeof QuantAnalystOutputSchema>;

// ============================================================================
// 3. STRATEGY & SIGNAL GENERATOR AGENT
// ============================================================================
export const StrategySignalOutputSchema = z.object({
  symbol: z.string(),
  direction: z.enum(["BUY", "SELL", "NEUTRAL"]),
  setupName: z.string(),
  entryZone: z.string(),
  entryPrice: z.number(),
  stopLoss: z.number(),
  takeProfit1: z.number(),
  takeProfit2: z.number(),
  riskRewardRatio: z.number(),
  confluenceFactors: z.array(z.string()),
  invalidationCondition: z.string(),
  recommendedTimeframe: z.string(),
});

export type StrategySignalOutput = z.infer<typeof StrategySignalOutputSchema>;

// ============================================================================
// 4. RISK MANAGER AGENT (INDEPENDENT VETO POWER)
// ============================================================================
export const RiskManagerOutputSchema = z.object({
  verdict: z.enum(["APPROVED", "VETOED", "DOWNSIZED"]),
  ruinProbabilityPct: z.number(),
  recommendedLotSize: z.number(),
  fractionalKellyExposure: z.number(),
  portfolioHeatScore: z.number(), // 0-100
  maxAllowedDrawdownPct: z.number(),
  vetoReason: z.string().nullable(),
  mandatoryGuardrails: z.array(z.string()),
});

export type RiskManagerOutput = z.infer<typeof RiskManagerOutputSchema>;

// ============================================================================
// 5. CRITIC & REVIEWER AGENT (ADVERSARIAL DEVIL'S ADVOCATE)
// ============================================================================
export const CriticReviewerOutputSchema = z.object({
  adversarialScore: z.number().min(0).max(100),
  identifiedTraps: z.array(z.string()),
  macroLandmines: z.array(z.string()),
  overfittingFlags: z.array(z.string()),
  counterThesis: z.string(),
  mandatedAdjustments: z.string(),
});

export type CriticReviewerOutput = z.infer<typeof CriticReviewerOutputSchema>;

// ============================================================================
// 6. JOURNAL & BEHAVIORAL COACH AGENT
// ============================================================================
export const JournalCoachOutputSchema = z.object({
  psychologicalState: z.enum([
    "DISCIPLINED",
    "TILT_WARNING",
    "REVENGE_TRADING",
    "OVERCONFIDENT",
    "HESITANT",
  ]),
  tiltScore: z.number().min(0).max(100),
  identifiedLeaks: z.array(z.string()),
  strengthsObserved: z.array(z.string()),
  actionableProtocol: z.string(),
  coolingOffRecommended: z.boolean(),
  winRateTrend: z.string(),
});

export type JournalCoachOutput = z.infer<typeof JournalCoachOutputSchema>;

// ============================================================================
// 7. EMBEDDED UI COPILOT AGENT
// ============================================================================
export const UICopilotOutputSchema = z.object({
  explanation: z.string(),
  citedBooks: z.array(
    z.object({
      title: z.string(),
      page: z.number().optional(),
      relevance: z.string(),
    })
  ),
  suggestedDrillDownActions: z.array(z.string()),
  keyFormulaOrRule: z.string().nullable(),
});

export type UICopilotOutput = z.infer<typeof UICopilotOutputSchema>;

// ============================================================================
// 8. MONITOR & ALERT AGENT
// ============================================================================
export const MonitorAlertOutputSchema = z.object({
  symbol: z.string(),
  isTriggered: z.boolean(),
  alertPriority: z.enum(["HIGH", "MEDIUM", "LOW"]),
  catalystExplanation: z.string(),
  suggestedAction: z.string(),
  deduplicationKey: z.string(),
});

export type MonitorAlertOutput = z.infer<typeof MonitorAlertOutputSchema>;

// ============================================================================
// 9. OPS & DRIFT SENTINEL
// ============================================================================
export const OpsSentinelOutputSchema = z.object({
  systemHealthScore: z.number().min(0).max(100),
  p95LatencyMs: z.number(),
  tokenBudgetConsumptionPct: z.number(),
  activeAgentStatus: z.record(z.enum(["HEALTHY", "DEGRADED", "PAUSED"])),
  securityGuardrailIncidents: z.number(),
  recommendedAction: z.string(),
});

export type OpsSentinelOutput = z.infer<typeof OpsSentinelOutputSchema>;
