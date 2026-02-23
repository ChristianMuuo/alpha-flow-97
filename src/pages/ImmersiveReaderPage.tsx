import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Maximize2, Minimize2, Settings, MessageSquare, Menu, Share2, Bookmark } from "lucide-react";
import { PDFReader } from "@/components/library/PDFReader";
import { AITutorSidebar } from "@/components/library/AITutorSidebar";
import { motion, AnimatePresence } from "framer-motion";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function ImmersiveReaderPage() {
    const { bookId } = useParams();
    const navigate = useNavigate();
    const [isDistractionFree, setIsDistractionFree] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);
    const [book, setBook] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
                            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-emerald-400">
                                <Bookmark className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white" onClick={toggleDistractionFree} title="Enter Distraction Free Mode">
                                <Maximize2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white transition-transform transform active:scale-95" onClick={() => setShowSidebar(!showSidebar)}>
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

                {/* Mobile Sidebar Sheet */}
                <div className="md:hidden">
                    {/* Implementation for mobile drawer if needed */}
                </div>
            </div>
        </div>
    );
}
