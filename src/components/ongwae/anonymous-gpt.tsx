
"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowUp, Loader, Moon, Sun } from "lucide-react";
import { ChatMessage } from "./chat-message";
import type { Message } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { Logo } from "./logo";
import { useRouter } from 'next/navigation';
import { anonymousChat } from "@/ai/flows/anonymous-chat";
import Link from "next/link";

const TYPING_SPEED_MS = 25;

const INITIAL_MESSAGE: Message = {
  id: "1",
  role: "model",
  content: "Hello! I'm OngwaeGPT. Ask me anything to see how I work. Sign up to save your chats.",
  isStreaming: false,
};

export function AnonymousGpt() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "model",
      content: "",
      isStreaming: false,
      isLoading: true,
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const historyForAI = [...messages, userMessage]
        .slice(0, -1)
        .filter(msg => msg.id !== '1' && msg.content)
        .map(({ role, content, type }) => {
          if (type === 'image') {
            return { role, content: '[An image was generated]' };
          }
          return { role, content };
        });

      const aiCallPayload = historyForAI.length > 0
        ? { history: historyForAI, query: input }
        : { query: input };

      const result = await anonymousChat(aiCallPayload);

      const finalAssistantMessage: Message = {
        id: assistantMessageId,
        role: "model",
        content: result.response,
        type: 'text',
        isStreaming: true,
      };

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId ? { ...finalAssistantMessage, isLoading: false, isStreaming: true } : msg
        )
      );

      const typingDuration = result.response.length * TYPING_SPEED_MS;
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId ? { ...msg, isStreaming: false } : msg
          )
        );
        setIsLoading(false);
      }, typingDuration);

    } catch (error) {
      console.error("AI Error:", error);
      const errorMessageContent = "Sorry, I encountered an error. Please try again.";
      toast({ variant: "destructive", title: "Oh no! Something went wrong." });

      const errorAssistantMessage = {
          id: assistantMessageId,
          role: 'model' as const,
          content: errorMessageContent,
          isStreaming: false,
          isLoading: false
      };
      
      setMessages((prev) => prev.map((msg) => msg.id === assistantMessageId ? errorAssistantMessage : msg));
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="flex h-screen flex-col bg-background text-foreground">
        <div className="flex h-full flex-col">
          <header className="flex items-center justify-between border-b p-4">
            <div className="flex items-center gap-2">
               <Logo className="h-8 w-8 text-primary" />
               <div>
                <h1 className="font-headline text-xl font-bold">OngwaeGPT AI</h1>
                <p className="text-xs text-muted-foreground">Anonymous Chat</p>
               </div>
            </div>
            <div className="flex items-center gap-2">
                <Button asChild variant="secondary">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                   <Link href="/signup">Sign Up</Link>
                </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
                    <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle Theme</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 pb-48">
            <div className="mx-auto max-w-4xl space-y-8">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </main>

          <footer className="fixed bottom-0 right-0 left-0 border-t bg-background/80 backdrop-blur-sm">
            <div className="mx-auto max-w-4xl p-4">
              <form onSubmit={handleSubmit} className="relative">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question to try OngwaeGPT..."
                  className="h-12 w-full rounded-full bg-card py-3 pl-5 pr-28 text-base shadow-lg"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-4 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full"
                  disabled={isLoading || !input.trim()}
                >
                  {isLoading ? <Loader className="animate-spin" /> : <ArrowUp />}
                  <span className="sr-only">Send</span>
                </Button>
              </form>
               <p className="mt-3 text-center text-[10px] text-muted-foreground">
                OngwaeGPT can make mistakes. Consider checking important information.
              </p>
              <div className="mt-2 flex justify-center gap-4 text-xs text-muted-foreground">
                <Link href="/about" className="hover:text-primary">About</Link>
                <Link href="/terms" className="hover:text-primary">Terms</Link>
                <Link href="/privacy" className="hover:text-primary">Privacy</Link>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </TooltipProvider>
  );
}
