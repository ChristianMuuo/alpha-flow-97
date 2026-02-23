import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Book } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface BookShelfProps {
    title: string;
    books: any[];
    loading: boolean;
    onBookClick: (bookId: string) => void;
}

export const BookShelf = ({ title, books, loading, onBookClick }: BookShelfProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    useEffect(() => {
        checkScroll();
        const scrollElement = scrollRef.current;
        if (scrollElement) {
            scrollElement.addEventListener('scroll', checkScroll);
            return () => scrollElement.removeEventListener('scroll', checkScroll);
        }
    }, [books]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 800; // ~4 books
            const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
            scrollRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    };

    return (
        <section
            className="space-y-6 relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-display font-bold flex items-center gap-2">
                    <span className="w-1 h-6 bg-emerald-500 rounded-full" />
                    {title}
                </h3>
                <Button variant="ghost" className="text-emerald-500 hover:text-emerald-400 group">
                    View All <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
            </div>

            <div className="relative group">
                {/* Left Arrow */}
                {canScrollLeft && isHovered && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => scroll('left')}
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-black/80 hover:bg-black/90 border border-emerald-500/20 hover:border-emerald-500/50 text-emerald-400 hover:text-emerald-300 shadow-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                )}

                {/* Right Arrow */}
                {canScrollRight && isHovered && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => scroll('right')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-black/80 hover:bg-black/90 border border-emerald-500/20 hover:border-emerald-500/50 text-emerald-400 hover:text-emerald-300 shadow-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </Button>
                )}

                <ScrollArea className="w-full whitespace-nowrap rounded-md">
                    <div ref={scrollRef} className="flex w-max space-x-6 pb-8 pt-2 pl-1">
                        {loading ? (
                            Array(4).fill(0).map((_, i) => (
                                <div key={i} className="w-[200px] h-[300px] bg-secondary/30 rounded-lg animate-pulse" />
                            ))
                        ) : books.length > 0 ? (
                            books.map((book) => (
                                <div
                                    key={book.id}
                                    className="w-[200px] group/book flex flex-col gap-3 cursor-pointer"
                                    onClick={() => onBookClick(book.id)}
                                >
                                    <div className="aspect-[2/3] relative rounded-lg overflow-hidden shadow-lg transition-transform duration-300 group-hover/book:-translate-y-2 group-hover/book:shadow-emerald-500/20 border border-border/50 bg-card">
                                        {book.cover_url ? (
                                            <img
                                                src={book.cover_url}
                                                alt={book.title}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-secondary/20 p-4 text-center">
                                                <Book className="w-8 h-8 text-muted-foreground/30 mb-2" />
                                                <span className="text-xs text-muted-foreground/50 font-mono">{book.title.substring(0, 20)}...</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover/book:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                            <Button size="sm" variant="emerald" className="w-full h-8 text-xs">Read Now</Button>
                                        </div>
                                    </div>
                                    <div className="space-y-1 whitespace-normal">
                                        <h4 className="font-bold text-sm leading-tight text-balance hover:text-emerald-400 transition-colors line-clamp-2">{book.title}</h4>
                                        <p className="text-xs text-muted-foreground">{book.author}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex items-center justify-center w-full min-w-[300px] h-32 text-muted-foreground border border-dashed border-border/50 rounded-lg">
                                No books in this shelf yet.
                            </div>
                        )}
                    </div>
                    <ScrollBar orientation="horizontal" className="hidden" />
                </ScrollArea>
            </div>
        </section>
    );
};
