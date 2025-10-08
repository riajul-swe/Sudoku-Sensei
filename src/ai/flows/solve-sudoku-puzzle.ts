'use server';

/**
 * @fileOverview A Sudoku puzzle solver AI agent.
 *
 * - solveSudokuPuzzle - A function that solves the Sudoku puzzle.
 * - SolveSudokuPuzzleInput - The input type for the solveSudokuPuzzle function.
 * - SolveSudokuPuzzleOutput - The return type for the solveSudokuPuzzle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SolveSudokuPuzzleInputSchema = z.string().describe('The Sudoku puzzle to solve, represented as a string of 81 digits, with 0 representing empty cells.');
export type SolveSudokuPuzzleInput = z.infer<typeof SolveSudokuPuzzleInputSchema>;

const SolveSudokuPuzzleOutputSchema = z.string().describe('The solved Sudoku puzzle, represented as a string of 81 digits.');
export type SolveSudokuPuzzleOutput = z.infer<typeof SolveSudokuPuzzleOutputSchema>;

export async function solveSudokuPuzzle(input: SolveSudokuPuzzleInput): Promise<SolveSudokuPuzzleOutput> {
  return solveSudokuPuzzleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'solveSudokuPuzzlePrompt',
  input: {schema: SolveSudokuPuzzleInputSchema},
  output: {schema: SolveSudokuPuzzleOutputSchema},
  prompt: `You are an expert Sudoku solver. Given a Sudoku puzzle, you will solve it and return the solved puzzle as a string of 81 digits, with no delimiters. Use 0 to represent empty cells.

Sudoku puzzle:
{{{input}}}

Solved Sudoku puzzle:`,
});

const solveSudokuPuzzleFlow = ai.defineFlow(
  {
    name: 'solveSudokuPuzzleFlow',
    inputSchema: SolveSudokuPuzzleInputSchema,
    outputSchema: SolveSudokuPuzzleOutputSchema,
  },
  async input => {
    const {output} = await prompt({input});
    return output!;
  }
);
