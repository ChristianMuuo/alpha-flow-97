import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlphaMatrixTerminal } from "./AlphaMatrixTerminal";

interface AlphaMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSymbol?: string;
  initialPrice?: number;
}

export const AlphaMatrixModal: React.FC<AlphaMatrixModalProps> = ({
  isOpen,
  onClose,
  initialSymbol = "EUR/USD",
  initialPrice
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto bg-[#08080c] border border-white/10 text-white p-2 md:p-6 rounded-2xl shadow-2xl">
        <AlphaMatrixTerminal
          initialSymbol={initialSymbol}
          initialPrice={initialPrice}
        />
      </DialogContent>
    </Dialog>
  );
};
