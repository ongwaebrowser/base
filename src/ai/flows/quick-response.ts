// src/ai/flows/quick-response.ts
'use server';
/**
 * @fileOverview A flow for providing quick and concise answers using the 'Quick Response' mode.
 *
 * - quickResponse - A function that handles the quick response process.
 * - QuickResponseInput - The input type for the quickResponse function.
 * - QuickResponseOutput - The return type for the quickResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QuickResponseInputSchema = z.object({
  query: z.string().describe('The user query for which a quick response is needed.'),
});
export type QuickResponseInput = z.infer<typeof QuickResponseInputSchema>;

const QuickResponseOutputSchema = z.object({
  response: z.string().describe('The quick and concise response to the user query.'),
});
export type QuickResponseOutput = z.infer<typeof QuickResponseOutputSchema>;

export async function quickResponse(input: QuickResponseInput): Promise<QuickResponseOutput> {
  return quickResponseFlow(input);
}

const quickResponsePrompt = ai.definePrompt({
  name: 'quickResponsePrompt',
  input: {schema: QuickResponseInputSchema},
  output: {schema: QuickResponseOutputSchema},
  prompt: `You are OngwaeGPT, an AI assistant created by Josephat Ongwae Onyinkwa under Oapps inc, designed to provide quick and concise answers. O Browser project: https://o-browser.blogspot.com.

  Respond to the following query with a short and direct answer, using a maximum of 4096 tokens:

  Query: {{{query}}}`,
  config: {
    maxOutputTokens: 4096,
  },
});

const quickResponseFlow = ai.defineFlow(
  {
    name: 'quickResponseFlow',
    inputSchema: QuickResponseInputSchema,
    outputSchema: QuickResponseOutputSchema,
  },
  async input => {
    const {output} = await quickResponsePrompt(input);
    return output!;
  }
);
