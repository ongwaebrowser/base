// src/ai/flows/generate-ai-responses.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating AI responses to user messages.
 *
 * It includes:
 * - `generateAIResponse`: An async function that takes user input and returns an AI-generated response.
 * - `GenerateAIResponseInput`: The input type for the `generateAIResponse` function, defining the structure of the user's message.
 * - `GenerateAIResponseOutput`: The output type for the `generateAIResponse` function, defining the structure of the AI's response.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAIResponseInputSchema = z.object({
  message: z.string().describe('The user message to respond to.'),
});

export type GenerateAIResponseInput = z.infer<typeof GenerateAIResponseInputSchema>;

const GenerateAIResponseOutputSchema = z.object({
  response: z.string().describe('The AI-generated response.'),
});

export type GenerateAIResponseOutput = z.infer<typeof GenerateAIResponseOutputSchema>;

export async function generateAIResponse(input: GenerateAIResponseInput): Promise<GenerateAIResponseOutput> {
  return generateAIResponseFlow(input);
}

const generateAIResponsePrompt = ai.definePrompt({
  name: 'generateAIResponsePrompt',
  input: {schema: GenerateAIResponseInputSchema},
  output: {schema: GenerateAIResponseOutputSchema},
  prompt: `You are a helpful AI assistant.  Respond to the following user message:

{{{message}}}`,
});

const generateAIResponseFlow = ai.defineFlow(
  {
    name: 'generateAIResponseFlow',
    inputSchema: GenerateAIResponseInputSchema,
    outputSchema: GenerateAIResponseOutputSchema,
  },
  async input => {
    const {output} = await generateAIResponsePrompt(input);
    return output!;
  }
);
