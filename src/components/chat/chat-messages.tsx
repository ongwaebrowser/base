'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Message } from '@/lib/types';
import { ChatAvatar } from './chat-avatar';
import { Loader2 } from 'lucide-react';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const scrollableContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const container = scrollableContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div ref={scrollableContainerRef} className="h-full space-y-6 overflow-y-auto px-4 py-6">
      {messages.map((message, index) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={cn(
            'flex items-start gap-4',
            message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
          )}
        >
          <ChatAvatar role={message.role} />
          <div
            className={cn(
              'max-w-[80%] rounded-lg p-3 text-sm shadow-sm',
              message.role === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card'
            )}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        </motion.div>
      ))}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex items-start gap-4"
        >
          <ChatAvatar role="assistant" />
          <div className="flex items-center justify-center rounded-lg bg-card p-3 shadow-sm">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        </motion.div>
      )}
    </div>
  );
}
