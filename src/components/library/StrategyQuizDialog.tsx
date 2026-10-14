import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Award, Sparkles, ArrowRight, RotateCcw } from "lucide-react";
import { haptics } from "@/utils/audioHaptics";
import { playbookService } from "@/services/playbookService";

interface StrategyQuizDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bookTitle?: string;
  category?: string;
}

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUIZ_BANKS: Record<string, Question[]> = {
  "Smart Money Concepts": [
    {
      question: "What distinguishes a true Change of Character (CHoCH) from a minor internal pullback?",
      options: [
        "A wick breaking a low during Asian session",
        "A full candle body close breaking the major swing point that caused the most recent high",
        "A simple 3-pip spike on the 1-minute chart",
        "Any bearish candle following a bullish news release"
      ],
      correctIndex: 1,
      explanation: "A valid CHoCH requires a decisive candle body close through the structural swing point responsible for the prior high, signaling true institutional order flow shift."
    },
    {
      question: "Where should an institutional limit entry be placed when trading a Fair Value Gap (FVG)?",
      options: [
        "At the 50% equilibrium level of the 3-candle imbalance box",
        "100 pips above the nearest moving average",
        "Immediately at market as soon as the candle opens",
        "At the lowest wick of the previous trading day"
      ],
      correctIndex: 0,
      explanation: "Institutions often rebalance imbalances at the 50% equilibrium line (consequent encroachment) of the FVG box for high-probability mitigation."
    },
    {
      question: "What is an 'Inducement Trap' according to institutional smart money principles?",
      options: [
        "A broker spread widening at 5 PM EST",
        "An obvious retail support/resistance level engineered to lure early retail orders before a real sweep occurs",
        "Trading without an indicator on your chart",
        "A high leverage margin call"
      ],
      correctIndex: 1,
      explanation: "Smart money engineers apparent double bottoms/tops to entice retail liquidity pools right before triggering an institutional stop hunt."
    },
    {
      question: "When is the Asian Session range most effectively used in London Open setups?",
      options: [
        "By trading breakouts immediately at 03:00 UTC",
        "By waiting for London open to sweep either the Asian High or Asian Low before looking for a reversal",
        "By closing all open trades before Tokyo closes",
        "By drawing 200 moving averages across the session"
      ],
      correctIndex: 1,
      explanation: "The Asian session consolidates liquidity. London open typically executes a liquidity sweep of one extreme, then aggressively drives toward the opposite side."
    },
    {
      question: "What constitutes the invalidation point of an Order Block (OB)?",
      options: [
        "When price touches the top of the block",
        "When price closes beyond the origin swing point of the order block",
        "When volume drops below the 20-period average",
        "When the London session ends"
      ],
      correctIndex: 1,
      explanation: "An order block is invalidated when a candle body decisively closes beyond the origin extreme of the block, signifying that institutional buy/sell pressure failed to hold."
    }
  ],
  "default": [
    {
      question: "What is the primary objective of a professional risk management model?",
      options: [
        "Maximizing leverage on every trade",
        "Limiting risk per trade to 1-2% of total equity to ensure survival during drawdown streaks",
        "Never taking a losing trade",
        "Only trading during high-impact news events"
      ],
      correctIndex: 1,
      explanation: "Capital preservation is paramount. Limiting risk per trade ensures that a statistical losing streak does not cripple your account equity."
    },
    {
      question: "In technical analysis, what confirms a valid support-turned-resistance breakout retest?",
      options: [
        "Price breaking the level and rejecting it from underneath with decreasing buying volume",
        "Buying immediately while the breakout candle is still forming",
        "Increasing lot size after a loss",
        "Trading only on Friday afternoon"
      ],
      correctIndex: 0,
      explanation: "True polarity shifts occur when broken support is retested from below and rejected with clear seller absorption."
    },
    {
      question: "Why is a minimum 1:2 or 1:3 Risk-to-Reward ratio critical to long-term edge?",
      options: [
        "It guarantees a 90% win rate",
        "It allows a trader to remain consistently profitable even with a 40% win rate",
        "Brokers reduce commissions on higher R:R trades",
        "It prevents all slippage"
      ],
      correctIndex: 1,
      explanation: "With a 1:3 Risk-to-Reward ratio, you only need to win 30% of your trades to achieve overall profitability."
    },
    {
      question: "What is the psychological danger of 'revenge trading' after a stop loss is hit?",
      options: [
        "It increases your broker rebate",
        "It abandons predefined trading rules and risks oversized capital out of emotional frustration",
        "It improves market timing",
        "It is recommended by prop firms"
      ],
      correctIndex: 1,
      explanation: "Revenge trading stems from emotional tilt and is the #1 reason retail accounts suffer catastrophic drawdown."
    },
    {
      question: "What constitutes institutional confluence before executing a trade?",
      options: [
        "A single indicator crossing zero",
        "Alignment between higher timeframe bias, liquidity sweep, key price level, and lower timeframe confirmation",
        "A tip from a social media trading group",
        "A coin toss before market open"
      ],
      correctIndex: 1,
      explanation: "High-probability trades occur at intersections where multiple independent technical factors (HTF bias + liquidity sweep + LTF entry) align."
    }
  ]
};

