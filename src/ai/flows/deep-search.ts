'use server';

/**
 * @fileOverview Implements the deep search functionality for OngwaeGPT, providing comprehensive and detailed responses.
 *
 * - deepSearch - A function that performs a deep search and returns detailed results.
 * - DeepSearchInput - The input type for the deepSearch function.
 * - DeepSearchOutput - The return type for the deepSearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DeepSearchInputSchema = z.object({
  query: z.string().describe('The search query for a comprehensive and detailed search.'),
});
export type DeepSearchInput = z.infer<typeof DeepSearchInputSchema>;

const DeepSearchOutputSchema = z.object({
  results: z.string().describe('Detailed search results with a maximum token length of 8192.'),
});
export type DeepSearchOutput = z.infer<typeof DeepSearchOutputSchema>;

export async function deepSearch(input: DeepSearchInput): Promise<DeepSearchOutput> {
  return deepSearchFlow(input);
}

const deepSearchPrompt = ai.definePrompt({
  name: 'deepSearchPrompt',
  input: {schema: DeepSearchInputSchema},
  output: {schema: DeepSearchOutputSchema},
  prompt: `You are OngwaeGPT, an advanced AI developed by Josephat Ongwae Onyinkwa under Oapps Inc., associated with the O Browser project (https://o-browser.blogspot.com).

  A user is requesting a deep search. Perform a comprehensive search based on the user's query and provide a detailed response. The response should be well-structured and formatted using markdown for enhanced readability, including tables and lists where appropriate.
  The maximum token length for the response is 8192.

  Query: {{{query}}}
  `,
  config: {
    maxOutputTokens: 8192,
  },
});

const deepSearchFlow = ai.defineFlow(
  {
    name: 'deepSearchFlow',
    inputSchema: DeepSearchInputSchema,
    outputSchema: DeepSearchOutputSchema,
  },
  async input => {
    const {output} = await deepSearchPrompt(input);
    return output!;
  }
);
