import React, { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ShieldAlert, UserX, TrendingDown, DollarSign, Sparkles, RefreshCw,
  Search, CheckCircle2, AlertTriangle, Mail, Send, Copy, ArrowUpRight,
  HeartHandshake, Flame, Shield, UserCheck, Activity, Award
} from "lucide-react";
import {
  customerChurnEngine,
  CustomerHealthProfile,
  CustomerRiskLevel,
  ChurnCohortStats,
  RetentionPlaybook
} from "@/services/crm/customerChurnEngine";
import { toast } from "sonner";

export const CustomerChurnDashboard: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerHealthProfile[]>(() => customerChurnEngine.getCustomers());
  const [stats, setStats] = useState<ChurnCohortStats>(() => customerChurnEngine.getCohortStats());
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState<"ALL" | CustomerRiskLevel>("ALL");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerHealthProfile | null>(null);
  const [isGeneratingPlaybook, setIsGeneratingPlaybook] = useState(false);
  const [activePlaybook, setActivePlaybook] = useState<RetentionPlaybook | null>(null);

  useEffect(() => {
    const unsubscribe = customerChurnEngine.subscribe(() => {
      setCustomers(customerChurnEngine.getCustomers());
      setStats(customerChurnEngine.getCohortStats());
    });
    return unsubscribe;
  }, []);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRisk = riskFilter === "ALL" || c.riskLevel === riskFilter;
      return matchesSearch && matchesRisk;
    });
  }, [customers, searchTerm, riskFilter]);

  const handleGeneratePlaybook = async (customer: CustomerHealthProfile) => {
    setSelectedCustomer(customer);
    setIsGeneratingPlaybook(true);
    setActivePlaybook(null);
    try {
      const playbook = await customerChurnEngine.generateAiRetentionPlaybook(customer.id);
      setActivePlaybook(playbook);
      toast.success(`AI Retention Playbook generated for ${customer.name}`);
    } catch (err) {
      toast.error("Failed to generate retention playbook. Please try again.");
    } finally {
      setIsGeneratingPlaybook(false);
    }
  };

  const handleSendRescueVoucher = (customer: CustomerHealthProfile) => {
    customerChurnEngine.recordIntervention(customer.id);
    toast.success(`Voucher ALPHA-RESCUE-35 dispatched to ${customer.email}! Risk score mitigated.`);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.info("Copied to clipboard!");
  };

  const tierColors: Record<string, string> = {
    free: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    pro: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    elite: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    admin: "bg-red-500/15 text-red-400 border-red-500/30",
  };

  return (
    <div className="space-y-6">
      {/* ── Header & Key KPI Stat Cards ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge className="bg-red-500/15 text-red-400 border-red-500/30 text-xs font-mono uppercase">
              <ShieldAlert className="w-3.5 h-3.5 mr-1" /> Churn Sentinel Intelligence
            </Badge>
            <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-300 font-mono bg-purple-500/10">
              <Sparkles className="w-3 h-3 mr-1 text-purple-400" />
              Google Gemini 1.5 Powered
            </Badge>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Customer Churn & Retention Command Center
          </h2>
          <p className="text-xs text-gray-400 max-w-2xl mt-0.5">
            Real-time behavioral churn prediction analyzing trading drawdowns, platform inactivity decay, and automated AI rescue playbooks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => customerChurnEngine.hydrateFromSupabase()}
            className="text-xs gap-1.5 border-white/10 hover:bg-white/5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Re-sync Telemetry
          </Button>
        </div>
      </div>

      {/* ── 4 KPI Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#0c0e14] border border-white/10 text-white shadow-xl backdrop-blur">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-400 font-mono">Monthly Churn Rate</span>
              <TrendingDown className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black font-mono text-emerald-400">
              {stats.monthlyChurnRate}%
            </div>
            <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
              <span className="text-emerald-400 font-semibold">↓ 0.8%</span> vs industry benchmark (3.2%)
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0c0e14] border border-white/10 text-white shadow-xl backdrop-blur">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-400 font-mono">ARR At Risk</span>
              <DollarSign className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-2xl font-black font-mono text-red-400">
              ${stats.arrAtRisk.toLocaleString()}
            </div>
            <div className="text-[11px] text-gray-500 mt-1">
              Across <span className="text-red-400 font-bold">{stats.criticalRiskCount} critical</span> traders
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0c0e14] border border-white/10 text-white shadow-xl backdrop-blur">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-400 font-mono">Net Revenue Retention</span>
              <Activity className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black font-mono text-purple-400">
              {stats.netRevenueRetention}%
            </div>
            <div className="text-[11px] text-gray-500 mt-1">
              Top-decile funded trader protocol health
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0c0e14] border border-white/10 text-white shadow-xl backdrop-blur">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-400 font-mono">Successful Re-Engagements</span>
              <HeartHandshake className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black font-mono text-cyan-400">
              {stats.successfulReEngagements} Rescued
            </div>
            <div className="text-[11px] text-gray-500 mt-1">
              Via AI automated retention playbooks
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Main Churn Table & Filters ── */}
      <Card className="bg-[#0c0e14] border border-white/10 text-white shadow-xl">
        <CardHeader className="pb-3 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <UserX className="w-4 h-4 text-red-400" />
              Trader Health & Churn Risk Radar ({filteredCustomers.length})
            </CardTitle>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-xs">
              <Search className="w-3.5 h-3.5 text-gray-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search trader or email..."
                className="bg-transparent outline-none w-36 md:w-48 text-white placeholder-gray-500 text-xs"
              />
            </div>

            {/* Risk Filter Buttons */}
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10 text-xs">
              {[
                { id: "ALL", label: "All" },
                { id: "CRITICAL", label: "Critical Risk" },
                { id: "HIGH", label: "High Risk" },
                { id: "MODERATE", label: "Moderate" },
                { id: "HEALTHY", label: "Healthy" },
              ].map((rf) => (
                <button
                  key={rf.id}
                  onClick={() => setRiskFilter(rf.id as any)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                    riskFilter === rf.id
                      ? "bg-purple-600 text-white font-bold"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {rf.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-3 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 font-mono text-[11px]">
                <th className="text-left py-2.5 pr-3">Trader Profile</th>
                <th className="text-center py-2.5 pr-3">Tier</th>
                <th className="text-left py-2.5 pr-3">Trading Performance</th>
                <th className="text-left py-2.5 pr-3">Inactivity</th>
                <th className="text-left py-2.5 pr-3">Churn Risk Score</th>
                <th className="text-left py-2.5 pr-3">Primary Churn Driver</th>
                <th className="text-right py-2.5">Retention Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {filteredCustomers.map((c) => {
                const isCritical = c.riskLevel === "CRITICAL";
                const isHigh = c.riskLevel === "HIGH";
                const isModerate = c.riskLevel === "MODERATE";

                const riskBadgeClass = isCritical
                  ? "bg-red-500/20 text-red-400 border-red-500/30"
                  : isHigh
                  ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                  : isModerate
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                  : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";

                return (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Trader Info */}
                    <td className="py-3 pr-3">
                      <div className="font-bold text-white text-xs">{c.name}</div>
                      <div className="text-[11px] text-gray-400 font-mono">{c.email}</div>
                    </td>

                    {/* Tier & Value */}
                    <td className="py-3 pr-3 text-center">
                      <Badge className={`text-[10px] font-mono px-2 py-0.5 ${tierColors[c.tier]}`}>
                        {c.tier.toUpperCase()}
                      </Badge>
                      <div className="text-[10px] text-gray-500 font-mono mt-0.5">${c.monthlyValue}/mo</div>
                    </td>

                    {/* Performance */}
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono font-bold ${c.winRatePct < 50 ? "text-amber-400" : "text-emerald-400"}`}>
                          {c.winRatePct}% WR
                        </span>
                        <span className="text-gray-500">·</span>
                        <span className={`font-mono ${c.maxDrawdownPct > 15 ? "text-red-400 font-bold" : "text-gray-300"}`}>
                          -{c.maxDrawdownPct}% DD
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-500">{c.tradesCount} logged trades</div>
                    </td>

                    {/* Inactivity */}
                    <td className="py-3 pr-3">
                      <div className={`font-mono text-xs ${c.daysInactive > 10 ? "text-red-400 font-bold" : c.daysInactive > 5 ? "text-amber-400" : "text-gray-300"}`}>
                        {c.daysInactive === 0 ? "Active today" : `${c.daysInactive} days inactive`}
                      </div>
                      <div className="text-[10px] text-gray-500">Last: {c.lastActiveDate}</div>
                    </td>

                    {/* Churn Risk Bar & Score */}
                    <td className="py-3 pr-3 min-w-[130px]">
                      <div className="flex items-center justify-between mb-1">
                        <Badge className={`text-[9px] font-mono px-1.5 py-0 ${riskBadgeClass}`}>
                          {c.riskLevel}
                        </Badge>
                        <span className="font-mono font-bold text-white text-xs">{c.churnRiskScore}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            isCritical ? "bg-red-500" : isHigh ? "bg-orange-500" : isModerate ? "bg-amber-400" : "bg-emerald-400"
                          }`}
                          style={{ width: `${c.churnRiskScore}%` }}
                        />
                      </div>
                    </td>

                    {/* Primary Driver */}
                    <td className="py-3 pr-3">
                      <div className="text-xs text-gray-300 font-medium">{c.primaryDriverLabel}</div>
                      <div className="text-[10px] text-gray-500 truncate max-w-[160px]">{c.recommendedAction}</div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        <Button
                          size="sm"
                          onClick={() => handleGeneratePlaybook(c)}
                          className="text-[11px] h-7 px-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium shadow-sm shadow-purple-600/30"
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          AI Playbook
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSendRescueVoucher(c)}
                          className="text-[11px] h-7 px-2 border-white/10 hover:bg-white/5 text-gray-300"
                        >
                          <Mail className="w-3 h-3 mr-1" /> Voucher
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-12 text-gray-500 text-sm">
              No customers match your selected churn criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── AI Retention Playbook Generation Modal ── */}
      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="max-w-2xl bg-[#090b10] border border-purple-500/30 text-white max-h-[90vh] overflow-y-auto">
          {selectedCustomer && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2.5 text-lg">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span>AI Retention Playbook: {selectedCustomer.name}</span>
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px]">
                        Churn Risk {selectedCustomer.churnRiskScore}%
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-400 font-mono">
                      {selectedCustomer.email} · {selectedCustomer.tier.toUpperCase()} Tier
                    </div>
                  </div>
                </DialogTitle>
              </DialogHeader>

              {isGeneratingPlaybook ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
                  <p className="text-sm font-mono text-purple-300">
                    Google Gemini 1.5 analyzing trader drawdown & platform telemetry...
                  </p>
                  <p className="text-xs text-gray-500">
                    Drafting personalized retention rescue offer & email...
                  </p>
                </div>
              ) : activePlaybook ? (
                <div className="space-y-3 text-xs">
                  {/* Summary Box */}
                  <div className="bg-purple-950/20 border border-purple-500/30 rounded-xl p-3.5 space-y-2">
                    <div className="text-xs font-bold text-purple-300 uppercase font-mono">
                      Executive Behavioral Diagnosis
                    </div>
                    <p className="text-gray-300 leading-relaxed">{activePlaybook.summary}</p>
                    <div className="text-[11px] text-gray-400 border-t border-purple-500/20 pt-2 mt-1">
                      <span className="text-gray-500 font-mono">Root Cause:</span> {activePlaybook.rootCause}
                    </div>
                  </div>

                  {/* Recommended Offer & Voucher Code */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                      <span className="text-[10px] text-gray-400 font-mono uppercase block mb-1">
                        Recommended Retention Offer
                      </span>
                      <div className="font-bold text-white text-xs">{activePlaybook.recommendedOffer}</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-gray-400 font-mono uppercase block mb-1">
                          Generated Voucher Code
                        </span>
                        <div className="font-mono font-bold text-emerald-400 text-sm">
                          {activePlaybook.retentionDiscountCode}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(activePlaybook.retentionDiscountCode)}
                        className="h-8 px-2 text-xs"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Quantitative Coaching Protocol */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                    <span className="text-[10px] text-gray-400 font-mono uppercase block mb-1">
                      Mandatory Quantitative Coaching Protocol
                    </span>
                    <p className="text-gray-300 text-xs italic">
                      "{activePlaybook.quantCoachingStep}"
                    </p>
                  </div>

                  {/* Email Draft Box */}
                  <div className="bg-black/60 border border-white/10 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-400 font-mono uppercase">
                        AI Drafted Rescue Outreach Email
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(`Subject: ${activePlaybook.emailSubject}\n\n${activePlaybook.emailDraft}`)}
                        className="h-6 px-2 text-[10px] text-purple-300 hover:text-white"
                      >
                        <Copy className="w-3 h-3 mr-1" /> Copy Email
                      </Button>
                    </div>
                    <div className="text-xs font-bold text-white pb-1 border-b border-white/10">
                      Subject: {activePlaybook.emailSubject}
                    </div>
                    <div className="text-gray-300 font-sans text-xs whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                      {activePlaybook.emailDraft}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedCustomer(null)}>
                      Close
                    </Button>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
                      onClick={() => {
                        handleSendRescueVoucher(selectedCustomer);
                        setSelectedCustomer(null);
                      }}
                    >
                      <Send className="w-3.5 h-3.5 mr-1" /> Deploy Retention Email & Credit
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
