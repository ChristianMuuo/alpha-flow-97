import { Link, useLocation } from "react-router-dom";
import { Home, Globe, Radio, BookOpen, LayoutDashboard, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
    { href: "/", label: "Home", icon: Home },
    { href: "/markets", label: "Markets", icon: Globe },
    { href: "/signals", label: "Signals", icon: Radio },
    { href: "/eas", label: "EAs", icon: Bot },
    { href: "/library", label: "Library", icon: BookOpen },
    { href: "/dashboard", label: "Account", icon: LayoutDashboard },
];

export default function MobileBottomNav() {
    const location = useLocation();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-xl border-t border-border/50 safe-area-pb">
            <div className="flex items-center justify-around px-2 py-2">
                {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                    const active = location.pathname === href || (href !== "/" && location.pathname.startsWith(href));
                    return (
                        <Link key={href} to={href}
                            className={cn(
                                "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all min-w-[44px]",
                                active ? "text-emerald-400" : "text-muted-foreground hover:text-foreground"
                            )}>
                            <div className={cn("p-1 rounded-lg transition-colors", active && "bg-emerald-500/15")}>
                                <Icon className={cn("w-5 h-5 transition-all", active && "scale-110")} />
                            </div>
                            <span className={cn("text-[9px] font-medium leading-none", active && "text-emerald-400")}>{label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
