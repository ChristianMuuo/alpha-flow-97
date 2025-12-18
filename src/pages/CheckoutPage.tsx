import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SEO from "@/components/SEO";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, ShieldCheck, Lock, CreditCard, Trash2 } from "lucide-react";

const CheckoutPage = () => {
  const { items, removeItem, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const handlePaystack = async () => {
    if (!email || !name) {
      toast.error("Please fill in your email and name");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('paystack-checkout', {
        body: {
          email,
          name,
          amount: totalPrice * 100, // Paystack uses kobo/cents
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            type: item.type
          })),
          callback_url: `${window.location.origin}/checkout/success`
        }
      });

      if (error) throw error;

      if (data?.authorization_url) {
        // Redirect to Paystack payment page
        window.location.href = data.authorization_url;
      } else {
        throw new Error('Failed to initialize payment');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error("Failed to initialize payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <SEO title="Checkout" description="Complete your purchase." />
        <div className="container py-32 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">Add some products before checking out.</p>
          <Link to="/eas">
            <Button variant="emerald">Browse Products</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Checkout" description="Complete your purchase." />

      <div className="container pt-24 pb-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left - Form */}
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground font-display mb-2">Checkout</h1>
              <p className="text-muted-foreground">Complete your purchase securely with Paystack</p>
            </div>

            <div className="card-glass p-6 rounded-2xl space-y-6">
              <h2 className="text-lg font-semibold text-foreground">Contact Information</h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-secondary/50 border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-secondary/50 border-border"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your purchase will be sent to this email
                  </p>
                </div>
              </div>
            </div>

            <div className="card-glass p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Pay with Paystack</h3>
                  <p className="text-sm text-muted-foreground">Cards, Bank Transfer, USSD</p>
                </div>
              </div>

              <Button
                variant="emerald"
                className="w-full h-12 text-lg font-semibold"
                onClick={handlePaystack}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Pay ${totalPrice.toLocaleString()}
                  </span>
                )}
              </Button>

              <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  256-bit SSL
                </span>
                <span>•</span>
                <span>PCI DSS Compliant</span>
              </div>
            </div>
          </div>

          {/* Right - Order Summary */}
          <div>
            <div className="card-glass p-6 rounded-2xl sticky top-24">
              <h2 className="text-lg font-semibold text-foreground mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start gap-4 p-3 bg-secondary/30 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm">
                        {item.type === 'ea' ? '🤖' : item.type === 'signal' ? '📊' : '📈'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground text-sm truncate">{item.name}</h4>
                      <p className="text-xs text-muted-foreground">{item.creator}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">${item.price}</p>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">${totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Processing Fee</span>
                  <span className="text-profit">$0</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">${totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-profit/10 rounded-xl border border-profit/20">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-profit flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-profit text-sm">30-Day Money Back Guarantee</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Not satisfied? Get a full refund within 30 days, no questions asked.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

  );
};

export default CheckoutPage;
