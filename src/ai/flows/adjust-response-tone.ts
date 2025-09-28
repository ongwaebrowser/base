'use server';

/**
 * @fileOverview This file defines a Genkit flow for adjusting the tone of AI responses based on the conversation context.
 *
 * - adjustResponseTone - A function that adjusts the tone of a given text based on conversation context.
 * - AdjustResponseToneInput - The input type for the adjustResponseTone function, including the text to adjust and the conversation context.
 * - AdjustResponseToneOutput - The return type for the adjustResponseTone function, containing the adjusted text.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdjustResponseToneInputSchema = z.object({
  text: z.string().describe('The text to adjust the tone of.'),
  conversationContext: z
    .string()
    .describe('The context of the current conversation.'),
});
export type AdjustResponseToneInput = z.infer<typeof AdjustResponseToneInputSchema>;

const AdjustResponseToneOutputSchema = z.object({
  adjustedText: z.string().describe('The text with the adjusted tone.'),
});
export type AdjustResponseToneOutput = z.infer<typeof AdjustResponseToneOutputSchema>;

export async function adjustResponseTone(
  input: AdjustResponseToneInput
): Promise<AdjustResponseToneOutput> {
  return adjustResponseToneFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adjustResponseTonePrompt',
  input: {schema: AdjustResponseToneInputSchema},
  output: {schema: AdjustResponseToneOutputSchema},
  prompt: `You are an AI assistant that adjusts the tone of responses based on the context of the conversation to make it more engaging and natural.

  Adjust the tone of the following text based on the provided conversation context. The goal is to make the response more engaging and natural within the flow of the conversation.

  Conversation Context: {{{conversationContext}}}

  Original Text: {{{text}}}

  Adjusted Text:`,
});

const adjustResponseToneFlow = ai.defineFlow(
  {
    name: 'adjustResponseToneFlow',
    inputSchema: AdjustResponseToneInputSchema,
    outputSchema: AdjustResponseToneOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      adjustedText: output?.adjustedText ?? 'There was an issue adjusting the response tone.',
    };
  }
);
