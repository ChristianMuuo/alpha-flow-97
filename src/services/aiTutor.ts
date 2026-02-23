import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const isApiKeyConfigured = API_KEY && API_KEY !== 'YOUR_API_KEY_HERE' && API_KEY.length > 10;
const genAI = isApiKeyConfigured ? new GoogleGenerativeAI(API_KEY) : null;

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
    // using gemini-1.5-flash for better speed/cost efficiency
    private model = genAI ? genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }) : null;
    private conversationHistory: ChatMessage[] = [];

    /**
     * Send a message to the AI tutor with book context
     */
    async sendMessage(
        message: string,
        bookContext?: BookContext
    ): Promise<string> {
        // Check if API key is configured
        if (!isApiKeyConfigured || !this.model) {
            throw new Error(
                'AI Tutor is not configured. Please add your Google Gemini API key to the .env file.\n\n' +
                '1. Get a free key at: https://aistudio.google.com/app/apikey\n' +
                '2. Add to .env: VITE_GEMINI_API_KEY="your_key_here"\n' +
                '3. Restart the dev server'
            );
        }

        try {
            // Build context-aware prompt
            let systemPrompt = `You are Athena, an expert AI tutor specializing in trading, forex, and financial markets. You help students understand complex trading concepts by providing clear, concise explanations.`;

            if (bookContext) {
                systemPrompt += `\n\nCurrent Context:
- Book: "${bookContext.bookTitle}"
- Page: ${bookContext.currentPage} of ${bookContext.totalPages}
- Category: ${bookContext.category}

The student is reading this book and may ask questions about the content on this page or related trading concepts.`;
            }

            // Build conversation history for context
            const conversationContext = this.conversationHistory
                .slice(-6) // Last 3 exchanges
                .map(msg => `${msg.role === 'user' ? 'Student' : 'Athena'}: ${msg.content}`)
                .join('\n\n');

            const fullPrompt = `${systemPrompt}

${conversationContext ? `Previous conversation:\n${conversationContext}\n\n` : ''}Student: ${message}

Athena:`;

            // Generate response
            const result = await this.model.generateContent(fullPrompt);
            const response = result.response;
            const text = response.text();

            // Store in conversation history
            this.conversationHistory.push({
                role: 'user',
                content: message,
                timestamp: Date.now()
            });
            this.conversationHistory.push({
                role: 'assistant',
                content: text,
                timestamp: Date.now()
            });

            // Keep only last 20 messages
            if (this.conversationHistory.length > 20) {
                this.conversationHistory = this.conversationHistory.slice(-20);
            }

            return text;
        } catch (error: any) {
            console.error('AI Tutor Error:', error);
            // Pass the actual error message upstream
            throw new Error(error.message || 'Failed to get response from AI tutor.');
        }
    }

    /**
     * Get conversation history
     */
    getHistory(): ChatMessage[] {
        return [...this.conversationHistory];
    }

    /**
     * Clear conversation history
     */
    clearHistory(): void {
        this.conversationHistory = [];
    }

    /**
     * Load conversation history from storage
     */
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

    /**
     * Save conversation history to storage
     */
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

// Export singleton instance
export const aiTutorService = new AITutorService();
