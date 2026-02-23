import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set worker to CDN for simplicity in standard Vite setup without extra config
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFReaderProps {
    url: string;
    isDistractionFree: boolean;
}

export const PDFReader = ({ url, isDistractionFree }: PDFReaderProps) => {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    return (
        <div className="flex flex-col h-full bg-[#1a1a1a] border-x border-[#2a2a2a] relative">
            <div className="flex-1 overflow-auto flex justify-center p-8 custom-scrollbar">
                <Document
                    file={url}
                    onLoadSuccess={onDocumentLoadSuccess}
                    className="shadow-2xl"
                    loading={
                        <div className="flex items-center justify-center h-96 text-emerald-500 animate-pulse">
                            Loading Book...
                        </div>
                    }
                    error={
                        <div className="flex items-center justify-center h-96 text-red-500">
                            Failed to load PDF. Please check the URL.
                        </div>
                    }
                >
                    <Page
                        pageNumber={pageNumber}
                        scale={scale}
                        className="shadow-2xl border border-[#333]"
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                    />
                </Document>
            </div>

            {/* Floating Controls */}
            <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/80 backdrop-blur border border-white/10 p-2 rounded-full transition-opacity duration-300 z-50 pointer-events-auto ${isDistractionFree ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                    disabled={pageNumber <= 1}
                    className="text-white hover:bg-white/10 rounded-full h-8 w-8 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-xs font-mono text-gray-300 min-w-[60px] text-center">
                    {pageNumber} / {numPages || '--'}
                </span>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                        e.stopPropagation();
                        console.log('Next button clicked, current page:', pageNumber, 'total pages:', numPages);
                        setPageNumber(p => {
                            const nextPage = Math.min(numPages || p, p + 1);
                            console.log('Moving from page', p, 'to page', nextPage);
                            return nextPage;
                        });
                    }}
                    disabled={!numPages || pageNumber >= numPages}
                    className="text-white hover:bg-white/10 rounded-full h-8 w-8 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <ChevronRight className="w-4 h-4" />
                </Button>
                <div className="w-px h-4 bg-white/20 mx-1" />
                <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="text-white hover:bg-white/10 rounded-full h-8 w-8">
                    <ZoomOut className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.min(2.0, s + 0.1))} className="text-white hover:bg-white/10 rounded-full h-8 w-8">
                    <ZoomIn className="w-3 h-3" />
                </Button>
            </div>
        </div>
    );
};
