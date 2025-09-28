import { cn } from '@/lib/utils';
import { User, Bot } from 'lucide-react';
import type { Message } from '@/lib/types';

interface ChatAvatarProps {
  role: Message['role'];
}

export function ChatAvatar({ role }: ChatAvatarProps) {
  const isUser = role === 'user';
  return (
    <div
      className={cn(
        'flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border text-white shadow',
        isUser ? 'bg-primary' : 'bg-accent-foreground'
      )}
    >
      {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
    </div>
  );
}
