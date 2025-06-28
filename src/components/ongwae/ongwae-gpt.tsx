"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowUp, Bot, Loader, User, Zap } from "lucide-react";
import { ChatMessage } from "./chat-message";
import type { Message } from "@/lib/types";
import { deepSearch } from "@/ai/flows/deep-search";
import { quickResponse } from "@/ai/flows/quick-response";
import { generateImage } from "@/ai/flows/generate-image";
import { useToast } from "@/hooks/use-toast";

const IMAGE_KEYWORDS = ["generate image", "create image", "draw", "sketch", "picture of"];
const TYPING_SPEED_MS = 15;

export function OngwaeGpt() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeepSearch, setIsDeepSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedMessages = localStorage.getItem("ongwaeGptMessages");
      const parsedMessages = storedMessages ? JSON.parse(storedMessages) : null;
      if (parsedMessages && Array.isArray(parsedMessages) && parsedMessages.length > 0) {
        setMessages(parsedMessages);
      } else {
        setMessages([
          {
            id: "1",
            role: "assistant",
            content:
              "Hello! I am **OngwaeGPT**, an AI assistant created by Josephat Ongwae Onyinkwa. I can generate text, images, tables, and code. How can I assist you today?",
            isStreaming: false,
          },
        ]);
      }
    } catch (error) {
       setMessages([
          {
            id: "1",
            role: "assistant",
            content:
              "Hello! I am **OngwaeGPT**, an AI assistant created by Josephat Ongwae Onyinkwa. I can generate text, images, tables, and code. How can I assist you today?",
            isStreaming: false,
          },
        ]);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("ongwaeGptMessages", JSON.stringify(messages));
    }
  }, [messages]);

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
    const newMessages = [...messages, userMessage]
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "Thinking...",
      isStreaming: true,
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      let responseContent = "";
      let responseType: 'text' | 'image' = 'text';

      const isImageRequest = IMAGE_KEYWORDS.some(keyword => input.toLowerCase().includes(keyword));
      const historyForAI = newMessages.slice(0, -1).map(({ role, content }) => ({ role, content }));

      if (isImageRequest) {
        const { imageUrl } = await generateImage({ prompt: input });
        responseContent = imageUrl;
        responseType = 'image';
        
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId ? { ...msg, content: responseContent, type: responseType, isStreaming: false } : msg
          )
        );
        setIsLoading(false);
      } else {
        const aiCall = isDeepSearch
          ? deepSearch({ history: historyForAI, query: input })
          : quickResponse({ history: historyForAI, query: input });
        
        const result = await aiCall;
        responseContent = isDeepSearch ? (result as any).results : (result as any).response;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId ? { ...msg, content: responseContent, isStreaming: true } : msg
          )
        );
        
        const typingDuration = responseContent.length * TYPING_SPEED_MS;
        setTimeout(() => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId ? { ...msg, isStreaming: false } : msg
            )
          );
          setIsLoading(false);
        }, typingDuration);
      }
    } catch (error) {
      console.error("AI Error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        variant: "destructive",
        title: "Oh no! Something went wrong.",
        description: `There was a problem with your request: ${errorMessage}`,
      });
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, content: "Sorry, I encountered an error. Please try again.", isStreaming: false }
            : msg
        )
      );
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="flex h-screen flex-col bg-background text-foreground">
        <header className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-3">
            <Bot className="h-8 w-8 text-primary" />
            <div className="flex flex-col">
              <h1 className="font-headline text-xl font-bold">OngwaeGPT AI</h1>
              <p className="text-xs text-muted-foreground">
                By <a href="https://o-browser.blogspot.com" target="_blank" rel="noopener noreferrer" className="hover:underline">Josephat Ongwae Onyinkwa (Oapps Inc.)</a>
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 pb-32">
          <div className="mx-auto max-w-4xl space-y-8">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </main>

        <footer className="fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur-sm">
          <div className="mx-auto max-w-4xl p-4">
            <form onSubmit={handleSubmit} className="relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask OngwaeGPT anything..."
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
            <div className="mt-3 flex flex-col items-center justify-center gap-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="deep-search-mode"
                  checked={isDeepSearch}
                  onCheckedChange={setIsDeepSearch}
                  disabled={isLoading}
                />
                <Label htmlFor="deep-search-mode" className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Zap className={`h-4 w-4 transition-colors ${isDeepSearch ? 'text-primary' : ''}`} />
                  {isDeepSearch ? "Deep Search" : "Quick Response"}
                </Label>
              </div>
               <p className="text-center text-xs text-muted-foreground">
                OngwaeGPT can make mistakes. Double check it!
              </p>
            </div>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}
