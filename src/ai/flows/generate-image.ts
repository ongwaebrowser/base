'use server';
/**
 * @fileOverview A Genkit tool for generating images from text prompts.
 *
 * - generateImageTool - A Genkit tool for generating images.
 * - GenerateImageInput - The input type for the tool.
 * - GenerateImageOutput - The return type for the tool.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate the image from.'),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
  imageUrl: z.string().describe('The data URI of the generated image.'),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

export const generateImageTool = ai.defineTool(
  {
    name: 'generateImage',
    description:
      'Generates an image from a text prompt. Use this when the user asks to draw, create, generate, or sketch an image.',
    inputSchema: GenerateImageInputSchema,
    outputSchema: GenerateImageOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: input.prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });
    if (!media) {
      throw new Error('No image was generated.');
    }
    return {imageUrl: media.url};
  }
);
