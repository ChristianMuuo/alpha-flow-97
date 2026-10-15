import React, { useState } from "react";
import SEO from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AgentObservabilityDashboard } from "@/components/agentPlatform/AgentObservabilityDashboard";
import { AgentSwarmWarRoom } from "@/components/quant/AgentSwarmWarRoom";
import { AgentMemoryViewerModal } from "@/components/agentPlatform/AgentMemoryViewerModal";
import {
  Cpu,
  Activity,
  Brain,
  ShieldCheck,
  Zap,
  Terminal,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

export const AgentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"observability" | "warroom">("observability");
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#07070a] text-white selection:bg-purple-500/30">
      <SEO
        title="AI Agent Swarm & Autonomous Quant Intelligence | AlphaFlow S-Tier"
        description="Autonomous multi-agent quant consensus, tool registry execution, pgvector memory, and real-time observability telemetry."
      />

      <div className="pt-24 pb-16 px-4 container mx-auto space-y-8">
        {/* Page Hero Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-purple-500/15 text-purple-400 border-purple-500/30 text-xs font-mono">
                <Cpu className="w-3.5 h-3.5 mr-1" /> Multi-Agent Platform v2.0
              </Badge>
              <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-xs font-mono">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Dual-Layer Guardrail Sentinel
              </Badge>
              <Badge variant="outline" className="text-xs border-white/10 text-gray-400 font-mono">
                pgvector Semantic RAG & HITL Bus
              </Badge>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold font-display text-white tracking-tight">
              Autonomous{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-emerald-400">
                Agent Swarm Hub
              </span>
            </h1>

            <p className="text-muted-foreground text-sm md:text-base max-w-3xl">
              An orchestrated collective of specialized AI agents collaborating in real time: Quantitative modeling,
              adversarial critic verification, risk vetos, and self-improving persistent memory.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMemoryModalOpen(true)}
              className="border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 text-xs gap-1.5 h-9"
            >
              <Brain className="w-3.5 h-3.5" />
              Directives & Memory
            </Button>

            <div className="flex items-center bg-black/60 border border-white/10 rounded-xl p-1 font-mono text-xs">
              <Button
                size="sm"
                variant={activeTab === "observability" ? "default" : "ghost"}
                onClick={() => setActiveTab("observability")}
                className={`h-7 px-3 text-xs gap-1.5 ${
                  activeTab === "observability"
                    ? "bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Activity className="w-3 h-3" />
                Observability & Traces
              </Button>

              <Button
                size="sm"
                variant={activeTab === "warroom" ? "default" : "ghost"}
                onClick={() => setActiveTab("warroom")}
                className={`h-7 px-3 text-xs gap-1.5 ${
                  activeTab === "warroom"
                    ? "bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Zap className="w-3 h-3" />
                Live Consensus War Room
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "observability" ? (
          <div className="space-y-6">
            <AgentObservabilityDashboard />
          </div>
        ) : (
          <div className="space-y-6">
            <AgentSwarmWarRoom
              onDeployLive={(symbol) => {
                toast.info(`Simulated deployment initialized for ${symbol}`);
              }}
              onBacktest={(symbol) => {
                toast.info(`Backtesting workflow started for ${symbol}`);
              }}
            />
          </div>
        )}

        {/* Long-Term Memory Modal */}
        <AgentMemoryViewerModal
          isOpen={isMemoryModalOpen}
          onClose={() => setIsMemoryModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default AgentsPage;
