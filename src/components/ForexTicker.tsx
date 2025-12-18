import { useEffect, useRef } from 'react';

const ForexTicker = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (!containerRef.current || scriptLoaded.current) return;

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: "FX:EURUSD", title: "EUR/USD" },
        { proName: "FX:GBPUSD", title: "GBP/USD" },
        { proName: "FX:USDJPY", title: "USD/JPY" },
        { proName: "FX:AUDUSD", title: "AUD/USD" },
        { proName: "FX:USDCAD", title: "USD/CAD" },
        { proName: "OANDA:XAUUSD", title: "Gold" },
        { proName: "BITSTAMP:BTCUSD", title: "BTC/USD" }
      ],
      showSymbolLogo: true,
      isTransparent: true,
      displayMode: "adaptive",
      colorTheme: "dark",
      locale: "en"
    });

    containerRef.current.appendChild(script);
    scriptLoaded.current = true;

    return () => {
      scriptLoaded.current = false;
    };
  }, []);

  return (
    <div className="tradingview-widget-container border-y border-border/30 bg-card/30 backdrop-blur-sm w-full max-w-full overflow-hidden">
      <div ref={containerRef} className="tradingview-widget-container__widget"></div>
    </div>
  );
};

export default ForexTicker;
