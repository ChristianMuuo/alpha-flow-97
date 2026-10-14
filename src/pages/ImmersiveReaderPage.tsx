import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Maximize2, Minimize2, Settings, MessageSquare, Menu, Share2, Bookmark, StickyNote, TrendingUp, HelpCircle } from "lucide-react";
import { PDFReader } from "@/components/library/PDFReader";
import { AITutorSidebar } from "@/components/library/AITutorSidebar";
import BookNotesDrawer from "@/components/library/BookNotesDrawer";
import { ChartSimulatorModal } from "@/components/library/ChartSimulatorModal";
import { StrategyQuizDialog } from "@/components/library/StrategyQuizDialog";
import { motion, AnimatePresence } from "framer-motion";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";

export default function ImmersiveReaderPage() {
    const { bookId } = useParams();
    const navigate = useNavigate();
    const [isDistractionFree, setIsDistractionFree] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);
    const [showNotes, setShowNotes] = useState(false);
    const [showSimulator, setShowSimulator] = useState(false);
    const [showQuiz, setShowQuiz] = useState(false);
    const [book, setBook] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [scrollPercent, setScrollPercent] = useState(0);
    const saveTimer = useRef<any>(null);
    const { toast } = useToast();

    useEffect(() => {
        const fetchBook = async () => {
            if (!bookId) return;

            setLoading(true);
            try {
                if (bookId.startsWith('local-smc-')) {
                    // Fetch from SMC books JSON
                    const index = parseInt(bookId.replace('local-smc-', ''));
                    const response = await fetch('/books/smc_books.json');
                    if (!response.ok) throw new Error('Failed to load SMC books');

                    const books = await response.json();
                    if (books[index]) {
                        setBook({
                            id: bookId,
                            ...books[index]
                        });
                    } else {
                        throw new Error('Book not found');
                    }
                } else if (bookId.startsWith('local-forex-')) {
                    // Fetch from Forex books JSON
                    const index = parseInt(bookId.replace('local-forex-', ''));
                    const response = await fetch('/books/forex_books.json');
                    if (!response.ok) throw new Error('Failed to load Forex books');

                    const books = await response.json();
                    if (books[index]) {
                        setBook({
                            id: bookId,
                            ...books[index]
                        });
                    } else {
                        throw new Error('Book not found');
                    }
                } else if (bookId.startsWith('local-telegram-')) {
                    // Fetch from Telegram books JSON
                    const index = parseInt(bookId.replace('local-telegram-', ''));
                    const response = await fetch('/books/telegram_books.json');
                    if (!response.ok) throw new Error('Failed to load Telegram books');

                    const books = await response.json();
                    if (books[index]) {
                        setBook({
                            id: bookId,
                            ...books[index]
                        });
                    } else {
                        throw new Error('Book not found');
                    }
                } else if (bookId.startsWith('local-course-')) {
                    // Fetch from Video Courses JSON
                    const index = parseInt(bookId.replace('local-course-', ''));
                    const response = await fetch('/courses.json');
                    if (!response.ok) throw new Error('Failed to load courses');

                    const courses = await response.json();
                    if (courses[index]) {
                        setBook({
                            id: bookId,
                            ...courses[index]
                        });
                    } else {
                        throw new Error('Course not found');
                    }
                } else {
                    // Fetch from Supabase
                    const { data, error } = await supabase
                        .from('books')
                        .select('*')
                        .eq('id', bookId)
                        .single();

                    if (error) throw error;
                    setBook(data);
                }
            } catch (err: any) {
                console.error("Error fetching book:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBook();
    }, [bookId]);

    // Save reading progress to Supabase (debounced, every 30s)
    const saveProgress = React.useCallback(async (percent: number) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user || !bookId) return;
        await supabase.from('reading_progress').upsert({
            user_id: session.user.id,
            book_id: bookId,
            book_title: book?.title ?? null,
            scroll_percent: percent,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,book_id' });
        toast({ title: '📖 Progress saved', description: `${Math.round(percent)}% complete`, duration: 2000 });
    }, [bookId, book, toast]);

    // Auto-save every 30 seconds
    useEffect(() => {
        if (!book) return;
        saveTimer.current = setInterval(() => { saveProgress(scrollPercent); }, 30000);
        return () => clearInterval(saveTimer.current);
    }, [book, scrollPercent, saveProgress]);

    const handleScrollUpdate = (percent: number) => { setScrollPercent(percent); };

    const toggleDistractionFree = () => {
        setIsDistractionFree(!isDistractionFree);
        setShowSidebar(isDistractionFree); // Re-show sidebar when exiting
    };

    return (
        <div className="h-screen w-screen bg-[#0a0a0a] flex flex-col overflow-hidden text-[#e5e5e5]">
            {/* Header - Hides in Distraction Free Mode */}
            <AnimatePresence>
                {!isDistractionFree && (
                    <motion.header
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        className="h-14 border-b border-[#2a2a2a] bg-[#0a0a0a]/95 backdrop-blur flex items-center justify-between px-4 z-50 absolute w-full top-0 left-0"
                    >
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" onClick={() => navigate('/library')} className="hover:bg-white/10 text-gray-400 hover:text-white">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                            <div>
                                <h1 className="text-sm font-semibold tracking-wide text-gray-200">{book?.title || "Loading..."}</h1>
                                <p className="text-xs text-gray-500">{book?.author}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowSimulator(true)}
                                className="hidden sm:flex h-8 text-xs bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                            >
                                <TrendingUp className="w-3.5 h-3.5 mr-1" /> Practice Setup
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowQuiz(true)}
                                className="hidden sm:flex h-8 text-xs bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
                            >
                                <HelpCircle className="w-3.5 h-3.5 mr-1" /> AI Quiz
                            </Button>
                            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-yellow-400" onClick={() => { setShowNotes(!showNotes); if (!showNotes) setShowSidebar(false); }} title="Book Notes">
                                <StickyNote className={`w-4 h-4 ${showNotes ? 'text-yellow-400' : ''}`} />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white" onClick={toggleDistractionFree} title="Enter Distraction Free Mode">
                                <Maximize2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white transition-transform transform active:scale-95" onClick={() => { setShowSidebar(!showSidebar); if (!showSidebar) setShowNotes(false); }}>
                                <MessageSquare className={`w-4 h-4 ${showSidebar ? 'text-emerald-400' : ''}`} />
                            </Button>
                        </div>
                    </motion.header>
                )}
            </AnimatePresence>

            {/* Distraction Free Exit Button (Only visible when active) */}
            <AnimatePresence>
                {isDistractionFree && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute top-4 right-4 z-50"
                    >
                        <Button variant="secondary" size="icon" className="bg-black/50 border border-white/10 hover:bg-black/80 rounded-full" onClick={toggleDistractionFree}>
                            <Minimize2 className="w-4 h-4 text-gray-400" />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <div className={`flex-1 flex overflow-hidden relative transition-all duration-500 ease-in-out ${!isDistractionFree ? 'pt-14' : ''}`}>

                {/* PDF Reader Container */}
                <main className="flex-1 relative flex justify-center bg-[#0a0a0a]">
                    <div className="w-full max-w-4xl h-full overflow-hidden shadow-2xl bg-black flex items-center justify-center">
                        {book && (
                            book.type === 'video' ? (
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={book.file_url}
                                    title={book.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                    className="aspect-video"
                                ></iframe>
                            ) : (
                                <PDFReader url={book.file_url} isDistractionFree={isDistractionFree} />
                            )
                        )}
                    </div>
                </main>

                {/* AI Tutor Sidebar */}
                <AnimatePresence>
                    {showSidebar && !isDistractionFree && (
                        <motion.aside
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 350, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            className="h-full border-l border-[#2a2a2a] bg-[#0c0c0c] z-40 flex-shrink-0"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                            <AITutorSidebar
                                bookTitle={book?.title}
                                bookId={bookId}
                                currentPage={1}
                                totalPages={1}
                                category={book?.category || "Forex & Trading"}
                            />
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* Book Notes Drawer */}
                <AnimatePresence>
                    {showNotes && !isDistractionFree && (
                        <motion.aside
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 320, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            className="h-full border-l border-[#2a2a2a] bg-[#0c0c0c] z-40 flex-shrink-0 overflow-hidden"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                            <BookNotesDrawer bookId={bookId} bookTitle={book?.title} currentPage={1} />
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* Mobile Sidebar Sheet */}
                <div className="md:hidden">
                    {/* Implementation for mobile drawer if needed */}
                </div>
            </div>

            {/* Practice Setup Chart Simulator Modal */}
            <ChartSimulatorModal
                isOpen={showSimulator}
                onClose={() => setShowSimulator(false)}
                bookTitle={book?.title}
                category={book?.category}
            />

            {/* Athena AI Strategy Quiz Modal */}
            <StrategyQuizDialog
                isOpen={showQuiz}
                onClose={() => setShowQuiz(false)}
                bookTitle={book?.title}
                category={book?.category}
            />
        </div>
    );
}
