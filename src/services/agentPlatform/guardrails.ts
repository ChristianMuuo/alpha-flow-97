/**
 * AlphaFlow S-Tier Agent Platform - Guardrails & Safety Sentinel
 * 
 * Rules:
 * 1. Prompt Injection Defenses: Filters external inputs, news feeds, and user prompts for injection vectors.
 * 2. Financial Compliance: Strict rejection or redaction of guaranteed return claims ("100% profit", "risk-free").
 * 3. Mandatory Risk Notices: Enforces persistent "Not Financial Advice" and paper trading disclaimers.
 * 4. Human-in-the-Loop Gatekeeper: Flags any write/execute tool action for manual user sign-off.
 * 5. Kill Switch Verification: Ensures disabled agents are blocked immediately.
 */

import { AGENT_REGISTRY_CONFIG } from "./agentConfig";
import { ToolPermissionLevel } from "./toolRegistry";

export interface InputSanitizationResult {
  isSafe: boolean;
  sanitizedText: string;
  violationReason?: string;
}

export interface OutputComplianceResult {
  isCompliant: boolean;
  compliantText: string;
  violationsDetected: string[];
}

export const MANDATORY_FINANCIAL_DISCLAIMER = `\n\n> ⚠️ **Institutional Risk Notice:** All signals, analyses, and agent outputs are for educational and simulation purposes only. Not financial advice. Past performance does not guarantee future results. Default mode: Paper Simulation.`;

// Known prompt injection and jailbreak signatures
const INJECTION_PATTERNS: Array<{ pattern: RegExp; reason: string }> = [
  { pattern: /ignore\s+(all\s+)?(previous|prior)\s+instructions/i, reason: "Instruction override attempt" },
  { pattern: /disregard\s+(all\s+)?(previous|prior)\s+instructions/i, reason: "Instruction override attempt" },
  { pattern: /system\s+prompt\s+override/i, reason: "System override trigger" },
  { pattern: /reveal\s+(your\s+)?system\s+prompt/i, reason: "System extraction attempt" },
  { pattern: /you\s+are\s+now\s+(in\s+developer\s+mode|unfiltered|dan)/i, reason: "Persona jailbreak pattern" },
  { pattern: /<script[\s\S]*?>[\s\S]*?<\/script>/i, reason: "Cross-site scripting payload" },
  { pattern: /javascript:/i, reason: "URI injection payload" },
];

// Disallowed financial claims (regulatory compliance)
const FINANCIAL_GUARANTEE_PATTERNS: Array<{ pattern: RegExp; warning: string }> = [
  { pattern: /(100%|guaranteed)\s+(profit|returns|win rate|gains)/i, warning: "Claim of guaranteed returns" },
  { pattern: /risk-free\s+(trade|investment|system|strategy)/i, warning: "Claim of risk-free trading" },
  { pattern: /can('t|not)\s+lose/i, warning: "Claim of zero downside" },
  { pattern: /sure\s+win/i, warning: "Claim of certainty in markets" },
];

export class GuardrailSentinel {
  /**
   * Sanitizes and verifies user or external input.
   */
  public sanitizeInput(rawText: string): InputSanitizationResult {
    if (!rawText || typeof rawText !== "string") {
      return { isSafe: true, sanitizedText: "" };
    }

    const trimmed = rawText.trim();

    // Check injection signatures
    for (const item of INJECTION_PATTERNS) {
      if (item.pattern.test(trimmed)) {
        return {
          isSafe: false,
          sanitizedText: "[REDACTED - SECURITY VIOLATION]",
          violationReason: item.reason,
        };
      }
    }

    // Strip control characters while preserving newlines and standard punctuation
    const sanitized = trimmed.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

    return {
      isSafe: true,
      sanitizedText: sanitized,
    };
  }

  /**
   * Validates agent outputs against financial regulations.
   * Redacts false claims and appends risk disclaimer.
   */
  public validateCompliance(agentOutputText: string): OutputComplianceResult {
    let compliantText = agentOutputText;
    const violationsDetected: string[] = [];

    for (const item of FINANCIAL_GUARANTEE_PATTERNS) {
      if (item.pattern.test(compliantText)) {
        violationsDetected.push(item.warning);
        compliantText = compliantText.replace(item.pattern, "[High-Probability Probabilistic Setup]");
      }
    }

    // Ensure compliance disclaimer is present
    if (!compliantText.includes("Not financial advice") && !compliantText.includes("Institutional Risk Notice")) {
      compliantText += MANDATORY_FINANCIAL_DISCLAIMER;
    }

    return {
      isCompliant: violationsDetected.length === 0,
      compliantText,
      violationsDetected,
    };
  }

  /**
   * Validates whether an agent is allowed to execute (Kill Switch Check).
   */
  public isAgentActive(agentId: string): boolean {
    const manifest = AGENT_REGISTRY_CONFIG[agentId];
    if (!manifest) return false;
    return manifest.enabled;
  }

  /**
   * Determines if a tool action requires human-in-the-loop approval.
   */
  public requiresHumanApproval(permission: ToolPermissionLevel): boolean {
    return permission === "execute" || permission === "write";
  }
}

export const guardrailSentinel = new GuardrailSentinel();
