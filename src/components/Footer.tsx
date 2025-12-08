const Footer = () => {
  return (
    <footer className="relative py-12 bg-obsidian border-t border-border/30">
      <div className="container px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="text-center md:text-left">
              <p className="text-lg font-bold gold-text">The Funded Trader Protocol</p>
              <p className="text-sm text-muted-foreground mt-1">
                © 2025 All rights reserved.
              </p>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-8 pt-8 border-t border-border/30">
            <p className="text-xs text-muted-foreground/70 text-center leading-relaxed">
              <strong>Risk Disclaimer:</strong> Trading forex involves substantial risk of loss and is not suitable for all investors. 
              Past performance is not indicative of future results. This course is for educational purposes only and does not constitute financial advice. 
              Only trade with capital you can afford to lose. The testimonials and examples used are exceptional results, not typical. 
              Individual results may vary.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
