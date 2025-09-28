'use server';

import { generateAIResponse } from '@/ai/flows/generate-ai-responses';
import { adjustResponseTone } from '@/ai/flows/adjust-response-tone';
import type { Message } from '@/lib/types';
import { nanoid } from 'nanoid';
import {
  saveMessage,
  getMessages,
  deleteMessage,
  clearChat,
} from '@/lib/db';

export async function getChatHistory() {
  return getMessages();
}

export async function sendMessage(messages: Message[]) {
  const userMessage = messages[messages.length - 1];

  if (!userMessage || userMessage.role !== 'user') {
    return {
      id: nanoid(),
      role: 'assistant' as const,
      content: 'An error occurred. Please try again.',
    };
  }

  // Save user message
  await saveMessage(userMessage);

  try {
    const aiResponse = await generateAIResponse({ message: userMessage.content });

    const conversationContext = messages
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    const adjustedResponse = await adjustResponseTone({
      text: aiResponse.response,
      conversationContext: conversationContext,
    });

    const assistantMessage: Message = {
      id: nanoid(),
      role: 'assistant' as const,
      content: adjustedResponse.adjustedText,
    };

    // Save assistant message
    await saveMessage(assistantMessage);

    return assistantMessage;
  } catch (error) {
    console.error(error);
    const errorMessage: Message = {
      id: nanoid(),
      role: 'assistant' as const,
      content: 'Sorry, I encountered an error. Please try again.',
    };
    return errorMessage;
  }
}

export async function removeMessage(id: string) {
  await deleteMessage(id);
}

export async function clearAllMessages() {
  await clearChat();
}
