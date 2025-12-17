
import { useState } from "react";
import SEO from "@/components/SEO";
import { UploadBookDialog } from "@/components/library/UploadBookDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Book, Search, Filter, Download, Star, User } from "lucide-react";

const books = [
    {
        id: 1,
        title: "Trading in the Zone",
        author: "Mark Douglas",
        category: "Psychology",
        rating: 4.9,
        downloads: 12500,
        image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400",
    },
    {
        id: 2,
        title: "The Intelligent Investor",
        author: "Benjamin Graham",
        category: "Investing",
        rating: 4.8,
        downloads: 18200,
        image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400",
    },
    {
        id: 3,
        title: "Technical Analysis of the Financial Markets",
        author: "John J. Murphy",
        category: "Technical Analysis",
        rating: 4.9,
        downloads: 9800,
        image: "https://images.unsplash.com/photo-1611974765270-ca1258634369?auto=format&fit=crop&q=80&w=400",
    },
    {
        id: 4,
        title: "Japanese Candlestick Charting Techniques",
        author: "Steve Nison",
        category: "Technical Analysis",
        rating: 4.7,
        downloads: 8500,
        image: "https://images.unsplash.com/photo-1550399105-c4db5fb85c18?auto=format&fit=crop&q=80&w=400",
    },
    {
        id: 5,
        title: "Market Wizards",
        author: "Jack D. Schwager",
        category: "Interviews",
        rating: 4.8,
        downloads: 11000,
        image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400",
    },
    {
        id: 6,
        title: "A Random Walk Down Wall Street",
        author: "Burton G. Malkiel",
        category: "Investing",
        rating: 4.6,
        downloads: 7800,
        image: "https://images.unsplash.com/photo-1592496431122-2349e0fbc666?auto=format&fit=crop&q=80&w=400",
    },
];

const categories = ["All", "Psychology", "Technical Analysis", "Investing", "Interviews"];

export default function LibraryPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    const filteredBooks = books.filter((book) => {
        const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.author.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All" || book.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredBooks.map((book) => (
                            <div key={book.id} className="group bg-card border border-border/50 rounded-xl overflow-hidden hover:border-emerald-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 flex flex-col">
                                <div className="aspect-[2/3] relative overflow-hidden bg-secondary/30">
                                    <img
                                        src={book.image}
                                        alt={book.title}
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-2 right-2">
                                        <Badge className="bg-background/80 backdrop-blur-md text-foreground">
                                            {book.category}
                                        </Badge>
                                    </div>
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                                        <Button variant="emerald" className="w-full">Download</Button>
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
                                            {book.rating}
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
                            <p>No books found matching your criteria.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
