import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { Search, Menu, X, TrendingUp, Bot, BarChart3, BookOpen, Globe, User, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import CartDrawer from "./CartDrawer";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const navLinks = [
  { href: "/markets", label: "Markets", icon: Globe },
  { href: "/signals", label: "Signals", icon: TrendingUp },
  { href: "/eas", label: "EAs", icon: Bot },
  { href: "/indicators", label: "Indicators", icon: BarChart3 },
  { href: "/leaderboard", label: "Leaderboard", icon: TrendingUp },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border/50 py-3"
            : "bg-transparent py-5"
        )}
      >
        <div className="container px-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-gradient flex items-center justify-center shadow-lg shadow-primary/25">
                <span className="text-base font-black text-primary-foreground font-display">AX</span>
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-foreground font-display text-lg">APEX</span>
                <span className="font-bold emerald-text font-display text-lg ml-1">FOREX</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Search & CTAs */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <button className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/50 border border-border/50 text-sm text-muted-foreground hover:text-foreground hover:border-border transition-all">
                <Search className="w-4 h-4" />
                <span>Search products...</span>
                <kbd className="hidden lg:inline-flex h-5 items-center gap-1 rounded border border-border/50 bg-muted px-1.5 font-mono text-xs text-muted-foreground">
                  ⌘K
                </kbd>
              </button>

              {/* Cart */}
              <CartDrawer />

              {/* CTAs */}
              {user ? (
                <>
                  <Link to="/dashboard">
                    <Button variant="glass" size="sm" className="hidden sm:flex">
                      <User className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button variant="emerald" size="sm" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="glass" size="sm" className="hidden sm:flex">
                    Sell on Apex
                  </Button>
                  <Link to="/auth">
                    <Button variant="emerald" size="sm">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}

              {/* Mobile Menu Toggle */}
              <button 
                className="lg:hidden p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div 
        className={cn(
          "fixed inset-0 z-40 lg:hidden transition-all duration-300",
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="absolute inset-0 bg-background/95 backdrop-blur-xl" onClick={() => setMobileMenuOpen(false)} />
        <div className="absolute top-20 left-6 right-6 p-6 rounded-2xl bg-card border border-border shadow-xl">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-foreground hover:bg-secondary/50 transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                <link.icon className="w-5 h-5 text-primary" />
                {link.label}
              </Link>
            ))}
            <div className="border-t border-border my-4" />
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="glass" className="w-full justify-center mb-2">
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Button variant="emerald" className="w-full justify-center" onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="glass" className="w-full justify-center mb-2">
                  Sell on Apex
                </Button>
                <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="emerald" className="w-full justify-center">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;