import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Check, X, Zap, Crown, Shield, Star, TrendingUp,
    BookOpen, Bot, MessageSquare, BarChart3
} from 'lucide-react';

const TIERS = [
    {
        id: 'free',
        name: 'Free',
        price: 0,
        period: 'forever',
        badge: null,
        accent: 'from-zinc-600 to-zinc-700',
        border: 'border-border/50',
        icon: Shield,
        iconColor: 'text-zinc-400',
        cta: 'Get Started Free',
        ctaStyle: 'bg-secondary hover:bg-secondary/80 text-foreground border border-border',
        description: 'Perfect for getting your feet wet in forex trading.',
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 29,
        period: 'month',
        badge: 'Most Popular',
        accent: 'from-blue-500 to-purple-600',
        border: 'border-blue-500/50 shadow-blue-500/10 shadow-xl',
        icon: Zap,
        iconColor: 'text-blue-400',
        cta: 'Start Pro Trial',
        ctaStyle: 'bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 text-white shadow-lg shadow-blue-500/30',
        description: 'For serious traders who want full access to all tools.',
    },
    {
        id: 'elite',
        name: 'Elite',
        price: 79,
        period: 'month',
        badge: 'Best Value',
        accent: 'from-amber-400 to-orange-500',
        border: 'border-amber-400/40 shadow-amber-400/10 shadow-xl',
        icon: Crown,
        iconColor: 'text-amber-400',
        cta: 'Go Elite',
        ctaStyle: 'bg-gradient-to-r from-amber-400 to-orange-500 hover:opacity-90 text-black font-bold shadow-lg shadow-amber-400/30',
        description: 'The full experience with AI coaching and priority support.',
    },
];

interface Feature {
    label: string;
    icon: React.ElementType;
    free: string | boolean;
    pro: string | boolean;
    elite: string | boolean;
}

const FEATURES: Feature[] = [
    { label: 'Signal Access', icon: TrendingUp, free: 'Limited (3/day)', pro: 'Full Access', elite: 'Full + Priority' },
    { label: 'Expert Advisors', icon: Bot, free: 'Browse only', pro: 'Unlimited downloads', elite: 'Unlimited + Early access' },
    { label: 'EA Backtests', icon: BarChart3, free: '3 per day', pro: 'Unlimited', elite: 'Unlimited' },
    { label: 'Trade Journal', icon: BookOpen, free: false, pro: true, elite: true },
    { label: 'Watchlist / Favorites', icon: Star, free: true, pro: true, elite: true },
    { label: 'Mobile App (PWA)', icon: MessageSquare, free: true, pro: true, elite: true },
    { label: 'Reading Library', icon: BookOpen, free: 'Limited', pro: 'Full access', elite: 'Full access' },
    { label: 'AI Trading Coach', icon: Bot, free: false, pro: false, elite: true },
    { label: 'Priority Support', icon: Shield, free: false, pro: false, elite: true },
    { label: 'Referral Earnings', icon: TrendingUp, free: false, pro: true, elite: true },
];

function CellValue({ value }: { value: string | boolean }) {
    if (value === false) return <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />;
    if (value === true) return <Check className="w-4 h-4 text-emerald-400 mx-auto" />;
    return <span className="text-xs text-center block text-muted-foreground">{value}</span>;
}

