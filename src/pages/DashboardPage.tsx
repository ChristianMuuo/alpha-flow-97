import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  User, Download, Package, LogOut, TrendingUp, ShoppingBag,
  BookOpen, Heart, BookMarked, Star, Flame, ChevronRight, Save,
  Shield, Trophy, RefreshCw
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import ReferralSection from '@/components/ReferralSection';
import { PropFirmScorecard } from '@/components/dashboard/PropFirmScorecard';
import { SessionHUD } from '@/components/SessionHUD';

interface Order {
  id: string; product_id: string; product_name: string; product_type: string;
  price: number; status: string; download_url: string | null; created_at: string;
}

interface Profile {
  id: string; user_id: string; email: string | null; full_name: string | null;
  created_at: string; country: string | null; trading_style: string | null;
  tier: string | null; xp: number | null; level: number | null;
}

interface WatchlistItem {
  id: string; item_id: string; item_type: string; item_name: string | null;
  item_meta: any; created_at: string;
}

interface ReadingProgress {
  id: string; book_id: string; book_title: string | null;
  scroll_percent: number | null; updated_at: string;
}

interface Streak {
  reading_streak: number; total_xp: number; level: number; last_read_at: string | null;
}

const COUNTRIES = ["Kenya", "Nigeria", "South Africa", "United States", "United Kingdom", "India", "Australia", "Canada", "Germany", "France", "UAE", "Singapore", "Other"];
const STYLES = ["Scalping", "Day Trading", "Swing Trading", "Position Trading", "Investor"];

const TIER_STYLES: Record<string, string> = {
  free: "bg-secondary text-muted-foreground",
  pro: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  elite: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  admin: "bg-red-500/20 text-red-400 border-red-500/30",
};

