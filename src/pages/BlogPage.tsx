
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SEO from "@/components/SEO";
import { Calendar, User, ArrowRight, Clock, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export const blogPosts = [
    {
        id: 1,
        title: "Top 5 Forex Trading Strategies for 2024",
        slug: "top-5-forex-trading-strategies-2024",
        excerpt: "Discover the most effective trading strategies that are dominating the market this year. From smart money concepts to algorithmic scalping.",
        content: `<p>The forex market in 2024 is more dynamic than ever. With the rise of algorithmic trading and institutional-grade retail tools, the edge has shifted dramatically toward traders who understand the <strong>why</strong> behind price moves — not just the what.</p>

<h2>1. Smart Money Concepts (SMC)</h2>
<p>Smart Money Concepts has taken the retail trading world by storm. The strategy centres on identifying order blocks — areas on the chart where institutions previously placed large buy or sell orders — and trading in alignment with those hidden institutional footprints. Key tools include Break of Structure (BOS), Change of Character (CHoCH), and Fair Value Gaps (FVGs).</p>
<p>The key discipline is patience: you wait for price to manipulate liquidity (stop hunts) before entering on the return to the origin of the move. A valid SMC setup typically has a higher risk-to-reward ratio of 1:3 or greater.</p>

<h2>2. VWAP-Based Institutional Scalping</h2>
<p>The Volume Weighted Average Price (VWAP) is the bread and butter of institutional desks. Retail traders who learn to treat VWAP as a dynamic support/resistance magnet — especially during the London and New York opens — gain a significant statistical edge. Look for mean reversion plays when price deviates more than 1 standard deviation from VWAP.</p>

<h2>3. ICT Killzone Reversals</h2>
<p>The Inner Circle Trader methodology identifies high-probability reversal windows known as Killzones. These correspond to the overlap periods of major market sessions: London Open (2–5am EST), New York Open (7–10am EST), and the London Close (10am–12pm EST). During these windows, price frequently sweeps liquidity from the previous session's highs or lows before reversing sharply.</p>

<h2>4. News-Catalysed Momentum</h2>
<p>High-impact economic events — Non-Farm Payrolls, FOMC rate decisions, CPI prints — create some of the most explosive, cleanest directional moves in the forex market. The strategy is not to trade the news itself, but the <em>second move</em>: after the initial spike fades and liquidity is swept, a clean directional impulse often follows. This approach requires a fast execution platform and tight discipline on position sizing.</p>

<h2>5. Multi-Timeframe Confluence Swing Trading</h2>
<p>Swing trading using confluent signals across three timeframes (Monthly trend direction, Daily structure, 4-Hour entry) provides a robust framework for capturing significant 100–500 pip moves. The rule of thumb: trade only in the direction of the higher-timeframe trend, enter on a Daily break of structure, and use the 4H for a precise entry on a retest of the broken level.</p>

<blockquote>"A strategy without edge is just gambling with extra steps. Define your edge, backtest it, and execute with mechanical discipline."</blockquote>

<p>Whichever strategy you adopt, the universal truth remains: risk management is the amplifier, not the strategy itself. Cap risk per trade at 1–2% of capital, keep a trade journal, and review your data monthly.</p>`,
        author: "Alex Morgan",
        date: "May 15, 2024",
        readTime: "8 min read",
        category: "Strategy",
        image: "https://images.unsplash.com/photo-1611974765270-ca1258634369?auto=format&fit=crop&q=80&w=800",
    },
    {
        id: 2,
        title: "Understanding Order Blocks and Liquidity",
        slug: "understanding-order-blocks-liquidity",
        excerpt: "Master the art of institutional trading by learning how to identify valid order blocks and liquidity voids on your charts.",
        content: `<p>Order blocks and liquidity are the twin pillars of institutional price delivery. Understanding them transforms the way you read a chart — instead of seeing random candlestick patterns, you begin to see a narrative: institutions building positions, manipulating retail traders, and then delivering price to their targets.</p>

<h2>What Is an Order Block?</h2>
<p>An order block is the last opposing candle before an impulsive, displacement move. When a bank or hedge fund needs to fill a large order, they cannot do it all at once — the market would move against them. Instead, they accumulate over time, leaving a footprint on the chart. That footprint is the order block.</p>
<p>A valid bullish order block is the last bearish (down) candle before a strong bullish move that breaks market structure. Price frequently returns to these zones to fill remaining institutional orders before continuing its original direction.</p>

<h2>Types of Liquidity</h2>
<p>Liquidity in the forex context refers to clusters of stop-loss orders sitting above obvious highs and below obvious lows. There are two primary types:</p>
<ul>
<li><strong>Buy-Side Liquidity (BSL):</strong> Resting above swing highs, equal highs, or trendline highs. These are the stop-losses of short sellers.</li>
<li><strong>Sell-Side Liquidity (SSL):</strong> Resting below swing lows, equal lows, or trendline lows. These are the stop-losses of long buyers.</li>
</ul>
<p>Institutional algorithms are specifically programmed to seek out these liquidity pools, sweep them to trigger the stops, absorb the resulting orders, and then reverse price in the opposite direction. This is commonly called a "liquidity grab" or "stop hunt."</p>

<h2>Fair Value Gaps (Imbalances)</h2>
<p>A Fair Value Gap (FVG) occurs when price moves so rapidly in one direction that it creates a three-candle imbalance — the wicks of the first and third candles do not overlap. These gaps represent inefficient price delivery that the market tends to revisit and "fill." FVGs within or at the boundary of an order block create the highest-probability trade entries.</p>

<h2>The Complete Entry Framework</h2>
<p>A textbook SMC entry works as follows: (1) Identify the higher-timeframe trend and bias. (2) Wait for price to sweep a liquidity pool (stop hunt). (3) Observe a Break of Structure in the opposite direction on a lower timeframe. (4) Identify the last order block before the move. (5) Enter when price retraces into the order block, ideally overlapping with an FVG. (6) Place stop below the order block's low.</p>

<blockquote>"The market is a mechanism for transferring money from the impatient to the patient — and from the uninformed to those who understand liquidity."</blockquote>

<p>Practise identifying order blocks and liquidity pools on historical charts before risking live capital. Mark your zones, note how price reacts, and refine your criteria. Within 200 hours of deliberate chart study, pattern recognition becomes instinctive.</p>`,
        author: "Sarah Chen",
        date: "May 12, 2024",
        readTime: "12 min read",
        category: "Education",
        image: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&q=80&w=800",
    },
    {
        id: 3,
        title: "The Rise of AI in Algorithmic Trading",
        slug: "rise-of-ai-algorithmic-trading",
        excerpt: "How machine learning and artificial intelligence are reshaping the landscape of automated trading systems.",
        content: `<p>Artificial intelligence has moved from science fiction to the trading floor in less than a decade. Today, it's estimated that over 70% of all forex and equity volume is generated by algorithmic systems — and an increasing share of those algorithms leverage machine learning at their core.</p>

<h2>From Rule-Based to Adaptive Systems</h2>
<p>Traditional Expert Advisors (EAs) operated on fixed, hand-coded rules: "If RSI drops below 30 and price is above the 200 EMA, go long." These systems worked in the market conditions they were built for, but broke down when the market regime changed. Machine learning changes this dynamic fundamentally — instead of hard-coding rules, you train a model on historical price action data and let it discover the rules itself.</p>

<h2>Reinforcement Learning in Live Markets</h2>
<p>Reinforcement Learning (RL) is the most promising ML paradigm for trading. An RL agent interacts with a simulated market environment, receiving rewards for profitable actions and penalties for losses. Over millions of simulated trades, it develops a policy — a map from market state to optimal action — that generalises beyond the training data. Firms like Two Sigma and Renaissance Technologies have been running RL-adjacent strategies for years.</p>

<h2>Natural Language Processing for Sentiment</h2>
<p>News sentiment is one of the most powerful and least-saturated alpha sources in retail trading. NLP models trained on financial news can quantify market sentiment in real time — assigning a bullish or bearish score to each headline, FOMC statement, or geopolitical event within milliseconds of publication. This data can then feed directly into an EA's decision logic to change its bias dynamically.</p>

<h2>Practical AI Tools for Retail Traders</h2>
<p>You don't need a PhD to leverage AI in your trading. Several accessible tools have emerged:</p>
<ul>
<li><strong>TensorFlow / PyTorch:</strong> Build and train custom price prediction models using Python.</li>
<li><strong>LLM-powered analysis:</strong> Use large language models to summarise market news and generate structured trade ideas.</li>
<li><strong>AutoML platforms:</strong> Services like Google AutoML or H2O.ai can train predictive models without hand-crafting architecture.</li>
<li><strong>Vector databases:</strong> Store and retrieve historical market patterns using embedding similarity search — allowing a system to find "situations like this" from thousands of historical instances.</li>
</ul>

<h2>The Risk: Overfitting and Curve Fitting</h2>
<p>The greatest danger in ML-based trading is overfitting — building a model that perfectly explains historical data but has zero predictive power on unseen data. Always use walk-forward optimisation, out-of-sample testing across multiple market regimes, and Monte Carlo simulations to validate robustness before going live.</p>

<blockquote>"An AI that can perfectly predict the past is not an AI that can trade the future. The market is non-stationary — what worked five years ago may be arbitraged away today."</blockquote>`,
        author: "Marcus Johnson",
        date: "May 10, 2024",
        readTime: "6 min read",
        category: "Technology",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800",
    },
    {
        id: 4,
        title: "Risk Management: The Holy Grail of Trading",
        slug: "risk-management-holy-grail",
        excerpt: "Why position sizing and risk-to-reward ratios are more important than your win rate. A deep dive into capital preservation.",
        content: `<p>Every successful trader eventually arrives at the same realisation: the strategy matters far less than how you manage risk around it. A trader with a 40% win rate and a consistent 1:3 risk-to-reward ratio is statistically more profitable than a trader with a 70% win rate gunning for 1:1 rewards. The mathematics of expectancy cannot be argued with.</p>

<h2>Expectancy: The Only Metric That Matters</h2>
<p>Expectancy is calculated as: <strong>E = (Win Rate × Avg Win) – (Loss Rate × Avg Loss)</strong>. A positive expectancy means the strategy makes money over a large sample of trades. A negative expectancy means no amount of discipline can save it long-term. Calculate your expectancy before you risk a single dollar on any new strategy.</p>

<h2>Position Sizing: The Kelly Criterion</h2>
<p>The Kelly Criterion is a mathematical formula for calculating the optimal fraction of your capital to risk on any given trade: <strong>f* = (bp – q) / b</strong>, where b is the odds received, p is the probability of winning, and q is the probability of losing. Most professional traders use a half-Kelly or quarter-Kelly to reduce variance while still compounding aggressively.</p>
<p>In practical terms: if your strategy has a 55% win rate and a 1:1.5 RR, the Kelly formula suggests risking around 3–5% per trade. Most retail traders cap this at 1–2% to account for variance and psychological resilience.</p>

<h2>The Maximum Drawdown Framework</h2>
<p>Define your maximum acceptable drawdown before you begin trading. Most professional prop firms require traders to stay within a 10% drawdown limit. Build your position sizing model backwards from this constraint: if your maximum drawdown is 10%, and you expect no more than 5 consecutive losing trades, you can solve for the maximum risk per trade that keeps you within that constraint.</p>

<h2>Correlation Risk</h2>
<p>Never ignore correlation. Running simultaneous long positions on EURUSD, GBPUSD, and AUDUSD is not three separate trades — it's one trade with 3x the position size, because all three pairs are heavily correlated with USD weakness. Always map your portfolio for currency correlation and net exposure before entering any trade.</p>

<h2>The Psychology of Drawdowns</h2>
<p>Even perfect risk management won't protect you from your own psychology during a losing streak. Develop a concrete circuit-breaker protocol: if you hit 3 losses in a single day, stop trading for that day. If you hit 5% drawdown in a week, reduce position size by 50% for the following week. Rules like these keep you in the game long enough for edge to express itself over a statistically significant sample.</p>

<blockquote>"Risk management isn't about avoiding losses — it's about ensuring that no single event, or series of events, can remove you from the game permanently."</blockquote>

<p>The traders who consistently compound capital year after year are not the ones with the best entries. They're the ones who are still trading — because they never blew up.</p>`,
        author: "Alex Morgan",
        date: "May 08, 2024",
        readTime: "10 min read",
        category: "Psychology",
        image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=800",
    },
    {
        id: 5,
        title: "Prop Firm Challenge: A Step-by-Step Guide",
        slug: "prop-firm-challenge-guide",
        excerpt: "Navigate the complexities of prop firm challenges. Tips and tricks to pass your evaluation and get funded.",
        content: `<p>Getting funded by a proprietary trading firm is one of the fastest ways to scale your forex trading career without risking your own capital. But prop firm challenges are specifically designed to filter out undisciplined traders — and the statistics bear this out: fewer than 10% of challenge participants successfully pass Phase 1. Here's how to be in that 10%.</p>

<h2>Understanding the Challenge Structure</h2>
<p>Most prop firms use a two-phase evaluation model. <strong>Phase 1</strong> typically requires you to reach a 10% profit target within 30 days, with a 5% daily loss limit and a 10% maximum drawdown. <strong>Phase 2</strong> usually has a lower profit target (5–8%) with the same loss limits but over 60 days. Pass both and you receive a funded account — typically ranging from $10,000 to $200,000.</p>

<h2>The Fatal Mistakes Traders Make</h2>
<ul>
<li><strong>Trading too aggressively early:</strong> Many traders rush toward the profit target in the first week, increasing position sizes, and blow the daily loss limit in a single bad session.</li>
<li><strong>Trading during high-impact news:</strong> A single news candle can wipe 2–3% of a small account instantly. Avoid trading in the 5-minute window before and after FOMC, NFP, and CPI releases.</li>
<li><strong>Ignoring the daily drawdown rule:</strong> The maximum daily loss is calculated from the previous day's equity peak — not your account starting balance. As your account grows, so does your absolute risk ceiling. Many traders fail to update their position sizes to respect this.</li>
<li><strong>Overleveraging out of frustration:</strong> A slow week leads to impatience, which leads to oversizing, which leads to failure. The challenge rewards discipline, not aggression.</li>
</ul>

<h2>The Optimal Approach</h2>
<p>Set a conservative daily target of 0.5% per day. At this pace, with a 60-day timeline, you'll reach the 10% target by day 20 while keeping daily risk at 1%. This gives you enormous psychological breathing room and removes time pressure entirely. Trade only your highest-conviction setups — typically 1–3 trades per day maximum.</p>

<h2>Choosing the Right Firm</h2>
<p>Not all prop firms are created equal. Key criteria to evaluate: (1) Payout structure — look for at least 80% profit split. (2) Consistency rules — some firms penalise you for making more than 30% of your total profit in a single day. (3) Scaling plan — will they increase your capital as you prove consistency? (4) Platform — MT4/MT5 or a proprietary platform? (5) Customer support responsiveness.</p>

<blockquote>"A prop firm challenge doesn't test whether you can make money — it tests whether you can make money without losing control. That's a different skill entirely."</blockquote>

<p>Simulate the challenge for 30 days on a demo account with identical parameters before purchasing an evaluation. Only buy your first challenge when you can consistently hit the targets on demo without triggering loss limits. Approach it as a proof of concept, not a lottery ticket.</p>`,
        author: "David Wilson",
        date: "May 05, 2024",
        readTime: "15 min read",
        category: "Prop Firms",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
    },
    {
        id: 6,
        title: "Weekly Market Outlook: EURUSD & Gold",
        slug: "weekly-market-outlook-may-2024",
        excerpt: "Technical analysis and key levels to watch for the upcoming week in major currency pairs and commodities.",
        content: `<p>As we head into the third week of May 2024, markets remain gripped by two dominant themes: the Federal Reserve's higher-for-longer interest rate narrative, and continued geopolitical risk premium in precious metals. Here is a structured breakdown of the key technical levels and scenarios for the week ahead.</p>

<h2>EURUSD — Bearish Bias Below 1.0850</h2>
<p>The EURUSD remains in a broader downtrend on the Daily chart, with the pair having recently broken below a critical support confluence at 1.0785 — a clean area of previous structure and a Daily FVG that failed to hold as support. The immediate path of least resistance is lower.</p>
<p><strong>Key Levels to Watch:</strong></p>
<ul>
<li><strong>Resistance:</strong> 1.0810–1.0825 (broken support now acting as resistance, plus a 4H FVG). A rejection here would be a high-probability sell entry targeting 1.0720.</li>
<li><strong>Support:</strong> 1.0720 (September 2023 swing low) and 1.0650 (major Daily order block).</li>
<li><strong>Invalidation:</strong> A Daily close above 1.0865 shifts bias neutral-to-bullish.</li>
</ul>
<p>Macro catalyst to watch: Friday's flash PMI data for the Eurozone and US could provide a directional catalyst on the pair.</p>

<h2>XAUUSD (Gold) — Consolidating After All-Time High</h2>
<p>Gold spent the prior week consolidating after printing a fresh all-time high above $2,430. The demand for safe-haven assets remains elevated due to ongoing Middle East tensions and central bank buying (particularly from China and India, which have been aggressively accumulating gold reserves).</p>
<p><strong>Key Levels to Watch:</strong></p>
<ul>
<li><strong>Support Zone:</strong> $2,290–$2,310 (major Daily order block and 0.618 Fibonacci retracement from the recent leg up). This is a potential buy zone for swing traders with a target back toward $2,430+.</li>
<li><strong>Resistance:</strong> $2,430 all-time high. A confirmed Daily close above this level opens up a measured move to $2,500+.</li>
<li><strong>Bearish scenario:</strong> A break and close below $2,270 on the Daily would suggest a deeper correction toward $2,145.</li>
</ul>

<h2>GBPUSD — Watching BoE Dovish Shift</h2>
<p>Sterling faces headwinds from growing expectations that the Bank of England will begin a rate-cutting cycle ahead of the Fed. The currency has struggled to hold above 1.2600, and structure on the Daily chart remains bearish. Look for short opportunities on rallies toward the 1.2640–1.2680 supply zone, targeting 1.2450.</p>

<blockquote>"The weekly outlook sets the stage — but it is intraday price action during the Killzones that provides the precise entry. Know your levels, then wait for confirmation."</blockquote>

<p>Always trade the levels, not the prediction. Price may or may not reach the identified zones within the week — and that's perfectly fine. The edge lies in the reaction <em>at</em> the level, not in predicting when it will arrive.</p>`,
        author: "Sarah Chen",
        date: "May 03, 2024",
        readTime: "5 min read",
        category: "Analysis",
        image: "https://images.unsplash.com/photo-1526304640152-d4646bd4f520?auto=format&fit=crop&q=80&w=800",
    }
];

const ALL_CATEGORIES = "All";
const categories = [ALL_CATEGORIES, ...Array.from(new Set(blogPosts.map(p => p.category)))];

const BlogPage = () => {
    const [activeCategory, setActiveCategory] = useState(ALL_CATEGORIES);
    const [searchQuery, setSearchQuery] = useState("");

    const filtered = blogPosts.filter(post => {
        const matchesCategory = activeCategory === ALL_CATEGORIES || post.category === activeCategory;
        const q = searchQuery.toLowerCase();
        const matchesSearch = !q || post.title.toLowerCase().includes(q) || post.excerpt.toLowerCase().includes(q) || post.author.toLowerCase().includes(q);
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-background">
            <SEO
                title="Blog - Trading Insights & Education"
                description="Expert articles on forex trading strategies, market analysis, and prop firm guides."
            />

            {/* Hero Section */}
            <section className="pt-32 pb-16 px-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent" />
                <div className="container mx-auto relative z-10 text-center">
                    <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 mb-6">
                        Latest Updates
                    </Badge>
                    <h1 className="text-5xl md:text-6xl font-bold mb-6">
                        <span className="text-foreground">Trading</span>{" "}
                        <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            Insights
                        </span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                        Expert analysis, educational guides, and the latest news from the world of algorithmic trading.
                    </p>

                    {/* Search Bar */}
                    <div className="relative max-w-md mx-auto mb-10">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search articles..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border/50 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
                        />
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex flex-wrap justify-center gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${activeCategory === cat
                                        ? "bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                                        : "bg-card border-border/50 text-muted-foreground hover:border-indigo-500/50 hover:text-indigo-400"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Blog Grid */}
            <section className="py-12 px-4">
                <div className="container mx-auto">
                    {filtered.length === 0 ? (
                        <div className="text-center py-20 text-muted-foreground">
                            <p className="text-lg">No articles found for <strong className="text-foreground">"{searchQuery}"</strong>.</p>
                            <button onClick={() => { setSearchQuery(""); setActiveCategory(ALL_CATEGORIES); }} className="mt-4 text-indigo-400 underline text-sm">Clear filters</button>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filtered.map((post) => (
                                <Link
                                    key={post.id}
                                    to={`/blog/${post.slug}`}
                                    className="group bg-card border border-border/50 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10"
                                >
                                    <div className="aspect-video relative overflow-hidden">
                                        <img
                                            src={post.image}
                                            alt={post.title}
                                            className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute top-4 left-4">
                                            <Badge className="bg-background/80 backdrop-blur-md text-foreground hover:bg-background">
                                                {post.category}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {post.date}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {post.readTime}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold mb-3 group-hover:text-indigo-400 transition-colors line-clamp-2">
                                            {post.title}
                                        </h3>

                                        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                                            {post.excerpt}
                                        </p>

                                        <div className="flex items-center justify-between pt-4 border-t border-border/50">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <User className="w-4 h-4" />
                                                {post.author}
                                            </div>
                                            <span className="text-indigo-400 text-sm font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                                Read More <ArrowRight className="w-4 h-4" />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default BlogPage;
