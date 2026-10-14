/**
 * AI Tutor Service - Athena
 * 
 * Powered by Supabase Edge Function AI Gateway (`ai-proxy`).
 * Zero client-side API secrets. Real-time institutional trading mentor.
 */

import { invokeAIAgent } from "./aiProxyClient";

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface BookContext {
  bookTitle: string;
  currentPage: number;
  totalPages: number;
  category: string;
}

class AITutorService {
  private conversationHistory: ChatMessage[] = [];

  /**
   * Send a message to the AI tutor with book context
   */
  async sendMessage(
    message: string,
    bookContext?: BookContext
  ): Promise<string> {
    try {
      // Build context-aware prompt
      let systemPrompt = `You are Athena, an expert AI tutor specializing in trading, forex, and financial markets. You help students understand complex trading concepts by providing clear, concise explanations with strict risk management discipline.`;

      if (bookContext) {
        systemPrompt += `\n\nCurrent Context:
- Book: "${bookContext.bookTitle}"
- Page: ${bookContext.currentPage} of ${bookContext.totalPages}
- Category: ${bookContext.category}

The student is reading this book and may ask questions about the content on this page or related trading concepts.`;
      }

      // Build conversation history for context
      const conversationContext = this.conversationHistory
        .slice(-6)
        .map(msg => `${msg.role === 'user' ? 'Student' : 'Athena'}: ${msg.content}`)
        .join('\n\n');

      const fullPrompt = `${conversationContext ? `Previous conversation:\n${conversationContext}\n\n` : ''}Student: ${message}\n\nAthena:`;

      // Smart Institutional Knowledge Fallback
      const q = message.toLowerCase();
      let fallbackText = "";

      if (q.includes("rule") || q.includes("checklist") || q.includes("plan")) {
        fallbackText = `📋 **Institutional Setup Checklist for "${bookContext?.bookTitle || 'Trading'}"**\n\n` +
          `1. **Higher Timeframe Bias (4H/1H):** Confirm order flow direction before looking at lower timeframe execution.\n` +
          `2. **Liquidity Sweep Trigger:** Ensure buy-side or sell-side retail liquidity has been tapped (e.g. Asian session high/low).\n` +
          `3. **Displacement & CHoCH:** Wait for strong candle bodies breaking structural swing points, leaving an unfilled Fair Value Gap (FVG).\n` +
          `4. **Mitigation Entry:** Place limit order at 50% consequent encroachment of the FVG box or the breaker block retest.\n` +
          `5. **Strict Invalidation:** Stop Loss must be placed beyond the sweep wick. Minimum target Risk-to-Reward: **1:3.0**.`;
      } else if (q.includes("liquidity") || q.includes("sweep") || q.includes("hunt")) {
        fallbackText = `🌊 **Institutional Liquidity Dynamics**\n\n` +
          `Smart money cannot fill multi-million dollar orders without retail counterparties. They intentionally push price into obvious retail support/resistance levels (double tops, equal highs) to activate buy-stops and sell-stops.\n\n` +
          `**Key Rule:** Never trade the breakout of equal highs or lows. Trade the *rejection* after the liquidity pool has been raided and market structure shifts.`;
      } else if (q.includes("fvg") || q.includes("imbalance") || q.includes("fair value")) {
        fallbackText = `📦 **Fair Value Gap (FVG) Mitigation Mechanics**\n\n` +
          `An FVG is a 3-candle sequence where Candle 1's high and Candle 3's low do not overlap, leaving a void of one-sided volume created by aggressive institutional displacement.\n\n` +
          `Price acts as a magnet back to the **50% Consequent Encroachment (C.E.)** of this void. Wait for price to tap this zone on the 5M chart before looking for confirmation.`;
      } else if (q.includes("risk") || q.includes("management") || q.includes("psychology")) {
        fallbackText = `🛡️ **Elite Prop Firm Risk Protocol**\n\n` +
          `• **Maximum Risk Per Trade:** 0.5% - 1.0% of total balance.\n` +
          `• **Daily Stop Out:** Halt trading for the day after 2 consecutive stop-outs (-2%).\n` +
          `• **Asymmetric R:R:** Target minimum 1:3 setups so a 40% win rate yields high monthly compounding.\n` +
          `• **Emotion Control:** If you feel revenge or eagerness, step away for at least 1 market session.`;
      } else {
        fallbackText = `💡 **Athena Institutional Analysis for "${bookContext?.bookTitle || 'Trading'}"**\n\n` +
          `In institutional trading, market structure and liquidity drive every directional expansion. Focus on three critical elements:\n\n` +
          `1. **Where is liquidity resting?** (Previous daily highs/lows, session extremes)\n` +
          `2. **Who is trapped?** (Early breakout traders)\n` +
          `3. **Where is the institutional footprint?** (Order blocks and imbalances)\n\n` +
          `Align these three factors before risking capital. Would you like me to generate a 5-question quiz or practice this setup on the chart simulator?`;
      }

      // Execute via server-side Edge Gateway
      const agentRes = await invokeAIAgent({
        agentName: "athena-tutor",
        prompt: fullPrompt,
        systemInstruction: systemPrompt,
        model: "gemini-1.5-flash",
        temperature: 0.3,
        fallbackText,
        metadata: {
          bookTitle: bookContext?.bookTitle,
          page: bookContext?.currentPage,
        },
      });

      const responseText = agentRes.text;

      // Store in conversation history
      this.conversationHistory.push({
        role: 'user',
        content: message,
        timestamp: Date.now()
      });
      this.conversationHistory.push({
        role: 'assistant',
        content: responseText,
        timestamp: Date.now()
      });

      // Keep only last 20 messages
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20);
      }

      return responseText;
    } catch (error) {
      console.warn('AI Tutor fallback trigger on error:', error);
      return `Athena knowledge base active. Keep risk per trade under 1.0% and follow structural order flow.`;
    }
  }

  getHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }

  loadHistory(bookId: string): void {
    try {
      const stored = localStorage.getItem(`ai-tutor-history-${bookId}`);
      if (stored) {
        this.conversationHistory = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load conversation history:', error);
    }
  }

  saveHistory(bookId: string): void {
    try {
      localStorage.setItem(
        `ai-tutor-history-${bookId}`,
        JSON.stringify(this.conversationHistory)
      );
    } catch (error) {
      console.error('Failed to save conversation history:', error);
    }
  }
}

export const aiTutorService = new AITutorService();
