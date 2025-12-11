import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Trash2, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Link } from "react-router-dom";
import { useState } from "react";

const CartDrawer = () => {
  const { items, removeItem, totalPrice, itemCount, clearCart } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="relative p-2 rounded-lg hover:bg-secondary/50 transition-colors">
          <ShoppingCart className="w-5 h-5 text-foreground" />
          {itemCount > 0 && (
            <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-primary text-primary-foreground text-xs">
              {itemCount}
            </Badge>
          )}
        </button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md bg-card border-border">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between text-foreground">
            <span>Shopping Cart ({itemCount})</span>
            {items.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearCart} className="text-muted-foreground hover:text-destructive">
                Clear All
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 flex flex-col h-[calc(100vh-200px)]">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <ShoppingCart className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <p className="text-lg font-medium text-foreground mb-2">Your cart is empty</p>
              <p className="text-muted-foreground text-sm mb-6">Add some products to get started</p>
              <Button variant="emerald" onClick={() => setOpen(false)} asChild>
                <Link to="/eas">Browse Products</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start gap-4 p-4 bg-secondary/30 rounded-xl">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">
                        {item.type === 'ea' ? '🤖' : item.type === 'signal' ? '📊' : '📈'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">{item.creator}</p>
                      <p className="text-sm font-semibold text-primary mt-1">${item.price}</p>
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 mt-4 space-y-4">
                <div className="flex items-center justify-between text-lg">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-bold text-foreground">${totalPrice.toLocaleString()}</span>
                </div>
                <Button variant="emerald" className="w-full h-12 text-lg font-semibold" asChild onClick={() => setOpen(false)}>
                  <Link to="/checkout">Proceed to Checkout</Link>
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Secure payment powered by Paystack
                </p>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
