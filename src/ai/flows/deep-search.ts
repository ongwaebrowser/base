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
import {generateImageTool, type GenerateImageOutput} from './generate-image';

const DeepSearchInputSchema = z.object({
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .optional()
    .describe('The conversation history.'),
  query: z.string().describe('The search query for a comprehensive and detailed search.'),
});
export type DeepSearchInput = z.infer<typeof DeepSearchInputSchema>;

const DeepSearchOutputSchema = z.object({
  response: z.string().describe('The response, which can be text or an image data URI.'),
  isImage: z.boolean().describe('True if the response is an image data URI.'),
});
export type DeepSearchOutput = z.infer<typeof DeepSearchOutputSchema>;

export async function deepSearch(input: DeepSearchInput): Promise<DeepSearchOutput> {
  return deepSearchFlow(input);
}

const deepSearchFlow = ai.defineFlow(
  {
    name: 'deepSearchFlow',
    inputSchema: DeepSearchInputSchema,
    outputSchema: DeepSearchOutputSchema,
  },
  async input => {
    const {history, query} = input;
    const systemPrompt = `You are OngwaeGPT, version 1.2 global, an AI by Josephat Ongwae Onyinkwa (Oapps Inc., O Browser project: https://o-browser.blogspot.com).
Your purpose is to provide comprehensive, detailed answers.
However, if a user asks to generate, create, draw, or sketch an image, you MUST use the \`generateImage\` tool. Do not describe the image or confirm the action; call the tool directly.
For all other requests, provide a detailed text response formatted in markdown.
Format code snippets in markdown. The maximum token length for the response is 8192.`;

    const response = await ai.generate({
      prompt: query,
      history: history,
      model: 'googleai/gemini-1.5-flash-latest',
      tools: [generateImageTool],
      system: systemPrompt,
      config: {
        maxOutputTokens: 8192,
      },
    });

    const toolResponse = response.toolResponses?.[0];
    if (toolResponse?.name === 'generateImage' && toolResponse.output) {
      const imageUrl = (toolResponse.output as GenerateImageOutput).imageUrl;
      if (imageUrl) {
        return {response: imageUrl, isImage: true};
      }
    }

    return {response: response.text, isImage: false};
  }
);
