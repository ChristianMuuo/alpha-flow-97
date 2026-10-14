import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield, Users, ShoppingBag, BookOpen, Bot, TrendingUp,
  Settings, RefreshCw, CheckCircle, XCircle, Search, ShieldAlert,
  Brain, Cpu
} from "lucide-react";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { CustomerChurnDashboard } from "@/components/crm/CustomerChurnDashboard";
import { AgentObservabilityDashboard } from "@/components/agentPlatform/AgentObservabilityDashboard";
import { AgentMemoryViewerModal } from "@/components/agentPlatform/AgentMemoryViewerModal";

interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  tier: string | null;
  created_at: string | null;
  user_id: string | null;
}

interface Order {
  id: string;
  product_name: string;
  product_type: string;
  price: number;
  status: string;
  created_at: string;
  user_id: string;
}

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchUsers, setSearchUsers] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) { navigate("/auth"); return; }
      setUser(session.user);
      // Check if admin (by email or tier)
      const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", session.user.id).maybeSingle();
      const adminFlag = profile?.tier === "admin" || session.user.email?.includes("admin");
      if (!adminFlag) { navigate("/dashboard"); return; }
      setIsAdmin(true);
      fetchData();
    });
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    const [{ data: usersData }, { data: ordersData }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
    ]);
    if (usersData) setProfiles(usersData as UserProfile[]);
    if (ordersData) setOrders(ordersData as Order[]);
    setLoading(false);
  };

  const updateUserTier = async (userId: string, tier: string) => {
    setUpdatingId(userId);
    const { error } = await supabase.from("profiles").update({ tier }).eq("user_id", userId);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: `✅ Tier updated to ${tier}` }); fetchData(); }
    setUpdatingId(null);
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: `Order marked ${status}` }); fetchData(); }
  };

  const filteredProfiles = profiles.filter(p =>
    !searchUsers || (p.email?.toLowerCase().includes(searchUsers.toLowerCase()) || p.full_name?.toLowerCase().includes(searchUsers.toLowerCase()))
  );

  // Stats
  const totalUsers = profiles.length;
  const totalRevenue = orders.filter(o => o.status === "completed").reduce((s, o) => s + Number(o.price), 0);
  const pendingOrders = orders.filter(o => o.status === "pending").length;
  const proUsers = profiles.filter(p => p.tier === "pro" || p.tier === "elite" || p.tier === "admin").length;

  const tierColors: Record<string, string> = {
    free: "bg-secondary text-muted-foreground",
    pro: "bg-blue-500/20 text-blue-400",
    elite: "bg-purple-500/20 text-purple-400",
    admin: "bg-red-500/20 text-red-400",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 text-center text-muted-foreground animate-pulse">Loading admin panel...</div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Admin Panel" description="AlphaFlow admin panel." />
      <Navbar />

      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Admin Panel</h1>
                <p className="text-sm text-muted-foreground">Manage users, orders, content</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMemoryModalOpen(true)}
                className="gap-2 border-purple-500/30 text-purple-300 hover:bg-purple-500/10 text-xs h-8"
              >
                <Brain className="w-3.5 h-3.5 text-purple-400" /> AI Memory Directives
              </Button>
              <Button variant="outline" size="sm" onClick={fetchData} className="gap-2 text-xs h-8">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Users", value: totalUsers, icon: Users, color: "text-blue-400" },
              { label: "Pro/Elite", value: proUsers, icon: TrendingUp, color: "text-purple-400" },
              { label: "Total Revenue", value: `$${totalRevenue.toFixed(0)}`, icon: ShoppingBag, color: "text-emerald-400" },
              { label: "Pending Orders", value: pendingOrders, icon: Settings, color: "text-amber-400" },
            ].map((s, i) => (
              <Card key={i} className="border-border/50 bg-card/50 backdrop-blur">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">{s.label}</span>
                    <s.icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                  <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="users">
            <TabsList className="mb-6">
              <TabsTrigger value="users"><Users className="w-4 h-4 mr-1.5" />Users ({totalUsers})</TabsTrigger>
              <TabsTrigger value="orders"><ShoppingBag className="w-4 h-4 mr-1.5" />Orders ({orders.length})</TabsTrigger>
              <TabsTrigger value="churn" className="data-[state=active]:text-red-400">
                <ShieldAlert className="w-4 h-4 mr-1.5 text-red-400" />
                Customer Churn Intelligence
              </TabsTrigger>
              <TabsTrigger value="agents" className="data-[state=active]:text-purple-400">
                <Cpu className="w-4 h-4 mr-1.5 text-purple-400" />
                Agent Swarm & Observability
              </TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">All Users</CardTitle>
                  <div className="flex items-center gap-2 bg-secondary/50 border border-border rounded-lg px-3 py-1.5">
                    <Search className="w-3.5 h-3.5 text-muted-foreground" />
                    <input value={searchUsers} onChange={e => setSearchUsers(e.target.value)}
                      placeholder="Search users..." className="bg-transparent text-sm outline-none w-40" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/50 text-xs text-muted-foreground">
                          <th className="text-left py-2 pr-4">User</th>
                          <th className="text-left py-2 pr-4">Email</th>
                          <th className="text-center py-2 pr-4">Tier</th>
                          <th className="text-left py-2 pr-4">Joined</th>
                          <th className="text-center py-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProfiles.map(p => (
                          <tr key={p.id} className="border-b border-border/20 hover:bg-secondary/20 transition-colors">
                            <td className="py-3 pr-4 font-medium">{p.full_name || "—"}</td>
                            <td className="py-3 pr-4 text-muted-foreground text-xs">{p.email || "—"}</td>
                            <td className="py-3 pr-4 text-center">
                              <Badge className={`text-xs ${tierColors[p.tier ?? "free"] ?? tierColors.free}`}>
                                {p.tier ?? "free"}
                              </Badge>
                            </td>
                            <td className="py-3 pr-4 text-xs text-muted-foreground">
                              {p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}
                            </td>
                            <td className="py-3 text-center">
                              <div className="flex items-center justify-center gap-1 flex-wrap">
                                {["free", "pro", "elite", "admin"].map(tier => (
                                  <button key={tier}
                                    onClick={() => updateUserTier(p.user_id ?? p.id, tier)}
                                    disabled={updatingId === (p.user_id ?? p.id) || p.tier === tier}
                                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${p.tier === tier ? tierColors[tier] + " opacity-50 cursor-default" : "bg-secondary hover:bg-secondary/80 text-muted-foreground"}`}>
                                    {tier}
                                  </button>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredProfiles.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">No users found.</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-base">All Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/50 text-xs text-muted-foreground">
                          <th className="text-left py-2 pr-4">Product</th>
                          <th className="text-left py-2 pr-4">Type</th>
                          <th className="text-right py-2 pr-4">Price</th>
                          <th className="text-center py-2 pr-4">Status</th>
                          <th className="text-left py-2 pr-4">Date</th>
                          <th className="text-center py-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map(o => (
                          <tr key={o.id} className="border-b border-border/20 hover:bg-secondary/20 transition-colors">
                            <td className="py-3 pr-4 font-medium text-xs">{o.product_name}</td>
                            <td className="py-3 pr-4">
                              <Badge variant="outline" className="text-xs">{o.product_type}</Badge>
                            </td>
                            <td className="py-3 pr-4 text-right font-mono text-emerald-400 text-xs font-bold">${Number(o.price).toFixed(2)}</td>
                            <td className="py-3 pr-4 text-center">
                              <Badge className={`text-xs ${o.status === "completed" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                                {o.status === "completed" ? <CheckCircle className="w-3 h-3 inline mr-1" /> : <XCircle className="w-3 h-3 inline mr-1" />}
                                {o.status}
                              </Badge>
                            </td>
                            <td className="py-3 pr-4 text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                            <td className="py-3 text-center">
                              {o.status === "pending" ? (
                                <Button size="sm" onClick={() => updateOrderStatus(o.id, "completed")}
                                  className="text-xs h-7 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30">
                                  Mark Complete
                                </Button>
                              ) : (
                                <Button size="sm" variant="ghost" onClick={() => updateOrderStatus(o.id, "pending")}
                                  className="text-xs h-7 text-muted-foreground">
                                  Revert
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {orders.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">No orders yet.</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Customer Churn Intelligence Tab */}
            <TabsContent value="churn">
              <CustomerChurnDashboard />
            </TabsContent>

            {/* Agent Platform & Observability Tab */}
            <TabsContent value="agents">
              <AgentObservabilityDashboard />
            </TabsContent>
          </Tabs>

          {/* AI Memory Viewer Modal */}
          <AgentMemoryViewerModal
            isOpen={isMemoryModalOpen}
            onClose={() => setIsMemoryModalOpen(false)}
          />
        </div>
      </div>
    </div>
  );
}
