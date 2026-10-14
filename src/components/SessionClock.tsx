import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface Session {
    name: string;
    city: string;
    flag: string;
    openUTC: number;
    closeUTC: number;
    color: string;
    bgColor: string;
}

const SESSIONS: Session[] = [
    { name: "Sydney", city: "AUD/NZD", flag: "🇦🇺", openUTC: 22, closeUTC: 7, color: "text-amber-400", bgColor: "bg-amber-500/10 border-amber-500/30" },
    { name: "Tokyo", city: "JPY/AUD", flag: "🇯🇵", openUTC: 0, closeUTC: 9, color: "text-blue-400", bgColor: "bg-blue-500/10 border-blue-500/30" },
    { name: "London", city: "EUR/GBP", flag: "🇬🇧", openUTC: 8, closeUTC: 17, color: "text-purple-400", bgColor: "bg-purple-500/10 border-purple-500/30" },
    { name: "New York", city: "USD/CAD", flag: "🇺🇸", openUTC: 13, closeUTC: 22, color: "text-emerald-400", bgColor: "bg-emerald-500/10 border-emerald-500/30" },
];

function isSessionOpen(session: Session, utcHour: number): boolean {
    if (session.openUTC < session.closeUTC) {
        return utcHour >= session.openUTC && utcHour < session.closeUTC;
    }
    // Spans midnight
    return utcHour >= session.openUTC || utcHour < session.closeUTC;
}

function hoursUntilOpen(session: Session, utcHour: number, utcMin: number): string {
    const currentMinutes = utcHour * 60 + utcMin;
    const openMinutes = session.openUTC * 60;
    let diff = openMinutes - currentMinutes;
    if (diff <= 0) diff += 24 * 60;
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return `Opens in ${h}h ${m}m`;
}

export default function SessionClock() {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 30000);
        return () => clearInterval(id);
    }, []);

    const utcHour = now.getUTCHours();
    const utcMin = now.getUTCMinutes();
    const utcStr = `${String(utcHour).padStart(2, "0")}:${String(utcMin).padStart(2, "0")} UTC`;

    const openCount = SESSIONS.filter(s => isSessionOpen(s, utcHour)).length;

    return (
        <div className="bg-card/50 backdrop-blur border border-border/50 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-bold">Market Sessions</h2>
                    <span className="text-sm text-muted-foreground">{utcStr}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm text-emerald-400 font-medium">{openCount} Open</span>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {SESSIONS.map(session => {
                    const open = isSessionOpen(session, utcHour);
                    return (
                        <div key={session.name}
                            className={`rounded-xl p-4 border transition-all ${open ? session.bgColor : "bg-secondary/20 border-border/30 opacity-60"}`}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xl">{session.flag}</span>
                                <div className={`flex items-center gap-1 text-[10px] font-bold uppercase ${open ? session.color : "text-muted-foreground"}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${open ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"}`} />
                                    {open ? "OPEN" : "CLOSED"}
                                </div>
                            </div>
                            <div className={`text-base font-bold ${open ? session.color : "text-foreground"}`}>{session.name}</div>
                            <div className="text-xs text-muted-foreground">{session.city}</div>
                            {!open && (
                                <div className="text-[10px] text-muted-foreground mt-1.5 font-mono">
                                    {hoursUntilOpen(session, utcHour, utcMin)}
                                </div>
                            )}
                            {open && (
                                <div className="text-[10px] text-emerald-400 mt-1.5 font-mono">
                                    Closes {String(session.closeUTC).padStart(2, "0")}:00 UTC
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Session overlap indicator */}
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                {openCount >= 2 ? (
                    <>
                        <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                        <span className="text-yellow-400 font-medium">Session Overlap Active — Highest volatility period</span>
                    </>
                ) : (
                    <>
                        <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                        <span>No session overlap currently active</span>
                    </>
                )}
            </div>
        </div>
    );
}
