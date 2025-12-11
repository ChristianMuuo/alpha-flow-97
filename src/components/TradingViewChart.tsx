import { useEffect, useRef } from 'react';

interface TradingViewChartProps {
  symbol?: string;
  height?: number;
  theme?: 'dark' | 'light';
}

const TradingViewChart = ({ symbol = 'FX:EURUSD', height = 400, theme = 'dark' }: TradingViewChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (!containerRef.current || scriptLoaded.current) return;

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: 'D',
      timezone: 'Etc/UTC',
      theme: theme,
      style: '1',
      locale: 'en',
      enable_publishing: false,
      backgroundColor: theme === 'dark' ? 'rgba(10, 20, 18, 1)' : 'rgba(255, 255, 255, 1)',
      gridColor: theme === 'dark' ? 'rgba(30, 60, 50, 0.3)' : 'rgba(200, 200, 200, 0.3)',
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      calendar: false,
      support_host: 'https://www.tradingview.com'
    });

    containerRef.current.appendChild(script);
    scriptLoaded.current = true;

    return () => {
      scriptLoaded.current = false;
    };
  }, [symbol, theme]);

  return (
    <div className="tradingview-widget-container rounded-xl overflow-hidden border border-border/50" style={{ height }}>
      <div ref={containerRef} className="tradingview-widget-container__widget" style={{ height: '100%', width: '100%' }}></div>
    </div>
  );
};

export default TradingViewChart;
