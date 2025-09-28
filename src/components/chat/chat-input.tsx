'use client';

import * as React from 'react';
import { SendHorizonal, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useEnterSubmit } from '@/hooks/use-enter-submit';

interface ChatInputProps {
  onSubmit: (value: string) => Promise<void>;
  isLoading: boolean;
}

export function ChatInput({ onSubmit, isLoading }: ChatInputProps) {
  const [value, setValue] = React.useState('');
  const { formRef, onKeyDown } = useEnterSubmit();
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!value?.trim() || isLoading) return;
    setValue('');
    await onSubmit(value);
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="relative flex w-full items-start justify-between gap-4 rounded-lg border bg-background p-2 shadow-sm"
    >
      <Textarea
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Type your message..."
        className="flex-1 resize-none border-0 shadow-none focus-visible:ring-0"
        rows={1}
        maxRows={5}
        disabled={isLoading}
      />
      <Button
        type="submit"
        size="icon"
        className="shrink-0"
        disabled={isLoading || !value?.trim()}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <SendHorizonal className="h-5 w-5" />
        )}
        <span className="sr-only">Send message</span>
      </Button>
    </form>
  );
}
