import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
    const [book, setBook] = useState<any>(null); // Replace with proper type

    // Mock fetch book details
    useEffect(() => {
        // Simulate fetching book data
        setBook({
            id: bookId,
            title: "Trading in the Zone",
            author: "Mark Douglas",
            file_url: "/sample.pdf" // This would be real URL
        });
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
                    <div className="w-full max-w-4xl h-full overflow-hidden shadow-2xl">
                        {book && <PDFReader url={book.file_url} isDistractionFree={isDistractionFree} />}
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
                            <AITutorSidebar bookTitle={book?.title} />
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
