"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ArrowUp, Bot, Loader, Trash, User, Zap, BrainCircuit } from "lucide-react";
import { ChatMessage } from "./chat-message";
import type { Message } from "@/lib/types";
import { deepSearch } from "@/ai/flows/deep-search";
import { quickResponse } from "@/ai/flows/quick-response";
import { useToast } from "@/hooks/use-toast";

const TYPING_SPEED_MS = 15;
const INITIAL_MESSAGE: Message = {
  id: "1",
  role: "model",
  content: "Hello there, how may I be of help?",
  isStreaming: false,
};


export function OngwaeGpt() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeepSearch, setIsDeepSearch] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedMessages = localStorage.getItem("ongwaeGptMessages");
      const parsedMessages = storedMessages ? JSON.parse(storedMessages) : null;
      if (parsedMessages && Array.isArray(parsedMessages) && parsedMessages.length > 0) {
        // Migration from 'assistant' to 'model' role
        const migratedMessages = parsedMessages.map((msg: any) => ({
          ...msg,
          role: msg.role === 'assistant' ? 'model' : msg.role,
        }));
        setMessages(migratedMessages);
      } else {
        setMessages([INITIAL_MESSAGE]);
      }
    } catch (error) {
       setMessages([INITIAL_MESSAGE]);
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

  const handleClearChat = () => {
    setMessages([INITIAL_MESSAGE]);
    localStorage.removeItem("ongwaeGptMessages");
    setIsClearConfirmOpen(false);
    toast({
      title: "Chat Cleared",
      description: "Your conversation history has been removed.",
    });
  };

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
      role: "model",
      content: "Thinking...",
      isStreaming: true,
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const historyForAI = newMessages.slice(0, -1).filter(msg => msg.id !== '1').map(({ role, content, type }) => {
        if (type === 'image') {
          return { role, content: '[An image was generated]' };
        }
        return { role, content };
      });

      const aiCall = isDeepSearch
        ? deepSearch({ history: historyForAI, query: input })
        : quickResponse({ history: historyForAI, query: input });
      
      const result = await aiCall;

      if (result.isImage) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId ? { ...msg, content: result.response, type: 'image', isStreaming: false } : msg
          )
        );
        setIsLoading(false);
      } else {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId ? { ...msg, content: result.response, isStreaming: true, type: 'text' } : msg
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
      }
    } catch (error) {
      console.error("AI Error:", error);
      let errorMessageContent = "Sorry, I encountered an error. Please try again.";
      const genericErrorDescription = error instanceof Error ? error.message : "An unknown error occurred.";

      if (error instanceof Error && error.message.includes('The input token count')) {
          errorMessageContent = "Image generation is paused because the conversation history is too long. Text-based chat will continue to work. Please clear the chat for a fresh start.";
          toast({
              variant: "destructive",
              title: "Token Limit Reached",
              description: "The AI's context is full, which may pause image generation.",
          });
      } else {
          toast({
              variant: "destructive",
              title: "Oh no! Something went wrong.",
              description: `There was a problem with your request: ${genericErrorDescription}`,
          });
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, content: errorMessageContent, isStreaming: false }
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
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-brain-circuit text-primary"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.5 3.765 4 4 0 0 0 .5 7.625A3 3 0 1 0 7 19.5a4 4 0 0 0 4.5 3.969 4 4 0 0 0 4.5-3.969A3 3 0 1 0 19 16.5a4 4 0 0 0 .5-7.625 4 4 0 0 0-2.5-3.765A3 3 0 1 0 12 5Z"/><path d="M12 12v1.5"/><path d="M12 6.5V5"/><path d="M16.5 14.5v-2"/><path d="M19.5 12h-2"/><path d="M7.5 9.5v2"/><path d="M4.5 12h2"/><path d="m14.5 17.5 1-1"/><path d="m9.5 17.5-1-1"/><path d="m14.5 6.5 1 1"/><path d="m9.5 6.5-1 1"/></svg>
            <div className="flex flex-col">
              <h1 className="font-headline text-xl font-bold">OngwaeGPT AI</h1>
              <p className="text-xs text-muted-foreground">
                By <a href="https://o-browser.blogspot.com" target="_blank" rel="noopener noreferrer" className="hover:underline">Josephat Ongwae Onyinkwa (Oapps Inc.)</a>
              </p>
            </div>
          </div>
          <AlertDialog open={isClearConfirmOpen} onOpenChange={setIsClearConfirmOpen}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => setIsClearConfirmOpen(true)} disabled={isLoading || messages.length <= 1}>
                  <Trash className="h-5 w-5" />
                  <span className="sr-only">Clear Chat</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clear Chat</p>
              </TooltipContent>
            </Tooltip>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete your current chat history. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearChat}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
               <p className="text-center text-[11px] text-muted-foreground">
                OngwaeGPT can make mistakes. Double check it!
              </p>
            </div>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}
