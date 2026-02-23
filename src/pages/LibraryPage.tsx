
import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import { UploadBookDialog } from "@/components/library/UploadBookDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Book, Search, Filter, Download, Star, User, ChevronRight, Play, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Loading from "@/components/ui/Loading";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { BookShelf } from "@/components/library/BookShelf";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

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
    type?: 'pdf' | 'video';
}

const SHELVES = [
    { title: "The Fundamentals", category: "Psychology" }, // Mapping to existing categories for demo
    { title: "Mastering Technical Analysis", category: "Technical Analysis" },
    { title: "Smart Money Concepts", category: "Smart Money Concepts" },
    { title: "Orderflow Analysis", category: "Orderflow" },
    { title: "Market Wizards & Interviews", category: "Interviews" },
    { title: "All Collection", category: "All" }
];

export default function LibraryPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [books, setBooks] = useState<BookData[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchBooks = async () => {
        try {
            // Fetch from Supabase
            const { data: supabaseData, error } = await supabase
                .from('books')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Fetch local SMC books
            let localBooks: BookData[] = [];
            try {
                const smcResponse = await fetch('/books/smc_books.json');
                if (smcResponse.ok) {
                    const smcData = await smcResponse.json();
                    const smcBooks = smcData.map((book: any, index: number) => ({
                        id: `local-smc-${index}`,
                        ...book,
                        created_at: new Date().toISOString(),
                        downloads: 0
                    }));
                    localBooks = [...localBooks, ...smcBooks];
                }
            } catch (localError) {
                console.error('Error fetching SMC books:', localError);
            }

            // Fetch local Forex books
            try {
                const forexResponse = await fetch('/books/forex_books.json');
                if (forexResponse.ok) {
                    const forexData = await forexResponse.json();
                    const forexBooks = forexData.map((book: any, index: number) => ({
                        id: `local-forex-${index}`,
                        ...book,
                        created_at: new Date().toISOString(),
                        downloads: 0
                    }));
                    localBooks = [...localBooks, ...forexBooks];
                }
            } catch (localError) {
                console.error('Error fetching Forex books:', localError);
            }

            // Fetch Video Courses
            try {
                const coursesResponse = await fetch('/courses.json');
                if (coursesResponse.ok) {
                    const coursesData = await coursesResponse.json();
                    const videoCourses = coursesData.map((course: any, index: number) => ({
                        id: `local-course-${index}`,
                        ...course,
                        created_at: new Date().toISOString(),
                        downloads: 0,
                        type: 'video'
                    }));
                    localBooks = [...localBooks, ...videoCourses];
                }
            } catch (localError) {
                console.error('Error fetching courses:', localError);
            }

            // Merge and set books
            setBooks([...(supabaseData || []), ...localBooks]);
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

    const filteredBooks = searchQuery.trim()
        ? books.filter(b =>
            b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (b.author && b.author.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        : books;

    const getBooksByCategory = (category: string) => {
        if (category === "All") return filteredBooks;
        return filteredBooks.filter(book => book.category === category);
    };


    const handleRead = (bookId: string) => {
        navigate(`/library/read/${bookId}`);
    };

    return (
        <div className="min-h-screen bg-background pb-20 selection:bg-emerald-500/30">
            <SEO
                title="Athena Discovery Lounge"
                description="Explore the world's most advanced AI-integrated digital library for Forex trading."
            />

            {/* Hero Section: Currently Reading */}
            <section className="pt-32 pb-12 px-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-hero opacity-80" />
                <div className="container mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-12">
                        <div>
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 mb-4 hover:bg-emerald-500/20 transition-colors">
                                <Sparkles className="w-3 h-3 mr-1" />
                                Discovery Lounge
                            </Badge>
                            <h1 className="text-4xl md:text-6xl font-display font-bold mb-4 tracking-tight">
                                Welcome back, <span className="emerald-text">Trader</span>
                            </h1>
                            <p className="text-muted-foreground text-lg max-w-xl">
                                Your personal knowledge base is expanding. Continue where you left off or discover new strategies.
                            </p>
                        </div>
                        <div className="w-full md:w-auto">
                            <UploadBookDialog />
                        </div>
                    </div>

                    {/* Mock "Currently Reading" Card */}
                    <div className="card-glass p-6 md:p-8 rounded-2xl border-l-4 border-l-emerald-500 relative overflow-hidden group cursor-pointer transition-all hover:shadow-emerald">
                        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="flex flex-col md:flex-row gap-6 items-center">
                            <div className="w-24 h-32 md:w-32 md:h-48 bg-secondary rounded shadow-2xl flex-shrink-0 relative overflow-hidden">
                                {/* Placeholder Cover */}
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black flex items-center justify-center">
                                    <Book className="w-8 h-8 text-emerald-500/50" />
                                </div>
                            </div>
                            <div className="flex-grow space-y-4 w-full">
                                <div>
                                    <div className="text-xs font-mono text-emerald-500 mb-1 uppercase tracking-widest">Currently Reading</div>
                                    <h2 className="text-2xl md:text-3xl font-bold font-display text-white">Trading in the Zone</h2>
                                    <p className="text-muted-foreground">Mark Douglas</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-muted-foreground font-mono">
                                        <span>Chapter 4: The Consistency State of Mind</span>
                                        <span>42%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 w-[42%] shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                    </div>
                                </div>
                                <Button className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-full px-8" onClick={() => toast.info("Resuming reading...")}>
                                    <Play className="w-4 h-4 mr-2 fill-current" />
                                    Continue Reading
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Smart Search */}
            <section className="px-4 mb-16 relative z-20 -mt-8">
                <div className="container mx-auto">
                    <div className="relative max-w-2xl mx-auto">
                        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                        <div className="relative bg-card border border-border/50 rounded-xl shadow-2xl flex items-center p-2">
                            <Search className="w-5 h-5 text-muted-foreground ml-3 mr-3" />
                            <Input
                                placeholder="Search by title, author, or concept (e.g. 'Fibonacci retracement')..."
                                className="border-0 bg-transparent focus-visible:ring-0 text-lg placeholder:text-muted-foreground/50 h-12"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <div className="hidden md:flex gap-2 mr-2">
                                <Badge variant="secondary" className="font-mono text-[10px] text-muted-foreground">CMD+K</Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Shelves */}
            <div className="space-y-16 pb-20 container mx-auto px-4">
                {SHELVES.map((shelf) => {
                    const shelfBooks = getBooksByCategory(shelf.category);
                    if (shelf.category !== "All" && shelfBooks.length === 0) return null;

                    return (
                        <BookShelf
                            key={shelf.title}
                            title={shelf.title}
                            books={shelfBooks}
                            loading={loading}
                            onBookClick={handleRead}
                        />
                    );
                })}
            </div>
        </div>
    );
}
