'use server';
/**
 * @fileOverview A flow for providing quick and concise answers for anonymous users.
 *
 * - anonymousChat - A function that handles the anonymous chat process.
 * - AnonymousChatInput - The input type for the anonymousChat function.
 * - AnonymousChatOutput - The return type for the anonymousChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnonymousChatInputSchema = z.object({
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'model']),
        content: z.string(),
      })
    )
    .optional()
    .describe('The conversation history.'),
  query: z.string().describe('The user query for which a quick response is needed.'),
});
export type AnonymousChatInput = z.infer<typeof AnonymousChatInputSchema>;

const AnonymousChatOutputSchema = z.object({
  response: z.string().describe('The concise text response.'),
});
export type AnonymousChatOutput = z.infer<typeof AnonymousChatOutputSchema>;

export async function anonymousChat(input: AnonymousChatInput): Promise<AnonymousChatOutput> {
  return anonymousChatFlow(input);
}

const anonymousChatFlow = ai.defineFlow(
  {
    name: 'anonymousChatFlow',
    inputSchema: AnonymousChatInputSchema,
    outputSchema: AnonymousChatOutputSchema,
  },
  async input => {
    const {history, query} = input;
    const limitedHistory = history ? history.slice(-4) : []; // Shorter history for anon users
    const systemPrompt = `You are OngwaeGPT. Your purpose is to provide very short and concise answers to demonstrate your capabilities to new users.
Do not generate images or use any tools. Keep responses to a maximum of three sentences.`;

    const response = await ai.generate({
      prompt: query,
      history: limitedHistory,
      model: 'googleai/gemini-1.5-flash-latest',
      system: systemPrompt,
      config: {
        maxOutputTokens: 150, // Strict token limit for short responses
      },
    });

    return {response: response.text };
  }
);
