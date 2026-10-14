/**
 * AI Proxy Client - AlphaFlow S-Tier Architecture
 * 
 * Strict Principle: Zero LLM secrets in client code.
 * All generation and agent reasoning requests route through Supabase Edge Functions (`ai-proxy`).
 * Includes Zod schema verification, error boundaries, and auto-repair.
 */

import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export interface AgentInvokeOptions {
  agentName: string;
  prompt: string;
  systemInstruction?: string;
  model?: "gemini-1.5-flash" | "gemini-1.5-pro";
  temperature?: number;
  jsonMode?: boolean;
  maxOutputTokens?: number;
  metadata?: Record<string, unknown>;
  fallbackText?: string;
}

export interface AgentResponse {
  text: string;
  latencyMs: number;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  agentName: string;
  isFallback?: boolean;
}

/**
 * Invokes an AI agent through the secured Supabase Edge Gateway.
 */
export async function invokeAIAgent(options: AgentInvokeOptions): Promise<AgentResponse> {
  const startTime = Date.now();
  const {
    agentName,
    prompt,
    systemInstruction,
    model = "gemini-1.5-flash",
    temperature = 0.2,
    jsonMode = false,
    maxOutputTokens = 2048,
    metadata = {},
    fallbackText = "",
  } = options;

  try {
    // Dispatch to Supabase Edge Function 'ai-proxy'
    const { data, error } = await supabase.functions.invoke("ai-proxy", {
      body: {
        agentName,
        prompt,
        systemInstruction,
        model,
        temperature,
        jsonMode,
        maxOutputTokens,
        metadata,
      },
    });

    if (error || !data) {
      console.warn(`[AI Gateway] Edge Function returned error or is unprovisioned:`, error);
      return {
        text: fallbackText || `[SIMULATION FALLBACK] Agent ${agentName} executed with fallback parameters.`,
        latencyMs: Date.now() - startTime,
        model,
        agentName,
        isFallback: true,
      };
    }

    if (data.error) {
      console.warn(`[AI Gateway] Upstream error:`, data.error);
      return {
        text: fallbackText || data.error,
        latencyMs: data.latencyMs || (Date.now() - startTime),
        model,
        agentName,
        isFallback: true,
      };
    }

    return {
      text: data.text,
      latencyMs: data.latencyMs,
      usage: data.usage,
      model: data.model || model,
      agentName,
      isFallback: false,
    };
  } catch (err) {
    console.error(`[AI Gateway] Network or runtime exception:`, err);
    return {
      text: fallbackText || `[OFFLINE MODE] Unable to contact AI gateway. Check network connection.`,
      latencyMs: Date.now() - startTime,
      model,
      agentName,
      isFallback: true,
    };
  }
}

/**
 * Executes an agent expecting structured JSON, validated with Zod.
 * Implements 1-shot auto-repair if the initial output fails validation.
 */
export async function executeStructuredAgent<T>(
  schema: z.ZodSchema<T>,
  options: Omit<AgentInvokeOptions, "jsonMode">,
  fallbackValue: T
): Promise<{ data: T; isFallback: boolean; latencyMs: number }> {
  const primaryCall = await invokeAIAgent({
    ...options,
    jsonMode: true,
  });

  if (primaryCall.isFallback) {
    return { data: fallbackValue, isFallback: true, latencyMs: primaryCall.latencyMs };
  }

  // Attempt 1: Parse and validate JSON
  try {
    const rawJson = cleanJsonMarkdown(primaryCall.text);
    const parsed = JSON.parse(rawJson);
    const validated = schema.parse(parsed);
    return { data: validated, isFallback: false, latencyMs: primaryCall.latencyMs };
  } catch (parseError) {
    console.warn(`[AI Gateway] Structured output validation failed. Attempting 1-shot auto-repair...`, parseError);

    // Auto-repair step: Ask agent to fix its JSON formatting to strictly match schema
    const repairPrompt = `The previous response failed schema validation with error: ${parseError instanceof Error ? parseError.message : String(parseError)}.\n\nOriginal prompt: ${options.prompt}\n\nInvalid output received:\n${primaryCall.text}\n\nReformat and return strictly valid JSON matching the expected format with no markdown blocks or conversational text.`;

    try {
      const repairCall = await invokeAIAgent({
        ...options,
        prompt: repairPrompt,
        jsonMode: true,
        temperature: 0.0,
      });

      const cleanedRepair = cleanJsonMarkdown(repairCall.text);
      const repairedParsed = JSON.parse(cleanedRepair);
      const repairedValidated = schema.parse(repairedParsed);
      return {
        data: repairedValidated,
        isFallback: false,
        latencyMs: primaryCall.latencyMs + repairCall.latencyMs,
      };
    } catch (finalError) {
      console.error(`[AI Gateway] Auto-repair failed. Returning fallback value:`, finalError);
      return { data: fallbackValue, isFallback: true, latencyMs: primaryCall.latencyMs };
    }
  }
}

/**
 * Strips markdown code fences (```json ... ```) from model text.
 */
function cleanJsonMarkdown(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}
