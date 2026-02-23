import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, User, Sparkles, Brain, Lightbulb, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { aiTutorService, BookContext } from "@/services/aiTutor";
import { useToast } from "@/hooks/use-toast";

interface AITutorSidebarProps {
    bookTitle?: string;
    bookId?: string;
    currentPage?: number;
    totalPages?: number;
    category?: string;
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    text: string;
    type?: 'default' | 'summary' | 'concept';
}

export const AITutorSidebar = ({
    bookTitle,
    bookId,
    currentPage = 1,
    totalPages = 1,
    category = "Trading"
}: AITutorSidebarProps) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            text: `Hello! I'm Athena, your AI tutor. I'm reading "${bookTitle || 'this book'}" with you. Ask me anything about trading concepts, or request a summary of what you're reading!`
        }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    // Load conversation history on mount
    useEffect(() => {
        if (bookId) {
            aiTutorService.loadHistory(bookId);
            const history = aiTutorService.getHistory();
            if (history.length > 0) {
                setMessages([
                    messages[0], // Keep welcome message
                    ...history.map(msg => ({
                        id: msg.timestamp.toString(),
                        role: msg.role,
                        text: msg.content
                    }))
                ]);
            }
        }
    }, [bookId]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: inputValue
        };
        setMessages(prev => [...prev, newMessage]);
        setInputValue("");
        setIsLoading(true);

        try {
            // Build book context
            const context: BookContext = {
                bookTitle: bookTitle || 'Unknown Book',
                currentPage,
                totalPages,
                category
            };

            // Get AI response
            const response = await aiTutorService.sendMessage(inputValue, context);

            const responseMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                text: response
            };

            setMessages(prev => [...prev, responseMessage]);

            // Save conversation history
            if (bookId) {
                aiTutorService.saveHistory(bookId);
            }
        } catch (error: any) {
            const errorMessage = error.message || "Failed to get AI response";

            // Check if it's an API key error
            const isApiKeyError = errorMessage.includes('API key') || errorMessage.includes('not configured');

            toast({
                title: isApiKeyError ? "Setup Required" : "Error",
                description: isApiKeyError
                    ? "AI Tutor needs to be configured. Check the chat for instructions."
                    : errorMessage,
                variant: "destructive"
            });

            // Add helpful setup message for API key errors
            if (isApiKeyError) {
                setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    text: `🔑 **AI Tutor Setup Required**

To use the AI tutor, you need to add a Google Gemini API key:

**Step 1:** Get a free API key
Visit: https://aistudio.google.com/app/apikey

**Step 2:** Add to your .env file
\`\`\`
VITE_GEMINI_API_KEY="your_actual_key_here"
\`\`\`

**Step 3:** Restart the dev server
Stop the current server and run \`npm run dev\` again.

The API is free with generous limits (60 requests/minute)!`
                }]);
            } else {
                // Add fallback message for other errors
                setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    text: `I apologize, but I'm having trouble connecting right now.

**Error Details:** ${errorMessage}

Please try again in a moment.`
                }]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestion = (type: string) => {
        let text = "";
        if (type === 'summary') text = `Can you summarize the key concepts on page ${currentPage}?`;
        if (type === 'quiz') text = "Quiz me on what I've read so far.";

        setInputValue(text);
    };

    const clearHistory = () => {
        if (bookId) {
            aiTutorService.clearHistory();
            aiTutorService.saveHistory(bookId);
        }
        setMessages([messages[0]]); // Keep only welcome message
        toast({
            title: "History Cleared",
            description: "Conversation history has been reset."
        });
    };

    return (
        <div className="flex flex-col h-full bg-[#0c0c0c] text-gray-200">
            {/* Header */}
            <div className="p-4 border-b border-[#2a2a2a] flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-white">Athena AI</h3>
                        <p className="text-[10px] text-emerald-500 font-mono uppercase tracking-wider">Page {currentPage} of {totalPages}</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearHistory}
                    className="h-8 w-8 p-0 hover:bg-red-500/20 hover:text-red-400"
                    title="Clear conversation history"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            {/* Chat Area */}
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${msg.role === 'user' ? 'bg-gray-700' : 'bg-emerald-900/50'}`}>
                                {msg.role === 'user' ? <User className="w-3 h-3" /> : <Brain className="w-3 h-3 text-emerald-400" />}
                            </div>
                            <div className={`rounded-xl p-3 text-sm max-w-[85%] ${msg.role === 'user' ? 'bg-[#2a2a2a]' : 'bg-emerald-950/30 border border-emerald-500/20'}`}>
                                <p className="leading-relaxed">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-emerald-900/50 flex items-center justify-center flex-shrink-0 mt-1">
                                <Brain className="w-3 h-3 text-emerald-400" />
                            </div>
                            <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-3">
                                <div className="flex gap-1">
                                    <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t border-[#2a2a2a] space-y-3">
                {/* Suggestions */}
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    <Button variant="outline" size="sm" className="bg-transparent border-[#333] hover:bg-[#222] text-xs h-7 whitespace-nowrap" onClick={() => handleSuggestion('summary')}>
                        <Lightbulb className="w-3 h-3 mr-1 text-yellow-500" />
                        Summarize
                    </Button>
                    <Button variant="outline" size="sm" className="bg-transparent border-[#333] hover:bg-[#222] text-xs h-7 whitespace-nowrap" onClick={() => handleSuggestion('quiz')}>
                        <Brain className="w-3 h-3 mr-1 text-purple-500" />
                        Quiz Me
                    </Button>
                </div>

                <div className="relative">
                    <Input
                        placeholder="Ask Athena about this page..."
                        className="bg-[#1a1a1a] border-[#333] pr-10 focus-visible:ring-emerald-500/50"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <Button
                        size="icon"
                        className="absolute right-1 top-1 h-8 w-8 bg-emerald-600 hover:bg-emerald-500 text-white"
                        onClick={handleSend}
                    >
                        <Send className="w-3 h-3" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
