
import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import { UploadBookDialog } from "@/components/library/UploadBookDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Book, Search, Filter, Download, Star, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Loading from "@/components/ui/Loading";

interface BookData {
    id: string;
    title: string;
    author: string;
    category: string;
    description: string | null;
    file_url: string;
    cover_url: string | null;
    downloads: number;
    created_at: string;
}

const categories = ["All", "Psychology", "Technical Analysis", "Investing", "Interviews"];

export default function LibraryPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [books, setBooks] = useState<BookData[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchBooks = async () => {
        try {
            const { data, error } = await supabase
                .from('books')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setBooks(data || []);
        } catch (error: any) {
            console.error('Error fetching books:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooks();

        const channel = supabase
            .channel('public:books')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'books' }, (payload) => {
                setBooks((current) => [payload.new as BookData, ...current]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const filteredBooks = books.filter((book) => {
        const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.author.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All" || book.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleDownload = (book: BookData) => {
        window.open(book.file_url, '_blank');
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            <SEO
                title="Traders Library - Free Trading Books"
                description="Access a vast collection of trading books, resources, and educational materials uploaded by the community."
            />

            {/* Hero Section */}
            <section className="pt-32 pb-16 px-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent" />
                <div className="container mx-auto relative z-10 text-center">
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 mb-6">
                        <Book className="w-3 h-3 mr-1" />
                        Knowledge Base
                    </Badge>
                    <h1 className="text-5xl md:text-6xl font-bold mb-6">
                        <span className="text-foreground">Traders</span>{" "}
                        <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                            Library
                        </span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                        Expand your trading knowledge with our curated collection of books and resources.
                    </p>
                    <div className="flex justify-center">
                        <UploadBookDialog />
                    </div>
                </div>
            </section>

            {/* Search & Filter */}
            <section className="py-8 px-4 border-y border-border/50 sticky top-16 z-30 bg-background/80 backdrop-blur-md">
                <div className="container mx-auto">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search books or authors..."
                                className="pl-10 bg-secondary/50 border-border/50"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
                            {categories.map((cat) => (
                                <Button
                                    key={cat}
                                    variant={selectedCategory === cat ? "emerald" : "outline"}
                                    size="sm"
                                    onClick={() => setSelectedCategory(cat)}
                                    className="whitespace-nowrap"
                                >
                                    {cat}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Book Grid */}
            <section className="py-12 px-4">
                <div className="container mx-auto">
                    {loading ? (
                        <Loading />
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredBooks.map((book) => (
                                    <div key={book.id} className="group bg-card border border-border/50 rounded-xl overflow-hidden hover:border-emerald-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 flex flex-col">
                                        <div className="aspect-[2/3] relative overflow-hidden bg-secondary/30">
                                            {book.cover_url ? (
                                                <img
                                                    src={book.cover_url}
                                                    alt={book.title}
                                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-secondary/50">
                                                    <Book className="w-16 h-16 text-muted-foreground opacity-20" />
                                                </div>
                                            )}
                                            <div className="absolute top-2 right-2">
                                                <Badge className="bg-background/80 backdrop-blur-md text-foreground">
                                                    {book.category}
                                                </Badge>
                                            </div>
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                                                <Button variant="emerald" className="w-full" onClick={() => handleDownload(book)}>Download</Button>
                                            </div>
                                        </div>

                                        <div className="p-4 flex-grow flex flex-col">
                                            <h3 className="font-bold text-lg mb-1 line-clamp-1" title={book.title}>{book.title}</h3>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                                <User className="w-3 h-3" />
                                                {book.author}
                                            </div>

                                            <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/50">
                                                <div className="flex items-center gap-1 text-yellow-400">
                                                    <Star className="w-3 h-3 fill-current" />
                                                    5.0
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Download className="w-3 h-3" />
                                                    {book.downloads.toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {filteredBooks.length === 0 && (
                                <div className="text-center py-20 text-muted-foreground">
                                    <Book className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No books found. Be the first to upload one!</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>
        </div>
    );
}
