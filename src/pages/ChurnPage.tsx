import React from "react";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import { CustomerChurnDashboard } from "@/components/crm/CustomerChurnDashboard";

export default function ChurnPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Customer Churn Intelligence & AI Retention Sentinel | AlphaFlow"
        description="Predictive customer churn intelligence, trader health telemetry, and automated AI rescue playbooks powered by Google Gemini 1.5."
      />
      <Navbar />

      <main className="container mx-auto px-4 pt-28 pb-20">
        <div className="max-w-7xl mx-auto">
          <CustomerChurnDashboard />
        </div>
      </main>
    </div>
  );
}