const DashboardPage = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [readingProgress, setReadingProgress] = useState<ReadingProgress[]>([]);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  // Profile edit state
  const [editName, setEditName] = useState('');
  const [editCountry, setEditCountry] = useState('');
  const [editStyle, setEditStyle] = useState('');

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) navigate('/auth');
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) { setUser(session.user); fetchAllData(session.user.id); }
      else navigate('/auth');
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchAllData = async (userId: string) => {
    setLoading(true);
    const [profileRes, ordersRes, watchlistRes, progressRes, streakRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('watchlist').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('reading_progress').select('*').eq('user_id', userId).order('updated_at', { ascending: false }),
      supabase.from('user_streaks').select('*').eq('user_id', userId).maybeSingle(),
    ]);
    if (profileRes.data) {
      setProfile(profileRes.data as Profile);
      setEditName(profileRes.data.full_name ?? '');
      setEditCountry(profileRes.data.country ?? '');
      setEditStyle(profileRes.data.trading_style ?? '');
    }
    if (ordersRes.data) setOrders(ordersRes.data as Order[]);
    if (watchlistRes.data) setWatchlist(watchlistRes.data as WatchlistItem[]);
    if (progressRes.data) setReadingProgress(progressRes.data as ReadingProgress[]);
    if (streakRes.data) setStreak(streakRes.data as Streak);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: 'Logged out', description: 'See you next time!' });
    navigate('/');
  };

  const handleDownload = (order: Order) => {
    if (order.download_url) window.open(order.download_url, '_blank');
    else toast({ title: 'Download Available Soon', description: 'Your download link will be available shortly after purchase confirmation.' });
  };

  const removeFromWatchlist = async (id: string) => {
    await supabase.from('watchlist').delete().eq('id', id);
    setWatchlist(w => w.filter(item => item.id !== id));
    toast({ title: 'Removed from watchlist' });
  };

  const saveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    const { error } = await supabase.from('profiles').update({
      full_name: editName, country: editCountry, trading_style: editStyle,
    }).eq('user_id', user.id);
    if (error) toast({ title: 'Error saving profile', description: error.message, variant: 'destructive' });
    else { toast({ title: '✅ Profile updated!' }); if (profile) setProfile({ ...profile, full_name: editName, country: editCountry, trading_style: editStyle }); }
    setSavingProfile(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  const tier = profile?.tier ?? 'free';
  const xpToNextLevel = 1000;
  const xp = streak?.total_xp ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-32 pb-24">
        <div className="max-w-6xl mx-auto">

          {/* ── Header ── */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold">
                  Welcome back, {profile?.full_name || user?.email?.split('@')[0]}!
                </h1>
                <Badge className={`text-xs ${TIER_STYLES[tier]}`}>
                  {tier === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                  {tier === 'elite' && <Trophy className="w-3 h-3 mr-1" />}
                  {tier.toUpperCase()}
                </Badge>
              </div>
              <p className="text-muted-foreground">Manage your purchases, watchlist, and reading progress.</p>
            </div>
            <div className="flex gap-2">
              {tier === 'admin' && (
                <Link to="/admin">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Shield className="w-4 h-4" /> Admin
                  </Button>
                </Link>
              )}
              <Button variant="outline" onClick={handleLogout} size="sm">
                <LogOut className="h-4 w-4 mr-2" /> Sign Out
              </Button>
            </div>
          </div>

          {/* ── Ambient Session HUD ── */}
          <div className="mb-6">
            <SessionHUD />
          </div>

          {/* ── Stats Cards ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Purchases</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{orders.length}</div>
                <p className="text-xs text-muted-foreground">Products owned</p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${orders.reduce((s, o) => s + Number(o.price), 0).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Lifetime value</p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Watchlist</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{watchlist.length}</div>
                <p className="text-xs text-muted-foreground">Saved items</p>
              </CardContent>
            </Card>
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Reading Streak</CardTitle>
                <Flame className="h-4 w-4 text-orange-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-400">{streak?.reading_streak ?? 0}🔥</div>
                <p className="text-xs text-muted-foreground">{xp} XP · Level {streak?.level ?? 1}</p>
              </CardContent>
            </Card>
          </div>

          {/* XP Bar */}
          {streak && (
            <div className="mb-6 p-4 rounded-xl border border-border/50 bg-card/30 backdrop-blur">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-muted-foreground">Level {streak.level} · {xp % xpToNextLevel} / {xpToNextLevel} XP</span>
                <span className="text-emerald-400 font-medium">Level {streak.level + 1} →</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all"
                  style={{ width: `${((xp % xpToNextLevel) / xpToNextLevel) * 100}%` }} />
              </div>
            </div>
          )}

          {/* ── Prop Firm Combine Evaluation ── */}
          <div className="mb-8">
            <PropFirmScorecard />
          </div>

          {/* ── Main Tabs ── */}
          <Tabs defaultValue="products">
            <TabsList className="mb-6 flex-wrap h-auto gap-1">
              <TabsTrigger value="products"><Package className="w-4 h-4 mr-1" />Products</TabsTrigger>
              <TabsTrigger value="watchlist"><Heart className="w-4 h-4 mr-1" />Watchlist</TabsTrigger>
              <TabsTrigger value="library"><BookOpen className="w-4 h-4 mr-1" />Library</TabsTrigger>
              <TabsTrigger value="journal"><BookMarked className="w-4 h-4 mr-1" />Journal</TabsTrigger>
              <TabsTrigger value="profile"><User className="w-4 h-4 mr-1" />Profile</TabsTrigger>
            </TabsList>

            {/* ── Products Tab (original content) ── */}
            <TabsContent value="products">
              <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" />Your Products</CardTitle>
                  <CardDescription>Download your purchased trading tools and resources</CardDescription>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No purchases yet</h3>
                      <p className="text-muted-foreground mb-4">Browse our collection of premium trading tools</p>
                      <Button onClick={() => navigate('/eas')}>Explore Products</Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map(order => (
                        <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-border/50 bg-background/50">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{order.product_name}</h4>
                              <Badge variant="secondary" className="text-xs">{order.product_type}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Purchased {new Date(order.created_at).toLocaleDateString()} • ${order.price}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}
                              className={order.status === 'completed' ? 'bg-green-500/20 text-green-500' : ''}>
                              {order.status}
                            </Badge>
                            <Button size="sm" onClick={() => handleDownload(order)} disabled={order.status !== 'completed'}>
                              <Download className="h-4 w-4 mr-2" />Download
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              <ReferralSection />
            </TabsContent>

            {/* ── Watchlist Tab ── */}
            <TabsContent value="watchlist">
              <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Heart className="h-5 w-5 text-red-400" />My Watchlist</CardTitle>
                  <CardDescription>EAs and signals you've saved for later</CardDescription>
                </CardHeader>
                <CardContent>
                  {watchlist.length === 0 ? (
                    <div className="text-center py-12">
                      <Heart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Nothing saved yet</h3>
                      <p className="text-muted-foreground mb-4">Tap the ♥ icon on any EA or signal to save it here</p>
                      <div className="flex gap-2 justify-center">
                        <Button variant="outline" onClick={() => navigate('/eas')}>Browse EAs</Button>
                        <Button onClick={() => navigate('/signals')}>Browse Signals</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {watchlist.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-background/50 hover:border-border transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center font-bold text-white text-xs">
                              {(item.item_name ?? '?').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-sm">{item.item_name ?? 'Unknown'}</div>
                              <div className="text-xs text-muted-foreground capitalize">{item.item_type} · Saved {new Date(item.created_at).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => navigate(`/${item.item_type === 'ea' ? 'eas' : 'signals'}`)}>
                              View <ChevronRight className="w-3.5 h-3.5 ml-1" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              onClick={() => removeFromWatchlist(item.id)}>
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Library Tab ── */}
            <TabsContent value="library">
              <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-emerald-400" />Reading Progress</CardTitle>
                  <CardDescription>Books you've started reading</CardDescription>
                </CardHeader>
                <CardContent>
                  {(streak?.reading_streak ?? 0) > 0 && (
                    <div className="flex items-center gap-3 p-4 rounded-xl border border-orange-500/20 bg-orange-500/5 mb-4">
                      <Flame className="w-6 h-6 text-orange-400" />
                      <div>
                        <div className="font-semibold text-sm">{streak?.reading_streak}-Day Reading Streak! 🔥</div>
                        <div className="text-xs text-muted-foreground">Keep it up — read something today to keep your streak alive.</div>
                      </div>
                    </div>
                  )}
                  {readingProgress.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No reading history yet</h3>
                      <Button onClick={() => navigate('/library')}>Browse Library</Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {readingProgress.map(p => (
                        <div key={p.id} className="p-4 rounded-lg border border-border/50 bg-background/50">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium text-sm">{p.book_title ?? p.book_id}</div>
                            <Button size="sm" variant="ghost" onClick={() => navigate(`/library/read/${p.book_id}`)}
                              className="text-emerald-400 hover:text-emerald-300 gap-1">
                              Resume <ChevronRight className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                            <span>{Math.round(p.scroll_percent ?? 0)}% complete</span>
                            <span>Last read {new Date(p.updated_at).toLocaleDateString()}</span>
                          </div>
                          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${p.scroll_percent ?? 0}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Journal Tab ── */}
            <TabsContent value="journal">
              <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><BookMarked className="h-5 w-5 text-cyan-400" />Trade Journal</CardTitle>
                  <CardDescription>Track your trades and analyze your performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <BookMarked className="h-12 w-12 text-cyan-400/40 mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">View and manage all your logged trades in the Journal</p>
                    <Button onClick={() => navigate('/journal')} className="bg-cyan-500 hover:bg-cyan-600 text-black font-semibold gap-2">
                      <BookMarked className="w-4 h-4" /> Open Trade Journal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Profile Tab ── */}
            <TabsContent value="profile">
              <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-blue-400" />Profile Settings</CardTitle>
                  <CardDescription>Update your display name, country and trading style</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-w-md space-y-4">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Email</label>
                      <Input value={user?.email ?? ''} disabled className="opacity-60" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Full Name</label>
                      <Input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Your name" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Country</label>
                      <select value={editCountry} onChange={e => setEditCountry(e.target.value)}
                        className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm">
                        <option value="">Select country...</option>
                        {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Trading Style</label>
                      <select value={editStyle} onChange={e => setEditStyle(e.target.value)}
                        className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm">
                        <option value="">Select style...</option>
                        {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                      <div>
                        <span className="text-xs text-muted-foreground">Current Tier: </span>
                        <Badge className={`text-xs ml-1 ${TIER_STYLES[tier]}`}>{tier.toUpperCase()}</Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}</span>
                    </div>
                    <Button onClick={saveProfile} disabled={savingProfile} className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold">
                      <Save className="w-4 h-4" /> {savingProfile ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
