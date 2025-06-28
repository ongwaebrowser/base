'use server';

/**
 * @fileOverview Generates formatted tables from data.
 *
 * - generateTable - A function that generates a formatted table.
 * - GenerateTableInput - The input type for the generateTable function.
 * - GenerateTableOutput - The return type for the generateTable function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTableInputSchema = z.object({
  description: z
    .string()
    .describe(
      'A description of the table to generate, including the data to be included and the desired format.'
    ),
});
export type GenerateTableInput = z.infer<typeof GenerateTableInputSchema>;

const GenerateTableOutputSchema = z.object({
  table: z.string().describe('The generated formatted table in markdown format.'),
});
export type GenerateTableOutput = z.infer<typeof GenerateTableOutputSchema>;

export async function generateTable(input: GenerateTableInput): Promise<GenerateTableOutput> {
  return generateTableFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTablePrompt',
  input: {schema: GenerateTableInputSchema},
  output: {schema: GenerateTableOutputSchema},
  prompt: `You are an expert in generating formatted tables in markdown format.

  Based on the description provided, generate a well-formatted markdown table.

  Description: {{{description}}}
  `,
});

const generateTableFlow = ai.defineFlow(
  {
    name: 'generateTableFlow',
    inputSchema: GenerateTableInputSchema,
    outputSchema: GenerateTableOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
