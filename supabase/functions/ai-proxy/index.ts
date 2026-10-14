import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface AIProxyRequest {
  agentName: string;
  model?: string;
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  jsonMode?: boolean;
  maxOutputTokens?: number;
  metadata?: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || Deno.env.get("VITE_GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({
          error: "API Key not configured in server environment. Please set GEMINI_API_KEY secret.",
          fallback: true,
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || Deno.env.get("VITE_SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    let userId: string | null = null;
    let supabaseClient = null;

    if (supabaseUrl && authHeader) {
      supabaseClient = createClient(supabaseUrl, authHeader.replace("Bearer ", ""));
      const { data: { user } } = await supabaseClient.auth.getUser();
      userId = user?.id || null;
    }

    const body: AIProxyRequest = await req.json();
    const {
      agentName = "general-quant",
      model = "gemini-1.5-flash",
      prompt,
      systemInstruction,
      temperature = 0.2,
      jsonMode = false,
      maxOutputTokens = 2048,
      metadata = {},
    } = body;

    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing or invalid prompt string." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Guardrail: Simple Prompt Injection Screening
    const lowerPrompt = prompt.toLowerCase();
    const injectionPatterns = [
      "ignore all previous instructions",
      "disregard previous instructions",
      "reveal system prompt",
      "system override",
      "you are now unfiltered"
    ];
    for (const pattern of injectionPatterns) {
      if (lowerPrompt.includes(pattern)) {
        return new Response(
          JSON.stringify({
            error: "Prompt rejected by safety guardrail.",
            reason: `Potential prompt injection pattern detected: '${pattern}'`,
            blocked: true,
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Build Gemini REST API payload
    const geminiPayload: Record<string, unknown> = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: Math.max(0, Math.min(temperature, 1.0)),
        maxOutputTokens,
        ...(jsonMode ? { responseMimeType: "application/json" } : {}),
      },
    };

    if (systemInstruction) {
      geminiPayload.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

    const geminiRes = await fetch(geminiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiPayload),
    });

    const latencyMs = Date.now() - startTime;

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error(`Gemini API error [${geminiRes.status}]:`, errText);

      return new Response(
        JSON.stringify({
          error: `Upstream AI provider error: ${geminiRes.statusText}`,
          details: errText,
          latencyMs,
        }),
        { status: geminiRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiData = await geminiRes.json();
    const candidate = geminiData.candidates?.[0];
    const textOutput = candidate?.content?.parts?.[0]?.text || "";
    const promptTokens = geminiData.usageMetadata?.promptTokenCount || Math.ceil(prompt.length / 4);
    const completionTokens = geminiData.usageMetadata?.candidatesTokenCount || Math.ceil(textOutput.length / 4);
    const totalTokens = promptTokens + completionTokens;

    // Log run to agent_runs table asynchronously if service client or user client available
    if (supabaseUrl && (supabaseServiceKey || supabaseClient)) {
      try {
        const loggerClient = supabaseServiceKey
          ? createClient(supabaseUrl, supabaseServiceKey)
          : supabaseClient;

        if (loggerClient) {
          await loggerClient.from("agent_runs").insert({
            user_id: userId,
            agent_name: agentName,
            model,
            prompt_preview: prompt.substring(0, 180),
            input_payload: { promptLength: prompt.length, metadata },
            output_payload: { textPreview: textOutput.substring(0, 180), jsonMode },
            status: "completed",
            latency_ms: latencyMs,
            prompt_tokens: promptTokens,
            completion_tokens: completionTokens,
            total_tokens: totalTokens,
            cost_estimate: Number(((promptTokens * 0.075 + completionTokens * 0.3) / 1000000).toFixed(6)), // approx Gemini 1.5 Flash rates
          });
        }
      } catch (logErr) {
        console.warn("Failed to log agent run:", logErr);
      }
    }

    return new Response(
      JSON.stringify({
        text: textOutput,
        latencyMs,
        usage: {
          promptTokens,
          completionTokens,
          totalTokens,
        },
        model,
        agentName,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("AI Proxy uncaught error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error in AI Proxy.",
        latencyMs: Date.now() - startTime,
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
