import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Book, Play, Sparkles, TrendingUp, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { haptics } from "@/utils/audioHaptics";

interface TiltBookCardProps {
  book: {
    id: string;
    title: string;
    author: string;
    category: string;
    cover_url: string | null;
  };
  onRead: (bookId: string) => void;
  onSimulate?: (book: any) => void;
  onQuiz?: (book: any) => void;
}

export const TiltBookCard: React.FC<TiltBookCardProps> = ({
  book,
  onRead,
  onSimulate,
  onQuiz
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse tilt physics
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 350, damping: 25 });
  const mouseYSpring = useSpring(y, { stiffness: 350, damping: 25 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);
  const sheenX = useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"]);
  const sheenY = useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    haptics.playClick(1400, 0.015);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 1000,
        transformStyle: "preserve-3d"
      }}
      className="w-[210px] group/card flex flex-col gap-3 cursor-pointer select-none"
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d"
        }}
        className="aspect-[2/3] relative rounded-xl overflow-hidden shadow-xl transition-shadow duration-300 group-hover/card:shadow-2xl group-hover/card:shadow-emerald-500/25 border border-white/10 bg-[#121214]"
      >
        {/* Book Cover Image */}
        {book.cover_url ? (
          <img
            src={book.cover_url}
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-black p-4 text-center">
            <Book className="w-10 h-10 text-emerald-500/40 mb-3" />
            <span className="text-xs text-muted-foreground/60 font-mono line-clamp-3">
              {book.title}
            </span>
          </div>
        )}

        {/* Dynamic Holographic Sheen */}
        <motion.div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${sheenX} ${sheenY}, rgba(52, 211, 153, 0.25), transparent 70%)`
          }}
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
          <Badge className="bg-black/80 backdrop-blur-md text-[10px] border border-white/15 text-emerald-400 font-mono px-2 py-0.5">
            {book.category.split(" ")[0]}
          </Badge>
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
        </div>

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent opacity-0 group-hover/card:opacity-100 transition-all duration-300 flex flex-col justify-end p-3 gap-2 z-20">
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              haptics.playClick(1000);
              onRead(book.id);
            }}
            className="w-full h-8 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/30 rounded-lg flex items-center justify-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Read Now
          </Button>

          <div className="grid grid-cols-2 gap-1.5">
            {onSimulate && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  haptics.playClick(1100);
                  onSimulate(book);
                }}
                className="h-7 text-[11px] px-2 bg-black/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20"
                title="Practice this strategy on live simulator"
              >
                <TrendingUp className="w-3 h-3 mr-1 text-emerald-400" /> Chart
              </Button>
            )}

            {onQuiz && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  haptics.playClick(1200);
                  onQuiz(book);
                }}
                className="h-7 text-[11px] px-2 bg-black/60 border-purple-500/40 text-purple-300 hover:bg-purple-500/20"
                title="Take Athena AI comprehension quiz"
              >
                <HelpCircle className="w-3 h-3 mr-1 text-purple-400" /> Quiz
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Book Title & Author */}
      <div className="space-y-1">
        <h4 className="font-bold text-sm leading-snug line-clamp-2 text-gray-200 group-hover/card:text-emerald-400 transition-colors">
          {book.title}
        </h4>
        <p className="text-xs text-muted-foreground/75 truncate font-medium">
          {book.author}
        </p>
      </div>
    </motion.div>
  );
};
