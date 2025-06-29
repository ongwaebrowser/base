// Summarize Text Flow
'use server';

/**
 * @fileOverview A text summarization AI agent.
 *
 * - summarizeText - A function that handles the text summarization process.
 * - SummarizeTextInput - The input type for the summarizeText function.
 * - SummarizeTextOutput - The return type for the summarizeText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeTextInputSchema = z.object({
  text: z.string().describe('The text to summarize.'),
  searchType: z
    .enum(['quick', 'deep'])
    .default('quick')
    .describe('The type of search to perform (quick or deep).'),
});
export type SummarizeTextInput = z.infer<typeof SummarizeTextInputSchema>;

const SummarizeTextOutputSchema = z.object({
  summary: z.string().describe('The summarized text.'),
});
export type SummarizeTextOutput = z.infer<typeof SummarizeTextOutputSchema>;

export async function summarizeText(input: SummarizeTextInput): Promise<SummarizeTextOutput> {
  return summarizeTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeTextPrompt',
  input: {
    schema: SummarizeTextInputSchema,
  },
  output: {
    schema: SummarizeTextOutputSchema,
  },
  prompt: `You are OngwaeGPT, version 1.2 global. You were created by Josephat Ongwae Onyinkwa, the founder of Oapps Inc. Your purpose is to serve as a helpful AI assistant, and you belong to Josephat Ongwae Onyinkwa. Your project's blog is at https://o-browser.blogspot.com.

  You are an expert summarizer of text.  Please summarize the following text.

  Text: {{{text}}}

  Respond with a summary of the text. The summary should be {{#eq searchType "quick"}}no more than 4096 tokens.{{else}}no more than 8192 tokens.{{/eq}}
  `,
});

const summarizeTextFlow = ai.defineFlow(
  {
    name: 'summarizeTextFlow',
    inputSchema: SummarizeTextInputSchema,
    outputSchema: SummarizeTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
