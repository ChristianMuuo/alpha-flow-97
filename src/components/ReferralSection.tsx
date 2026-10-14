import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Gift, Copy, Check, Users, Share2 } from 'lucide-react';

interface Profile {
    referral_code: string | null;
    referred_by: string | null;
    tier: string | null;
}

export default function ReferralSection() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [referralCount, setReferralCount] = useState(0);
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;

            const { data: profileData } = await supabase
                .from('profiles')
                .select('referral_code, referred_by, tier')
                .eq('user_id', session.user.id)
                .maybeSingle();

            if (profileData) {
                setProfile(profileData as Profile);

                // Count how many users have been referred by this user's code
                if (profileData.referral_code) {
                    const { count } = await supabase
                        .from('profiles')
                        .select('*', { count: 'exact', head: true })
                        .eq('referred_by', profileData.referral_code);
                    setReferralCount(count ?? 0);
                }
            }
        };

        fetchData();
    }, []);

    const referralLink = profile?.referral_code
        ? `${window.location.origin}/auth?ref=${profile.referral_code}`
        : '';

    const handleCopy = () => {
        if (!referralLink) return;
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        toast({ title: '✅ Link copied!', description: 'Share it with your friends to earn rewards.' });
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        if (navigator.share && referralLink) {
            try {
                await navigator.share({
                    title: 'Join AlphaFlow',
                    text: 'I use AlphaFlow for pro trading tools. Sign up with my referral link:',
                    url: referralLink,
                });
            } catch {
                handleCopy();
            }
        } else {
            handleCopy();
        }
    };

    const earnedCredits = referralCount * 10; // $10 credit per referral

    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur mt-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5 text-amber-400" />
                    Referral Program
                </CardTitle>
                <CardDescription>
                    Earn <span className="text-amber-400 font-semibold">$10 credit</span> for every friend you invite who signs up.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    <div className="bg-secondary/30 rounded-xl p-4 text-center">
                        <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                        <div className="text-2xl font-bold">{referralCount}</div>
                        <div className="text-xs text-muted-foreground">Friends Referred</div>
                    </div>
                    <div className="bg-secondary/30 rounded-xl p-4 text-center">
                        <Gift className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-amber-400">${earnedCredits}</div>
                        <div className="text-xs text-muted-foreground">Credits Earned</div>
                    </div>
                </div>

                {profile?.referral_code ? (
                    <div className="space-y-3">
                        <div className="text-xs text-muted-foreground mb-1">Your referral link</div>
                        <div className="flex items-center gap-2 bg-secondary/40 border border-border rounded-xl px-4 py-2.5">
                            <code className="text-xs text-emerald-400 flex-1 truncate">{referralLink}</code>
                            <button
                                onClick={handleCopy}
                                className="shrink-0 p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                                title="Copy link"
                            >
                                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                onClick={handleCopy}
                                variant="outline"
                                className="gap-1.5 flex-1"
                            >
                                <Copy className="w-3.5 h-3.5" />
                                {copied ? 'Copied!' : 'Copy Link'}
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleShare}
                                className="gap-1.5 flex-1 bg-amber-500 hover:bg-amber-600 text-black font-semibold"
                            >
                                <Share2 className="w-3.5 h-3.5" />
                                Share
                            </Button>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                                Code: <span className="font-mono ml-1 text-emerald-400">{profile.referral_code}</span>
                            </Badge>
                            {profile.referred_by && (
                                <Badge variant="secondary" className="text-xs">
                                    Referred by: {profile.referred_by}
                                </Badge>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-6 text-muted-foreground text-sm">
                        <Gift className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p>Referral code loading...</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
