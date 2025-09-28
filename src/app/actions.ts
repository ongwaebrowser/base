'use server';

import { generateAIResponse } from '@/ai/flows/generate-ai-responses';
import { adjustResponseTone } from '@/ai/flows/adjust-response-tone';
import type { Message } from '@/lib/types';
import { nanoid } from 'nanoid';

export async function sendMessage(messages: Message[]) {
  const userMessage = messages[messages.length - 1];

  if (!userMessage || userMessage.role !== 'user') {
    return {
      id: nanoid(),
      role: 'assistant' as const,
      content: 'An error occurred. Please try again.',
    };
  }

  try {
    const aiResponse = await generateAIResponse({ message: userMessage.content });

    const conversationContext = messages
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    const adjustedResponse = await adjustResponseTone({
      text: aiResponse.response,
      conversationContext: conversationContext,
    });

    return {
      id: nanoid(),
      role: 'assistant' as const,
      content: adjustedResponse.adjustedText,
    };
  } catch (error) {
    console.error(error);
    return {
      id: nanoid(),
      role: 'assistant' as const,
      content: 'Sorry, I encountered an error. Please try again.',
    };
  }
}
