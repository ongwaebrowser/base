'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Message } from '@/lib/types';
import { ChatAvatar } from './chat-avatar';
import { Loader2, Trash } from 'lucide-react';
import { Button } from '../ui/button';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  onDeleteMessage: (id: string) => void;
}

export function ChatMessages({ messages, isLoading, onDeleteMessage }: ChatMessagesProps) {
  const scrollableContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const container = scrollableContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div ref={scrollableContainerRef} className="h-full space-y-6 overflow-y-auto px-4 py-6">
      {messages.map((message) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={cn(
            'group flex items-start gap-4',
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
           {message.role === 'user' && (
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                onClick={() => onDeleteMessage(message.id)}
              >
                <Trash className="h-4 w-4" />
                <span className="sr-only">Delete message</span>
              </Button>
            )}
        </motion.div>
      ))}
      {isLoading && messages[messages.length - 1]?.role === 'user' && (
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
       {isLoading && messages.length === 0 && (
         <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
         </div>
      )}
    </div>
  );
}
