
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SEO from "@/components/SEO";
import { Calendar, User, Clock, ArrowLeft, Share2, Twitter, Facebook, Linkedin } from "lucide-react";
import { blogPosts } from "./BlogPage";
import NotFound from "./NotFound";

const BlogPostPage = () => {
    const { slug } = useParams();
    const post = blogPosts.find(p => p.slug === slug);

    if (!post) {
        return <NotFound />;
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <SEO
                title={post.title}
                description={post.excerpt}
                image={post.image}
                type="article"
            />

            {/* Hero Header */}
            <div className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
                </div>

                <div className="container mx-auto px-4 h-full flex flex-col justify-end relative z-10 pb-12">
                    <Link to="/blog">
                        <Button variant="ghost" size="sm" className="mb-6 hover:bg-background/20 text-white">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Blog
                        </Button>
                    </Link>

                    <Badge className="bg-indigo-500 text-white border-none mb-6 w-fit">
                        {post.category}
                    </Badge>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 max-w-4xl text-white">
                        {post.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 text-white/80">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white">
                                {post.author.charAt(0)}
                            </div>
                            <span className="font-medium text-white">{post.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {post.date}
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {post.readTime}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Main Content */}
                <div className="lg:col-span-8">
                    <div className="prose prose-invert prose-lg max-w-none
                        [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-foreground
                        [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-foreground
                        [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_p]:mb-6
                        [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-6 [&_ul_li]:text-muted-foreground [&_ul_li]:mb-2
                        [&_blockquote]:border-l-4 [&_blockquote]:border-indigo-500 [&_blockquote]:pl-6 [&_blockquote]:italic [&_blockquote]:text-indigo-300 [&_blockquote]:my-8 [&_blockquote]:text-lg
                        [&_strong]:text-foreground [&_strong]:font-semibold
                        [&_em]:text-indigo-300">
                        <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                            {post.excerpt}
                        </p>
                        <div dangerouslySetInnerHTML={{ __html: post.content }} />
                    </div>

                    {/* Share Section */}
                    <div className="mt-12 pt-8 border-t border-border/50">
                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                            <Share2 className="w-4 h-4" /> Share this article
                        </h4>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="gap-2">
                                <Twitter className="w-4 h-4 text-sky-500" /> Twitter
                            </Button>
                            <Button variant="outline" size="sm" className="gap-2">
                                <Facebook className="w-4 h-4 text-blue-600" /> Facebook
                            </Button>
                            <Button variant="outline" size="sm" className="gap-2">
                                <Linkedin className="w-4 h-4 text-blue-700" /> LinkedIn
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Related Posts */}
                    <div className="bg-card border border-border/50 rounded-xl p-6">
                        <h3 className="font-bold text-xl mb-6">Related Articles</h3>
                        <div className="space-y-6">
                            {blogPosts
                                .filter(p => p.id !== post.id && p.category === post.category)
                                .slice(0, 3)
                                .map(relatedPost => (
                                    <Link key={relatedPost.id} to={`/blog/${relatedPost.slug}`} className="block group">
                                        <h4 className="font-medium group-hover:text-indigo-400 transition-colors mb-2">
                                            {relatedPost.title}
                                        </h4>
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {relatedPost.excerpt}
                                        </p>
                                    </Link>
                                ))
                            }
                            {blogPosts.filter(p => p.id !== post.id && p.category === post.category).length === 0 && (
                                <p className="text-sm text-muted-foreground">No related articles found.</p>
                            )}
                        </div>
                    </div>

                    {/* Newsletter CTA */}
                    <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Clock className="w-32 h-32" />
                        </div>
                        <h3 className="font-bold text-xl mb-3 relative z-10">Subscribe to our Newsletter</h3>
                        <p className="text-sm text-muted-foreground mb-4 relative z-10">
                            Get the latest trading insights and strategies delivered straight to your inbox.
                        </p>
                        <Button className="w-full relative z-10">Subscribe Now</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogPostPage;
