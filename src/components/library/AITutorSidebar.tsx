import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, User, Sparkles, Brain, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface AITutorSidebarProps {
    bookTitle?: string;
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    text: string;
    type?: 'default' | 'summary' | 'concept';
}

export const AITutorSidebar = ({ bookTitle }: AITutorSidebarProps) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            text: `Hello! I'm Athena, your Anti-Gravity tutor. I'm reading "${bookTitle || 'this book'}" with you. Would you like a summary of the current chapter or an explanation of a complex concept?`
        }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const newMessage: Message = { id: Date.now().toString(), role: 'user', text: inputValue };
        setMessages([...messages, newMessage]);
        setInputValue("");
        setIsLoading(true);

        // Mock AI response
        setTimeout(() => {
            const responseText = "That's an excellent question about market structure. In this context, the author emphasizes that risk is subjective. The 'Edge' is merely a higher probability of one thing happening over another.";
            setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', text: responseText }]);
            setIsLoading(false);
        }, 1500);
    };

    const handleSuggestion = (type: string) => {
        let text = "";
        if (type === 'summary') text = "Can you summarize the key takeaways of this chapter?";
        if (type === 'quiz') text = "Quiz me on the last 5 pages.";

        setInputValue(text);
        // Could auto-send here
    };

    return (
        <div className="flex flex-col h-full bg-[#0c0c0c] text-gray-200">
            {/* Header */}
            <div className="p-4 border-b border-[#2a2a2a] flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-white">Athena AI</h3>
                    <p className="text-[10px] text-emerald-500 font-mono uppercase tracking-wider">Context Aware</p>
                </div>
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