export default function PricingPage() {
    const [annual, setAnnual] = useState(false);
    const navigate = useNavigate();

    const getPrice = (price: number) => {
        if (price === 0) return 0;
        return annual ? Math.round(price * 0.75) : price;
    };

    const handleCta = (tierId: string) => {
        navigate('/auth');
    };

    return (
        <div className="min-h-screen bg-background">
            <SEO
                title="Pricing — Free, Pro & Elite"
                description="Choose the AlphaFlow plan that fits your trading journey. Start free, upgrade anytime."
            />

            {/* Hero */}
            <section className="pt-32 pb-16 px-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent" />
                <div className="container mx-auto relative z-10 text-center max-w-3xl">
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 mb-6">
                        <Crown className="w-3 h-3 mr-1" /> Transparent Pricing
                    </Badge>
                    <h1 className="text-5xl md:text-6xl font-bold mb-4">
                        Invest in Your{' '}
                        <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                            Trading Edge
                        </span>
                    </h1>
                    <p className="text-xl text-muted-foreground mb-8">
                        No hidden fees. Cancel anytime. Start free and upgrade as you grow.
                    </p>

                    {/* Billing Toggle */}
                    <div className="inline-flex items-center gap-3 bg-secondary/50 border border-border rounded-full px-4 py-2 mb-12">
                        <button
                            onClick={() => setAnnual(false)}
                            className={`text-sm font-medium px-3 py-1 rounded-full transition-all ${!annual ? 'bg-background text-foreground shadow' : 'text-muted-foreground'}`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setAnnual(true)}
                            className={`text-sm font-medium px-3 py-1 rounded-full transition-all ${annual ? 'bg-background text-foreground shadow' : 'text-muted-foreground'}`}
                        >
                            Annual
                            <span className="ml-1.5 text-emerald-400 text-xs font-bold">−25%</span>
                        </button>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="container mx-auto relative z-10">
                    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {TIERS.map((tier) => {
                            const TierIcon = tier.icon;
                            const price = getPrice(tier.price);
                            return (
                                <div
                                    key={tier.id}
                                    className={`relative rounded-2xl border bg-card/50 backdrop-blur p-8 flex flex-col transition-all hover:scale-[1.02] ${tier.border}`}
                                >
                                    {tier.badge && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                            <Badge className={`bg-gradient-to-r ${tier.accent} text-white border-0 px-4 py-1`}>
                                                {tier.badge}
                                            </Badge>
                                        </div>
                                    )}

                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.accent} flex items-center justify-center mb-4`}>
                                        <TierIcon className="w-6 h-6 text-white" />
                                    </div>

                                    <h2 className="text-2xl font-bold mb-1">{tier.name}</h2>
                                    <p className="text-sm text-muted-foreground mb-6">{tier.description}</p>

                                    <div className="mb-6">
                                        <span className="text-5xl font-black">
                                            {price === 0 ? 'Free' : `$${price}`}
                                        </span>
                                        {price > 0 && (
                                            <span className="text-muted-foreground ml-2 text-sm">
                                                /{annual ? 'mo · billed annually' : 'month'}
                                            </span>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => handleCta(tier.id)}
                                        className={`w-full py-3 rounded-xl font-semibold text-sm transition-all mb-8 ${tier.ctaStyle}`}
                                    >
                                        {tier.cta}
                                    </button>

                                    <ul className="space-y-3 text-sm flex-1">
                                        {FEATURES.slice(0, 6).map((feature) => {
                                            const val = feature[tier.id as 'free' | 'pro' | 'elite'];
                                            if (val === false) return null;
                                            return (
                                                <li key={feature.label} className="flex items-center gap-2 text-muted-foreground">
                                                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                                                    <span>{typeof val === 'string' ? val : feature.label}</span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Full Comparison Table */}
            <section className="py-20 px-4">
                <div className="container mx-auto max-w-5xl">
                    <h2 className="text-3xl font-bold text-center mb-12">Full Feature Comparison</h2>

                    <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur overflow-hidden">
                        {/* Header */}
                        <div className="grid grid-cols-4 bg-secondary/30 border-b border-border/50">
                            <div className="p-5 text-sm font-semibold text-muted-foreground">Feature</div>
                            {TIERS.map((tier) => (
                                <div key={tier.id} className="p-5 text-center">
                                    <div className={`text-sm font-bold ${tier.iconColor}`}>{tier.name}</div>
                                    <div className="text-xs text-muted-foreground font-mono">
                                        {tier.price === 0 ? 'Free' : `$${getPrice(tier.price)}/mo`}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Rows */}
                        {FEATURES.map((feature, i) => (
                            <div
                                key={feature.label}
                                className={`grid grid-cols-4 border-b border-border/50 last:border-0 transition-colors hover:bg-secondary/20 ${i % 2 === 0 ? '' : 'bg-secondary/10'}`}
                            >
                                <div className="p-4 flex items-center gap-2 text-sm text-muted-foreground">
                                    <feature.icon className="w-4 h-4 text-primary/60 shrink-0" />
                                    {feature.label}
                                </div>
                                <div className="p-4 flex items-center justify-center">
                                    <CellValue value={feature.free} />
                                </div>
                                <div className="p-4 flex items-center justify-center">
                                    <CellValue value={feature.pro} />
                                </div>
                                <div className="p-4 flex items-center justify-center">
                                    <CellValue value={feature.elite} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* CTA Row */}
                    <div className="grid grid-cols-4 mt-6 gap-4">
                        <div />
                        {TIERS.map((tier) => (
                            <button
                                key={tier.id}
                                onClick={() => handleCta(tier.id)}
                                className={`py-3 rounded-xl text-sm font-semibold transition-all ${tier.ctaStyle}`}
                            >
                                {tier.cta}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ / Guarantee */}
            <section className="py-16 px-4 border-t border-border/50">
                <div className="container mx-auto max-w-2xl text-center">
                    <Shield className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-3">30-Day Money-Back Guarantee</h3>
                    <p className="text-muted-foreground">
                        Not satisfied? Get a full refund within 30 days, no questions asked. We're confident
                        AlphaFlow will transform your trading — but the risk is entirely on us.
                    </p>
                </div>
            </section>
        </div>
    );
}
