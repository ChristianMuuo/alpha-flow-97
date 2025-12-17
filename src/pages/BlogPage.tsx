
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SEO from "@/components/SEO";
import { Calendar, User, ArrowRight, Clock } from "lucide-react";

export const blogPosts = [
    {
        id: 1,
        title: "Top 5 Forex Trading Strategies for 2024",
        slug: "top-5-forex-trading-strategies-2024",
        excerpt: "Discover the most effective trading strategies that are dominating the market this year. From smart money concepts to algorithmic scalping.",
        content: "Full content would go here...",
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
        content: "Full content would go here...",
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
        content: "Full content would go here...",
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
        content: "Full content would go here...",
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
        content: "Full content would go here...",
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
        content: "Full content would go here...",
        author: "Sarah Chen",
        date: "May 03, 2024",
        readTime: "5 min read",
        category: "Analysis",
        image: "https://images.unsplash.com/photo-1526304640152-d4646bd4f520?auto=format&fit=crop&q=80&w=800",
    }
];

const BlogPage = () => {
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
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Expert analysis, educational guides, and the latest news from the world of algorithmic trading.
                    </p>
                </div>
            </section>

            {/* Blog Grid */}
            <section className="py-12 px-4">
                <div className="container mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogPosts.map((post) => (
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
                </div>
            </section>
        </div>
    );
};

export default BlogPage;
