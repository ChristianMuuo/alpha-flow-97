import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { User, Download, Package, LogOut, TrendingUp, ShoppingBag } from 'lucide-react';
import Navbar from '@/components/Navbar';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface Order {
  id: string;
  product_id: string;
  product_name: string;
  product_type: string;
  price: number;
  status: string;
  download_url: string | null;
  created_at: string;
}

interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
}

const DashboardPage = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate('/auth');
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchUserData(session.user.id);
      } else {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchUserData = async (userId: string) => {
    setLoading(true);
    
    // Fetch profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (profileData) setProfile(profileData);

    // Fetch orders
    const { data: ordersData } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (ordersData) setOrders(ordersData);
    
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: 'Logged out', description: 'See you next time!' });
    navigate('/');
  };

  const handleDownload = (order: Order) => {
    if (order.download_url) {
      window.open(order.download_url, '_blank');
    } else {
      toast({ 
        title: 'Download Available Soon', 
        description: 'Your download link will be available shortly after purchase confirmation.' 
      });
    }
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {profile?.full_name || user?.email?.split('@')[0]}!
              </h1>
              <p className="text-muted-foreground">Manage your purchases and downloads</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
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
                  ${orders.reduce((sum, order) => sum + Number(order.price), 0).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Lifetime value</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Account</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium truncate">{user?.email}</div>
                <p className="text-xs text-muted-foreground">
                  Member since {new Date(profile?.created_at || '').toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Purchased Products */}
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Your Products
              </CardTitle>
              <CardDescription>Download your purchased trading tools and resources</CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No purchases yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Browse our collection of premium trading tools
                  </p>
                  <Button onClick={() => navigate('/eas')}>
                    Explore Products
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-border/50 bg-background/50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{order.product_name}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {order.product_type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Purchased {new Date(order.created_at).toLocaleDateString()} • ${order.price}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={order.status === 'completed' ? 'default' : 'secondary'}
                          className={order.status === 'completed' ? 'bg-green-500/20 text-green-500' : ''}
                        >
                          {order.status}
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => handleDownload(order)}
                          disabled={order.status !== 'completed'}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
