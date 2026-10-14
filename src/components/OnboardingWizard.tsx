import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, ChevronRight, Sparkles, X } from "lucide-react";

const TRADING_STYLES = ["Scalping", "Day Trading", "Swing Trading", "Position Trading", "Investor"];
const PAIRS = ["EURUSD", "GBPUSD", "XAUUSD", "USDJPY", "BTCUSDT", "GBPJPY", "XAGUSD", "AUDUSD"];
const GOALS = [
    { id: "learn", emoji: "📚", label: "Learn to trade", desc: "I want to study trading fundamentals" },
    { id: "signals", emoji: "📡", label: "Copy signals", desc: "Follow expert signal providers" },
    { id: "eas", emoji: "🤖", label: "Use EAs/Bots", desc: "Automate my trading strategy" },
    { id: "all", emoji: "🚀", label: "Everything!", desc: "Master all aspects of trading" },
];

const STORAGE_KEY = "alphaflow_onboarding_done";

export default function OnboardingWizard() {
    const [visible, setVisible] = useState(false);
    const [step, setStep] = useState(1);
    const [style, setStyle] = useState("");
    const [selectedPairs, setSelectedPairs] = useState<string[]>([]);
    const [goal, setGoal] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        // Only show if user is logged in AND hasn't completed onboarding
        if (localStorage.getItem(STORAGE_KEY)) return;
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                // Check if profile already has preferences
                supabase.from("profiles").select("trading_style").eq("user_id", session.user.id).maybeSingle().then(({ data }) => {
                    if (!data?.trading_style) setVisible(true);
                });
            }
        });
    }, []);

    const togglePair = (pair: string) => {
        setSelectedPairs(prev => prev.includes(pair) ? prev.filter(p => p !== pair) : [...prev, pair]);
    };

    const complete = async () => {
        setSaving(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            await supabase.from("profiles").update({
                trading_style: style,
                // Store pairs+goal as JSON in the metadata-style field we'll use notes
            }).eq("user_id", session.user.id);
        }
        localStorage.setItem(STORAGE_KEY, "true");
        setSaving(false);
        setVisible(false);
    };

    const dismiss = () => {
        localStorage.setItem(STORAGE_KEY, "true");
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={dismiss} />
            <div className="relative z-10 w-full max-w-md bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 p-6 border-b border-border/30">
                    <button onClick={dismiss} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                        <X className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs text-emerald-400 font-medium uppercase tracking-wider">Personalize Your Experience</span>
                    </div>
                    <h2 className="text-xl font-bold text-foreground">Welcome to AlphaFlow!</h2>
                    <p className="text-sm text-muted-foreground mt-1">Quick setup — 3 steps to tailor your dashboard.</p>
                    {/* Progress dots */}
                    <div className="flex items-center gap-2 mt-4">
                        {[1, 2, 3].map(s => (
                            <div key={s} className={`h-1.5 flex-1 rounded-full transition-all ${s <= step ? "bg-emerald-500" : "bg-border"}`} />
                        ))}
                    </div>
                </div>

                {/* Body */}
                <div className="p-6">
                    {/* Step 1: Trading Style */}
                    {step === 1 && (
                        <div>
                            <h3 className="font-semibold mb-1">What's your trading style?</h3>
                            <p className="text-xs text-muted-foreground mb-4">We'll show you relevant EAs and signals.</p>
                            <div className="grid grid-cols-1 gap-2">
                                {TRADING_STYLES.map(s => (
                                    <button key={s} onClick={() => setStyle(s)}
                                        className={`text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${style === s ? "border-emerald-500/70 bg-emerald-500/10 text-emerald-400" : "border-border/50 bg-secondary/30 hover:border-border text-foreground"}`}>
                                        {style === s && <CheckCircle className="w-4 h-4 inline mr-2 text-emerald-400" />} {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Preferred Pairs */}
                    {step === 2 && (
                        <div>
                            <h3 className="font-semibold mb-1">Preferred trading pairs</h3>
                            <p className="text-xs text-muted-foreground mb-4">Select as many as you like. Used to filter signals and EAs.</p>
                            <div className="grid grid-cols-2 gap-2">
                                {PAIRS.map(pair => {
                                    const sel = selectedPairs.includes(pair);
                                    return (
                                        <button key={pair} onClick={() => togglePair(pair)}
                                            className={`py-2.5 px-3 rounded-xl border text-sm font-mono font-semibold transition-all ${sel ? "border-cyan-500/70 bg-cyan-500/10 text-cyan-400" : "border-border/50 bg-secondary/30 text-muted-foreground hover:border-border"}`}>
                                            {sel && <CheckCircle className="w-3.5 h-3.5 inline mr-1.5 text-cyan-400" />}{pair}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Goal */}
                    {step === 3 && (
                        <div>
                            <h3 className="font-semibold mb-1">What's your main goal?</h3>
                            <p className="text-xs text-muted-foreground mb-4">We'll surface the most relevant content.</p>
                            <div className="grid grid-cols-1 gap-2">
                                {GOALS.map(g => (
                                    <button key={g.id} onClick={() => setGoal(g.id)}
                                        className={`text-left px-4 py-3 rounded-xl border flex items-start gap-3 transition-all ${goal === g.id ? "border-purple-500/70 bg-purple-500/10" : "border-border/50 bg-secondary/30 hover:border-border"}`}>
                                        <span className="text-xl">{g.emoji}</span>
                                        <div>
                                            <div className={`font-medium text-sm ${goal === g.id ? "text-purple-400" : "text-foreground"}`}>{g.label}</div>
                                            <div className="text-xs text-muted-foreground">{g.desc}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 flex items-center justify-between">
                    <Button variant="ghost" size="sm" onClick={() => step > 1 ? setStep(step - 1) : dismiss()}>
                        {step > 1 ? "Back" : "Skip"}
                    </Button>
                    {step < 3 ? (
                        <Button onClick={() => setStep(step + 1)}
                            disabled={(step === 1 && !style) || (step === 2 && selectedPairs.length === 0)}
                            className="gap-1 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold">
                            Next <ChevronRight className="w-4 h-4" />
                        </Button>
                    ) : (
                        <Button onClick={complete} disabled={!goal || saving}
                            className="gap-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-bold">
                            {saving ? "Saving..." : "🚀 Let's Go!"}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
