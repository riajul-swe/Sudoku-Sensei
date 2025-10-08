'use client';

import { Button } from '@/components/ui/button';
import { Eraser } from 'lucide-react';

type NumberPadProps = {
  onNumberClick: (num: number) => void;
};

export function NumberPad({ onNumberClick }: NumberPadProps) {
  return (
    <div className="grid grid-cols-5 gap-2 w-full max-w-sm lg:w-[280px]">
      {Array.from({ length: 9 }, (_, i) => i + 1).map((num) => (
        <Button
          key={num}
          onClick={() => onNumberClick(num)}
          variant="outline"
          className="aspect-square h-auto text-2xl font-bold"
        >
          {num}
        </Button>
      ))}
      <Button
        onClick={() => onNumberClick(0)}
        variant="outline"
        className="aspect-square h-auto"
        aria-label="Erase"
      >
        <Eraser className="w-6 h-6" />
      </Button>
    </div>
  );
}
