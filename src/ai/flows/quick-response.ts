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
import {generateImageTool, type GenerateImageOutput} from './generate-image';

const QuickResponseInputSchema = z.object({
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
export type QuickResponseInput = z.infer<typeof QuickResponseInputSchema>;

const QuickResponseOutputSchema = z.object({
  response: z.string().describe('The response, which can be text or an image data URI.'),
  isImage: z.boolean().describe('True if the response is an image data URI.'),
});
export type QuickResponseOutput = z.infer<typeof QuickResponseOutputSchema>;

export async function quickResponse(input: QuickResponseInput): Promise<QuickResponseOutput> {
  return quickResponseFlow(input);
}

const quickResponseFlow = ai.defineFlow(
  {
    name: 'quickResponseFlow',
    inputSchema: QuickResponseInputSchema,
    outputSchema: QuickResponseOutputSchema,
  },
  async input => {
    const {history, query} = input;
    const limitedHistory = history ? history.slice(-10) : [];
    const systemPrompt = `You are OngwaeGPT, version 1.2 global. You were created by Josephat Ongwae Onyinkwa, the founder of Oapps Inc. Your purpose is to serve as a helpful AI assistant, and you belong to Josephat Ongwae Onyinkwa. Your project's blog is at https://o-browser.blogspot.com.
Your primary function is to provide quick, concise answers.
However, if a user asks you to generate, create, draw, or sketch an image, you MUST use the \`generateImage\` tool. Do not describe the image or confirm the action; call the tool directly.
For all other requests, provide a direct text response. Format code snippets in markdown.
Respond with a short and direct answer, using a maximum of 4096 tokens.`;

    const response = await ai.generate({
      prompt: query,
      history: limitedHistory,
      model: 'googleai/gemini-1.5-flash-latest',
      tools: [generateImageTool],
      system: systemPrompt,
      config: {
        maxOutputTokens: 4096,
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
