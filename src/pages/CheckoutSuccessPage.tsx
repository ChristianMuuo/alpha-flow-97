import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import SEO from "@/components/SEO";
import { CheckCircle2, Download, Mail, ArrowRight } from "lucide-react";

const CheckoutSuccessPage = () => {
  const { clearCart } = useCart();
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference');

  useEffect(() => {
    // Clear cart after successful payment
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Payment Successful" description="Thank you for your purchase." />

      <div className="container py-32">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-profit/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-profit" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground font-display mb-4">
            Payment Successful!
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Thank you for your purchase. Your products are ready for download.
          </p>

          {reference && (
            <div className="card-glass p-4 rounded-xl mb-8">
              <p className="text-sm text-muted-foreground">Transaction Reference</p>
              <p className="font-mono text-foreground">{reference}</p>
            </div>
          )}

          <div className="space-y-4 mb-8">
            <div className="card-glass p-4 rounded-xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground">Check Your Email</p>
                <p className="text-sm text-muted-foreground">Download links sent to your email</p>
              </div>
            </div>

            <div className="card-glass p-4 rounded-xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Download className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground">Instant Access</p>
                <p className="text-sm text-muted-foreground">Download immediately from your dashboard</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="emerald" asChild>
              <Link to="/dashboard">
                Go to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button variant="outline_emerald" asChild>
              <Link to="/eas">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;
