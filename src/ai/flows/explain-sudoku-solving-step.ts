'use server';

/**
 * @fileOverview Explains a single step in solving a Sudoku puzzle using AI reasoning.
 *
 * - explainSudokuSolvingStep - A function that explains a Sudoku solving step.
 * - ExplainSudokuSolvingStepInput - The input type for the explainSudokuSolvingStep function.
 * - ExplainSudokuSolvingStepOutput - The return type for the explainSudokuSolvingStep function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainSudokuSolvingStepInputSchema = z.object({
  puzzle: z
    .string()
    .describe(
      'The current state of the Sudoku puzzle as a string of 81 digits, with 0 representing empty cells.'
    ),
  row: z.number().min(0).max(8).describe('The row index of the cell to explain (0-8).'),
  col: z.number().min(0).max(8).describe('The column index of the cell to explain (0-8).'),
  value: z
    .number()
    .min(1)
    .max(9)
    .describe('The value to be placed in the cell (1-9).'),
});
export type ExplainSudokuSolvingStepInput = z.infer<
  typeof ExplainSudokuSolvingStepInputSchema
>;

const ExplainSudokuSolvingStepOutputSchema = z.object({
  explanation: z.string().describe('The AI reasoning behind placing the value in the cell.'),
});
export type ExplainSudokuSolvingStepOutput = z.infer<
  typeof ExplainSudokuSolvingStepOutputSchema
>;

export async function explainSudokuSolvingStep(
  input: ExplainSudokuSolvingStepInput
): Promise<ExplainSudokuSolvingStepOutput> {
  return explainSudokuSolvingStepFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainSudokuSolvingStepPrompt',
  input: {schema: ExplainSudokuSolvingStepInputSchema},
  output: {schema: ExplainSudokuSolvingStepOutputSchema},
  prompt: `You are an expert Sudoku solver. Explain the reasoning behind placing the value {{value}} in row {{row}}, column {{col}} of the following Sudoku puzzle:\n\n{{puzzle}}\n\nProvide a clear and concise explanation of the logic used, referencing Sudoku solving techniques such as hidden singles, naked pairs, etc., if applicable.`,
});

const explainSudokuSolvingStepFlow = ai.defineFlow(
  {
    name: 'explainSudokuSolvingStepFlow',
    inputSchema: ExplainSudokuSolvingStepInputSchema,
    outputSchema: ExplainSudokuSolvingStepOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
