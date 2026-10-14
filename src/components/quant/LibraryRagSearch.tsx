import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Sparkles, BookOpen, CheckCircle2, Bookmark, ArrowRight, RefreshCw } from "lucide-react";
import { libraryRagCopilot, RagAnswerResponse } from "@/services/quant/libraryRagCopilot";
import { haptics } from "@/utils/audioHaptics";

export const LibraryRagSearch: React.FC = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RagAnswerResponse | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    haptics.playClick(1500);
    setLoading(true);
    try {
      const res = await libraryRagCopilot.queryLibrary(query);
      setResult(res);
      haptics.playSuccess();
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "What is a Fair Value Gap (FVG)?",
    "How does a Breaker Block form?",
    "How do institutions sweep liquidity?"
  ];

  return (
    <div className="bg-[#0b0b0e] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden space-y-4">
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px] font-mono">
              <Sparkles className="w-3 h-3 mr-1" /> Semantic RAG Vector Retrieval
            </Badge>
            <Badge variant="outline" className="border-white/10 text-gray-400 text-[10px] font-mono">
              95 Institutional Books Indexed
            </Badge>
          </div>
          <h3 className="text-lg font-bold font-display text-white">
            Ask the 95 Books <span className="text-xs text-gray-400 font-normal font-sans">Institutional Semantic Copilot</span>
          </h3>
        </div>
      </div>

      {/* Query Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Ask anything (e.g. Breaker Block vs Order Block entry rules, FVG 50% midpoint)..."
            className="pl-10 bg-black/40 border-white/10 text-white placeholder:text-gray-500 h-10 text-sm rounded-xl focus:border-emerald-500"
          />
        </div>
        <Button
          type="submit"
          disabled={loading || !query.trim()}
          className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold h-10 px-5 rounded-xl shrink-0"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Query Library"}
        </Button>
      </form>

      {/* Quick Prompts */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-gray-500 text-[11px] font-mono">Quick Citations:</span>
        {quickPrompts.map(p => (
          <button
            key={p}
            onClick={() => { setQuery(p); }}
            className="text-[11px] text-gray-400 hover:text-emerald-400 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-lg px-2.5 py-1 transition-all"
          >
            {p}
          </button>
        ))}
      </div>

      {/* RAG Answer Display */}
      {result && (
        <Card className="bg-black/60 border-white/10 text-white p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Concept: {result.primaryConcept}
            </span>
            <span className="text-[10px] text-gray-400 font-mono">Synthesized from 95 Source Texts</span>
          </div>

          <p className="text-xs text-gray-200 leading-relaxed">
            {result.synthesizedAnswer}
          </p>

          {/* Citations Box */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-mono text-gray-400 uppercase block">Verified Book Citations:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {result.citations.map(c => (
                <div key={c.bookTitle} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate max-w-[200px]">{c.bookTitle}</span>
                    <Badge variant="outline" className="text-[9px] border-emerald-500/30 text-emerald-400">
                      {c.relevanceScore}% match
                    </Badge>
                  </div>
                  <span className="text-[10px] text-gray-400 block font-mono">{c.pageOrChapter}</span>
                  <p className="text-[11px] text-gray-300 italic">"{c.keyExcerpt}"</p>
                </div>
              ))}
            </div>
          </div>

          {/* 3-Step Execution Checklist */}
          <div className="pt-2 border-t border-white/5 space-y-1">
            <span className="text-[10px] font-mono text-emerald-400 uppercase block">Execution Checklist:</span>
            <ul className="space-y-1 text-xs text-gray-300">
              {result.checklist.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-mono text-[10px] font-bold mt-0.5">{idx + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}
    </div>
  );
};
