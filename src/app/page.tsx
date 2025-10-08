'use client';

import * as React from 'react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { SudokuBoard } from '@/components/sudoku-board';
import { NumberPad } from '@/components/number-pad';
import type { Difficulty, Grid, Cell, Puzzle } from '@/lib/types';
import { PUZZLES } from '@/lib/puzzles';
import { stringToGrid, gridToString, checkPuzzle, isPuzzleSolved, cloneGrid } from '@/lib/sudoku';
import { useAuth } from '@/lib/firebase/auth';
import { saveProgress, loadProgress, updateUserStats } from '@/lib/firebase/firestore';
import { useDebounce } from '@/hooks/use-debounce';
import { solveSudokuPuzzle } from '@/ai/flows/solve-sudoku-puzzle';
import { explainSudokuSolvingStep } from '@/ai/flows/explain-sudoku-solving-step';
import { Award, BrainCircuit, Eraser, Lightbulb, Loader2, Play, SquarePen } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import Confetti from 'react-confetti';
import useWindowSize from 'react-use/lib/useWindowSize'


export default function Home() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [userGrid, setUserGrid] = useState<Grid | null>(null);
  const [selectedCell, setSelectedCell] = useState<Cell>(null);
  const [errors, setErrors] = useState<boolean[][]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSolving, setIsSolving] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [showExplanationDialog, setShowExplanationDialog] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const { width, height } = useWindowSize();

  const { user, loading: authLoading } = useAuth();
  const debouncedGrid = useDebounce(userGrid, 1000);

  const initialGrid = useMemo(() => puzzle ? stringToGrid(puzzle.problem) : null, [puzzle]);
  const solutionGrid = useMemo(() => puzzle ? stringToGrid(puzzle.solution) : null, [puzzle]);

  const startNewGame = useCallback((diff: Difficulty, custom = false) => {
    setIsCustomMode(custom);
    if (custom) {
      const emptyPuzzle: Puzzle = {
        problem: '0'.repeat(81),
        solution: '0'.repeat(81),
        difficulty: 'easy'
      };
      setPuzzle(emptyPuzzle);
      setUserGrid(stringToGrid(emptyPuzzle.problem));
    } else {
      const newPuzzles = PUZZLES[diff];
      const newPuzzle = newPuzzles[Math.floor(Math.random() * newPuzzles.length)];
      setPuzzle(newPuzzle);
      setUserGrid(stringToGrid(newPuzzle.problem));
    }
    setSelectedCell(null);
    setIsCompleted(false);
    setErrors([]);
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      loadProgress(user.uid).then(progress => {
        if (progress) {
          setPuzzle(progress.puzzle);
          setUserGrid(stringToGrid(progress.userGrid));
          setDifficulty(progress.puzzle.difficulty);
        } else {
          startNewGame('easy');
        }
      });
    } else if (!authLoading && !user) {
      startNewGame('easy');
    }
  }, [user, authLoading, startNewGame]);

  useEffect(() => {
    if (user && debouncedGrid && puzzle && !isCompleted) {
      saveProgress(user.uid, gridToString(debouncedGrid), puzzle);
    }
  }, [debouncedGrid, user, puzzle, isCompleted]);

  useEffect(() => {
    if (userGrid && solutionGrid) {
      const newErrors = checkPuzzle(userGrid, initialGrid!, solutionGrid);
      setErrors(newErrors);
      const solved = isPuzzleSolved(userGrid, solutionGrid);
      if (solved && !isCompleted) {
        setIsCompleted(true);
        if (user && puzzle) {
          updateUserStats(user.uid, puzzle.difficulty);
        }
      }
    }
  }, [userGrid, solutionGrid, initialGrid, isCompleted, user, puzzle]);

  const handleCellClick = (row: number, col: number) => {
    if (!initialGrid || initialGrid[row][col] === 0) {
      setSelectedCell({ row, col });
    }
  };

  const handleNumberInput = (num: number) => {
    if (!userGrid || !selectedCell) return;
    const newGrid = cloneGrid(userGrid);
    newGrid[selectedCell.row][selectedCell.col] = num;
    setUserGrid(newGrid);
  };
  
  const handleSolve = async () => {
    if (!puzzle) return;
    setIsSolving(true);
    try {
      const solvedString = await solveSudokuPuzzle(puzzle.problem);
      setUserGrid(stringToGrid(solvedString));
    } catch (error) {
      console.error("AI failed to solve:", error);
    } finally {
      setIsSolving(false);
    }
  };

  const handleExplain = async () => {
    if (!userGrid || !solutionGrid) return;
    setIsExplaining(true);
    setExplanation('');

    let emptyCell: Cell = null;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (userGrid[r][c] === 0) {
          emptyCell = { row: r, col: c };
          break;
        }
      }
      if (emptyCell) break;
    }

    if (!emptyCell) {
      setIsExplaining(false);
      return;
    }

    const { row, col } = emptyCell;
    const value = solutionGrid[row][col];
    
    try {
      const result = await explainSudokuSolvingStep({
        puzzle: gridToString(userGrid),
        row,
        col,
        value,
      });
      setExplanation(result.explanation);
      setShowExplanationDialog(true);
      
      const newGrid = cloneGrid(userGrid);
      newGrid[row][col] = value;
      setUserGrid(newGrid);

    } catch (error) {
      console.error("AI failed to explain:", error);
    } finally {
      setIsExplaining(false);
    }
  };

  const handleClear = () => {
    if (initialGrid) {
        setUserGrid(cloneGrid(initialGrid));
        setSelectedCell(null);
        setIsCompleted(false);
        setErrors([]);
    }
  };

  const handleDifficultyChange = (value: string) => {
    const newDifficulty = value as Difficulty;
    setDifficulty(newDifficulty);
    startNewGame(newDifficulty);
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!selectedCell) return;

    let { row, col } = selectedCell;
    if (e.key >= '1' && e.key <= '9') {
      handleNumberInput(parseInt(e.key, 10));
    } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
      handleNumberInput(0);
    } else if (e.key.startsWith('Arrow')) {
      e.preventDefault();
      if (e.key === 'ArrowUp') row = Math.max(0, row - 1);
      else if (e.key === 'ArrowDown') row = Math.min(8, row + 1);
      else if (e.key === 'ArrowLeft') col = Math.max(0, col - 1);
      else if (e.key === 'ArrowRight') col = Math.min(8, col + 1);
      setSelectedCell({ row, col });
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCell, userGrid]);
  
  return (
    <div className="container mx-auto p-4 flex flex-col items-center gap-6">
       <div className="w-full max-w-lg flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-lg shadow-md">
        <div className="flex items-center gap-4">
          <Select onValueChange={handleDifficultyChange} value={difficulty} disabled={isCustomMode}>
            <SelectTrigger className="w-[180px] font-semibold">
              <div className="flex items-center gap-2">
                <Award size={16}/>
                <SelectValue placeholder="Select difficulty" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
              <SelectItem value="expert">Expert</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => startNewGame(difficulty)} variant="secondary">
            <Play className="mr-2" /> New Game
          </Button>
        </div>
        <Button onClick={() => startNewGame(difficulty, true)} variant="outline">
          <SquarePen className="mr-2" /> Custom
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="relative">
          {isCompleted && <Confetti width={width} height={height} />}
          <SudokuBoard
            userGrid={userGrid}
            initialGrid={initialGrid}
            selectedCell={selectedCell}
            errors={errors}
            onCellClick={handleCellClick}
            isCompleted={isCompleted}
          />
        </div>
        <div className="w-full lg:w-auto flex flex-col gap-4">
          <NumberPad onNumberClick={handleNumberInput} />
          <div className="grid grid-cols-1 gap-2">
             <Button onClick={handleClear} variant="outline" size="lg">
                <Eraser className="mr-2" />
                Clear Board
            </Button>
            <Button onClick={handleExplain} disabled={isExplaining || isCompleted} variant="outline" size="lg">
              {isExplaining ? <Loader2 className="animate-spin mr-2" /> : <Lightbulb className="mr-2" />}
              AI Hint
            </Button>
            <Button onClick={handleSolve} disabled={isSolving || isCompleted} size="lg">
              {isSolving ? <Loader2 className="animate-spin mr-2" /> : <BrainCircuit className="mr-2" />}
              AI Solve
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showExplanationDialog} onOpenChange={setShowExplanationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Lightbulb/> AI Step Explanation</DialogTitle>
            <DialogDescription className="pt-4 text-foreground">
              {explanation}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
