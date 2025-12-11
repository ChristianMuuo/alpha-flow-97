import { useEffect, useRef } from 'react';

interface LiveMarketDataProps {
  symbols?: string[];
}

const LiveMarketData = ({ symbols }: LiveMarketDataProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (!containerRef.current || scriptLoaded.current) return;

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      width: "100%",
      height: "100%",
      symbolsGroups: [
        {
          name: "Forex",
          symbols: [
            { name: "FX:EURUSD", displayName: "EUR/USD" },
            { name: "FX:GBPUSD", displayName: "GBP/USD" },
            { name: "FX:USDJPY", displayName: "USD/JPY" },
            { name: "FX:AUDUSD", displayName: "AUD/USD" },
            { name: "FX:USDCAD", displayName: "USD/CAD" },
            { name: "FX:NZDUSD", displayName: "NZD/USD" }
          ]
        },
        {
          name: "Commodities",
          symbols: [
            { name: "OANDA:XAUUSD", displayName: "Gold" },
            { name: "OANDA:XAGUSD", displayName: "Silver" },
            { name: "TVC:USOIL", displayName: "Crude Oil" }
          ]
        }
      ],
      showSymbolLogo: true,
      isTransparent: true,
      colorTheme: "dark",
      locale: "en"
    });

    containerRef.current.appendChild(script);
    scriptLoaded.current = true;

    return () => {
      scriptLoaded.current = false;
    };
  }, [symbols]);

  return (
    <div className="tradingview-widget-container rounded-xl overflow-hidden border border-border/50 h-[500px]">
      <div ref={containerRef} className="tradingview-widget-container__widget h-full"></div>
    </div>
  );
};

export default LiveMarketData;
