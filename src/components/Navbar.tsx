import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50 py-3"
          : "bg-transparent py-6"
      )}
    >
      <div className="container px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gold-gradient flex items-center justify-center">
              <span className="text-sm font-black text-primary-foreground">FT</span>
            </div>
            <span className="font-bold text-foreground hidden sm:block">
              Funded Trader Protocol
            </span>
          </div>

          {/* CTA */}
          <Button variant="gold" size="sm">
            Enroll Now
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
