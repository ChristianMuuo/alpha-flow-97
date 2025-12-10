import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface Candle {
  id: number;
  open: number;
  close: number;
  high: number;
  low: number;
  isGreen: boolean;
}

const AnimatedChart = ({ className }: { className?: string }) => {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const chartRef = useRef<HTMLDivElement>(null);

  // Generate initial candles
  useEffect(() => {
    const generateCandle = (id: number, prevClose: number): Candle => {
      const change = (Math.random() - 0.48) * 15;
      const close = Math.max(20, Math.min(80, prevClose + change));
      const open = prevClose;
      const isGreen = close > open;
      const high = Math.max(open, close) + Math.random() * 8;
      const low = Math.min(open, close) - Math.random() * 8;
      return { id, open, close, high, low, isGreen };
    };

    let initialCandles: Candle[] = [];
    let lastClose = 50;
    for (let i = 0; i < 60; i++) {
      const candle = generateCandle(i, lastClose);
      initialCandles.push(candle);
      lastClose = candle.close;
    }
    setCandles(initialCandles);

    // Add new candles periodically
    const interval = setInterval(() => {
      setCandles(prev => {
        const newId = prev.length > 0 ? prev[prev.length - 1].id + 1 : 0;
        const lastClose = prev.length > 0 ? prev[prev.length - 1].close : 50;
        const newCandle = generateCandle(newId, lastClose);
        return [...prev.slice(-59), newCandle];
      });
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (chartRef.current) {
        const rect = chartRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div 
      ref={chartRef}
      className={cn(
        "absolute inset-0 overflow-hidden opacity-30",
        className
      )}
    >
      {/* Glow effect following mouse */}
      <div 
        className="absolute w-96 h-96 rounded-full pointer-events-none transition-all duration-300 ease-out"
        style={{
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
          background: "radial-gradient(circle, hsl(160 100% 40% / 0.15), transparent 70%)",
        }}
      />

      {/* Chart Container */}
      <div className="absolute inset-0 flex items-end justify-center gap-1 px-4 pb-20">
        {candles.map((candle, index) => {
          const bodyHeight = Math.abs(candle.close - candle.open);
          const wickHeight = candle.high - candle.low;
          const bodyBottom = Math.min(candle.open, candle.close);
          const wickBottom = candle.low;
          
          return (
            <div 
              key={candle.id}
              className="relative flex flex-col items-center"
              style={{ 
                height: "100%",
                animationDelay: `${index * 0.02}s`
              }}
            >
              {/* Wick */}
              <div 
                className={cn(
                  "absolute w-px",
                  candle.isGreen ? "bg-profit/60" : "bg-loss/60"
                )}
                style={{
                  height: `${wickHeight}%`,
                  bottom: `${wickBottom}%`,
                }}
              />
              {/* Body */}
              <div 
                className={cn(
                  "absolute w-2 md:w-3 rounded-sm transition-all duration-300",
                  candle.isGreen ? "bg-profit" : "bg-loss"
                )}
                style={{
                  height: `${Math.max(bodyHeight, 2)}%`,
                  bottom: `${bodyBottom}%`,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Grid Lines */}
      <div className="absolute inset-0 pointer-events-none">
        {[20, 40, 60, 80].map(y => (
          <div 
            key={y}
            className="absolute w-full border-t border-border/20"
            style={{ top: `${100 - y}%` }}
          />
        ))}
      </div>

      {/* Price Labels */}
      <div className="absolute right-4 top-0 bottom-0 flex flex-col justify-between py-10 text-xs font-mono text-muted-foreground/50">
        <span>1.1250</span>
        <span>1.1200</span>
        <span>1.1150</span>
        <span>1.1100</span>
        <span>1.1050</span>
      </div>

      {/* Crosshair */}
      <div 
        className="absolute w-px h-full bg-primary/30 pointer-events-none transition-all duration-75"
        style={{ left: mousePosition.x }}
      />
      <div 
        className="absolute w-full h-px bg-primary/30 pointer-events-none transition-all duration-75"
        style={{ top: mousePosition.y }}
      />

      {/* Price Tag */}
      <div 
        className="absolute px-2 py-1 rounded bg-primary text-primary-foreground text-xs font-mono pointer-events-none transition-all duration-75"
        style={{ 
          right: 0,
          top: mousePosition.y - 12,
        }}
      >
        {(1.1050 + (1 - mousePosition.y / 400) * 0.02).toFixed(4)}
      </div>
    </div>
  );
};

export default AnimatedChart;