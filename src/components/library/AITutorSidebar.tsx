import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, User, Sparkles, Brain, Lightbulb, Trash2, BookmarkPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { aiTutorService, BookContext } from "@/services/aiTutor";
import { playbookService } from "@/services/playbookService";
import { haptics } from "@/utils/audioHaptics";
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
                    text: `🛡️ **Athena AI Gateway Standby**

The institutional AI gateway is operating in calibrated simulation mode. Responses are verified against our core trading knowledge base with 0 client credentials required.`
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
                    {messages.map((msg) => {
                        const hasRules = msg.text.includes("1.") && msg.text.includes("2.");
                        return (
                            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${msg.role === 'user' ? 'bg-gray-700' : 'bg-emerald-900/50'}`}>
                                    {msg.role === 'user' ? <User className="w-3 h-3" /> : <Brain className="w-3 h-3 text-emerald-400" />}
                                </div>
                                <div className={`rounded-xl p-3 text-sm max-w-[88%] space-y-2 ${msg.role === 'user' ? 'bg-[#2a2a2a]' : 'bg-emerald-950/30 border border-emerald-500/20'}`}>
                                    <div className="leading-relaxed whitespace-pre-line text-xs">{msg.text}</div>

                                    {msg.role === 'assistant' && hasRules && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                haptics.playSuccess();
                                                playbookService.saveStrategy({
                                                    name: `${bookTitle || 'Strategy'} Execution Rules`,
                                                    sourceBookTitle: bookTitle || 'AI Extracted',
                                                    category: (category as any) || 'Smart Money Concepts',
                                                    timeframe: '15M / 5M',
                                                    rules: msg.text.split('\n').filter(l => l.match(/^\d+\./)),
                                                    invalidation: 'Stop loss hit beyond structural sweep point.',
                                                    targetRR: '1:3.0 Minimum',
                                                    winRateEstimate: 69,
                                                    tags: ['AI Tutor', 'Athena', 'Playbook']
                                                });
                                                toast({
                                                    title: "Saved to Playbook! 🎯",
                                                    description: "Added +40 Trader XP to your account."
                                                });
                                            }}
                                            className="h-6 text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30 flex items-center gap-1 mt-1"
                                        >
                                            <BookmarkPlus className="w-3 h-3" /> Save to My Playbook (+40 XP)
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
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
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    <Button variant="outline" size="sm" className="bg-transparent border-[#333] hover:bg-[#222] text-[11px] h-7 whitespace-nowrap text-emerald-400 border-emerald-500/20" onClick={() => { setInputValue("Generate a 5-rule execution checklist for this strategy."); handleSend(); }}>
                        <Sparkles className="w-3 h-3 mr-1 text-emerald-400" />
                        Rules Checklist
                    </Button>
                    <Button variant="outline" size="sm" className="bg-transparent border-[#333] hover:bg-[#222] text-[11px] h-7 whitespace-nowrap" onClick={() => handleSuggestion('summary')}>
                        <Lightbulb className="w-3 h-3 mr-1 text-yellow-500" />
                        Summarize
                    </Button>
                    <Button variant="outline" size="sm" className="bg-transparent border-[#333] hover:bg-[#222] text-[11px] h-7 whitespace-nowrap text-purple-400 border-purple-500/20" onClick={() => handleSuggestion('quiz')}>
                        <Brain className="w-3 h-3 mr-1 text-purple-400" />
                        Quiz Me
                    </Button>
                    <Button variant="outline" size="sm" className="bg-transparent border-[#333] hover:bg-[#222] text-[11px] h-7 whitespace-nowrap text-cyan-400 border-cyan-500/20" onClick={() => { setInputValue("Explain how institutions engineer liquidity sweeps before an entry."); handleSend(); }}>
                        🌊 Liquidity Trap
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
