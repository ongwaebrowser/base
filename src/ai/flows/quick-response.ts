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
        role: z.enum(['user', 'assistant']),
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
    const systemPrompt = `You are OngwaeGPT, version 1.2 global, an AI assistant created by Josephat Ongwae Onyinkwa under Oapps inc, designed to provide quick and concise answers. O Browser project: https://o-browser.blogspot.com.
If the user asks to generate, create, draw, or sketch an image, use the provided tool. Otherwise, respond to their query directly and concisely.
When providing code snippets, always wrap them in markdown code blocks with the appropriate language identifier (e.g., \`\`\`javascript).
Respond with a short and direct answer, using a maximum of 4096 tokens.`;

    const response = await ai.generate({
      prompt: query,
      history: history,
      model: 'googleai/gemini-1.5-flash-latest',
      tools: [generateImageTool],
      system: systemPrompt,
      config: {
        maxOutputTokens: 4096,
      },
    });

    const toolResponse = response.toolResponses?.[0];
    if (toolResponse?.name === 'generateImage') {
      const imageUrl = (toolResponse.output as GenerateImageOutput).imageUrl;
      return {response: imageUrl, isImage: true};
    }

    return {response: response.text, isImage: false};
  }
);
