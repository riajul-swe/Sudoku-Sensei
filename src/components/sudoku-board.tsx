'use client';

import type { Grid, Cell } from '@/lib/types';
import { cn } from '@/lib/utils';

type SudokuBoardProps = {
  userGrid: Grid | null;
  initialGrid: Grid | null;
  selectedCell: Cell;
  errors: boolean[][];
  onCellClick: (row: number, col: number) => void;
  isCompleted: boolean;
};

export function SudokuBoard({
  userGrid,
  initialGrid,
  selectedCell,
  errors,
  onCellClick,
  isCompleted,
}: SudokuBoardProps) {
  if (!userGrid || !initialGrid) {
    return (
      <div className="w-[370px] h-[370px] md:w-[452px] md:h-[452px] bg-muted rounded-lg animate-pulse" />
    );
  }

  const handleCellClick = (row: number, col: number) => {
    if (initialGrid[row][col] === 0) {
      onCellClick(row, col);
    }
  };

  const selectedValue = selectedCell && userGrid[selectedCell.row][selectedCell.col] !== 0 
    ? userGrid[selectedCell.row][selectedCell.col]
    : null;

  return (
    <div className={cn(
        "grid grid-cols-9 bg-border rounded-md overflow-hidden shadow-lg border-4 border-border transition-all duration-500",
        isCompleted && "shadow-primary/50 border-primary"
      )}
    >
      {userGrid.map((row, rowIndex) =>
        row.map((num, colIndex) => {
          const isInitial = initialGrid[rowIndex][colIndex] !== 0;
          const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
          const isHighlighted =
            !isSelected &&
            (selectedCell?.row === rowIndex ||
              selectedCell?.col === colIndex ||
              (selectedCell && Math.floor(selectedCell.row / 3) === Math.floor(rowIndex / 3) &&
                Math.floor(selectedCell.col / 3) === Math.floor(colIndex / 3)));
          
          const isSameValue = selectedValue && num === selectedValue && !isInitial;
          const hasError = errors[rowIndex]?.[colIndex] && !isInitial;

          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={cn(
                'relative flex items-center justify-center aspect-square text-2xl md:text-3xl font-bold cursor-pointer transition-colors duration-100',
                'bg-card text-foreground',
                'border-r border-b border-border',
                colIndex % 3 === 2 && colIndex !== 8 && 'border-r-2 border-r-border',
                rowIndex % 3 === 2 && rowIndex !== 8 && 'border-b-2 border-b-border',
                isInitial ? 'text-foreground/80' : 'text-primary',
                !isInitial && 'hover:bg-secondary',
                isHighlighted && 'bg-secondary/70',
                isSameValue && !isSelected && 'bg-primary/20',
                isSelected && 'bg-primary/30 outline-2 outline-primary outline',
                hasError && !isSelected && 'bg-destructive/20 text-destructive',
                hasError && isSelected && 'bg-destructive/40 text-destructive-foreground',
              )}
              onClick={() => handleCellClick(rowIndex, colIndex)}
            >
              {num > 0 && num}
            </div>
          );
        })
      )}
    </div>
  );
}
