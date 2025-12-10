import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TypewriterTextProps {
  texts: string[];
  className?: string;
  speed?: number;
  pauseDuration?: number;
}

const TypewriterText = ({ 
  texts, 
  className, 
  speed = 50,
  pauseDuration = 3000 
}: TypewriterTextProps) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentFullText = texts[currentTextIndex];
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayText.length < currentFullText.length) {
          setDisplayText(currentFullText.slice(0, displayText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), pauseDuration);
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(displayText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setCurrentTextIndex((prev) => (prev + 1) % texts.length);
        }
      }
    }, isDeleting ? speed / 2 : speed);

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentTextIndex, texts, speed, pauseDuration]);

  return (
    <span className={cn("inline-flex items-center", className)}>
      <span>{displayText}</span>
      <span className="ml-1 w-0.5 h-[1em] bg-primary animate-blink" />
    </span>
  );
};

export default TypewriterText;