export const StrategyQuizDialog: React.FC<StrategyQuizDialogProps> = ({
  isOpen,
  onClose,
  bookTitle = "Trading Strategy Guide",
  category = "Smart Money Concepts"
}) => {
  const questions = QUIZ_BANKS[category] || QUIZ_BANKS["Smart Money Concepts"] || QUIZ_BANKS["default"];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQ = questions[currentIndex];

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    haptics.playClick();
    setSelectedOption(idx);
    setIsAnswered(true);

    if (idx === currentQ.correctIndex) {
      haptics.playSuccess();
      setScore(prev => prev + 1);
    } else {
      haptics.playInvalidate();
    }
  };

  const handleNext = () => {
    haptics.playClick();
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      haptics.playSuccess();
      playbookService.recordQuizComplete(score + (selectedOption === currentQ.correctIndex ? 1 : 0));
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl bg-[#0c0c0e] border border-white/10 text-white rounded-2xl shadow-2xl p-6">
        <DialogHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs font-mono">
              <Sparkles className="w-3 h-3 mr-1" /> Athena Knowledge Check
            </Badge>
            <span className="text-xs text-gray-400 font-mono">
              {!isFinished ? `Question ${currentIndex + 1} of ${questions.length}` : "Completed"}
            </span>
          </div>
          <DialogTitle className="text-lg font-bold text-white font-display">
            {bookTitle} — Comprehension Quiz
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-400">
            Test your understanding of institutional rules before risking capital.
          </DialogDescription>
        </DialogHeader>

        {!isFinished ? (
          <div className="space-y-5 pt-3">
            {/* Question Box */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
              <h4 className="text-sm font-semibold text-gray-100 leading-snug">
                {currentQ.question}
              </h4>
            </div>

            {/* Options */}
            <div className="space-y-2.5">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQ.correctIndex;

                let btnStyle = "bg-white/[0.02] border-white/10 hover:bg-white/[0.06] text-gray-300";
                if (isAnswered) {
                  if (isCorrect) {
                    btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-medium";
                  } else if (isSelected && !isCorrect) {
                    btnStyle = "bg-red-500/20 border-red-500 text-red-300";
                  } else {
                    btnStyle = "opacity-40 border-white/5";
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleSelect(idx)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {isAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />}
                    {isAnswered && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-400 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {isAnswered && (
              <div className="p-3.5 bg-black/50 border border-white/10 rounded-xl space-y-1 animate-in fade-in">
                <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold">Institutional Logic:</span>
                <p className="text-xs text-gray-300 leading-relaxed">{currentQ.explanation}</p>
              </div>
            )}

            {/* Footer Next Button */}
            {isAnswered && (
              <div className="pt-2 flex justify-end">
                <Button
                  onClick={handleNext}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs h-9 px-5"
                >
                  {currentIndex < questions.length - 1 ? (
                    <>Next Question <ArrowRight className="w-3.5 h-3.5 ml-1.5" /></>
                  ) : (
                    "View Final Score"
                  )}
                </Button>
              </div>
            )}
          </div>
        ) : (
          /* Finished Scorecard */
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
              <Award className="w-8 h-8 text-emerald-400" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-bold font-display text-white">
                {score >= 4 ? "Exceptional Mastery! 🏆" : "Quiz Finished"}
              </h3>
              <p className="text-sm text-gray-400 font-mono">
                You scored <span className="text-emerald-400 font-bold">{score} / {questions.length}</span> correct
              </p>
            </div>

            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 text-xs text-emerald-400 font-mono">
              <Sparkles className="w-3.5 h-3.5" /> +{score * 20} Trader XP Awarded to your Profile
            </div>

            <div className="pt-4 flex justify-center gap-3">
              <Button variant="outline" onClick={handleReset} className="border-white/10 text-xs h-9">
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Retake Quiz
              </Button>
              <Button onClick={onClose} className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs h-9 px-6">
                Back to Library
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
