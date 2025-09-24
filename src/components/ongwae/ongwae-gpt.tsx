
"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ArrowUp, Loader, Zap, Moon, Sun, MessageSquarePlus, Trash2, LogOut, PanelLeft, X, UserX } from "lucide-react";
import { ChatMessage } from "./chat-message";
import type { Message, Chat } from "@/lib/types";
import { deepSearch } from "@/ai/flows/deep-search";
import { quickResponse } from "@/ai/flows/quick-response";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { Logo } from "./logo";
import { addMessageToChat, createChat, deleteChat } from "@/lib/actions/chat";
import { deleteUserAccount, logout } from "@/lib/actions/user";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { cn } from "@/lib/utils";

const TYPING_SPEED_MS = 15;

const INITIAL_MESSAGE: Message = {
  id: "1",
  role: "model",
  content: "Hello there, how may I be of help?",
  isStreaming: false,
};

interface OngwaeGptProps {
  user: { userId: string; name: string };
  initialChats: Chat[];
  initialActiveChat: Chat | null;
}

export function OngwaeGpt({ user, initialChats, initialActiveChat }: OngwaeGptProps) {
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [activeChat, setActiveChat] = useState<Chat | null>(initialActiveChat);
  const [messages, setMessages] = useState<Message[]>(initialActiveChat?.messages.length ? initialActiveChat.messages : [INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeepSearch, setIsDeepSearch] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleteAccountConfirmOpen, setIsDeleteAccountConfirmOpen] = useState(false);


  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    setActiveChat(initialActiveChat);
    setMessages(initialActiveChat?.messages.length ? initialActiveChat.messages : [INITIAL_MESSAGE]);
    setChats(initialChats);
  }, [initialActiveChat, initialChats]);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleCreateNewChat = async () => {
    if (isLoading) return;
    router.push('/chat');
    setIsSidebarOpen(false);
  };

  const handleSelectChat = (chatId: string) => {
    if (isLoading) return;
    const selectedChat = chats.find(c => c._id.toString() === chatId);
    if (selectedChat) {
      router.push(`/chat/${selectedChat._id}`);
    }
    setIsSidebarOpen(false);
  };

  const handleDeleteChat = async () => {
    if (!itemToDelete) return;
    try {
      await deleteChat(itemToDelete);
      const updatedChats = chats.filter(c => c._id.toString() !== itemToDelete);
      setChats(updatedChats);
      toast({ title: 'Chat Deleted' });
      
      if (activeChat?._id.toString() === itemToDelete) {
        router.push('/chat');
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error deleting chat' });
    }
    setItemToDelete(null);
  };

  const handleDeleteAccount = async () => {
    try {
      const result = await deleteUserAccount();
      if (result.success) {
        toast({ title: "Account Deleted", description: "Your account and data have been permanently removed." });
        await handleLogout();
      } else {
        toast({ variant: "destructive", title: "Deletion Failed", description: result.message });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error deleting account' });
    }
    setIsDeleteAccountConfirmOpen(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    let currentChatId = activeChat?._id.toString();
    let isNewChat = !currentChatId;

    if (isNewChat) {
      try {
        const newChat = await createChat(user.userId, input);
        if (newChat) {
          setChats(prev => [newChat, ...prev]);
          setActiveChat(newChat);
          currentChatId = newChat._id.toString();
          router.replace(`/chat/${currentChatId}`, { scroll: false });
        } else {
          throw new Error("Failed to create new chat.");
        }
      } catch (error) {
        toast({ variant: "destructive", title: "Could not start a new chat." });
        setIsLoading(false);
        setMessages(prev => prev.slice(0, -1));
        return;
      }
    }
    
    if (currentChatId) {
      await addMessageToChat(currentChatId, userMessage);
       if (isNewChat) {
          const updatedChats = chats.map(c => c._id.toString() === currentChatId ? {...c, title: input.substring(0, 30)} : c);
          if(!updatedChats.find(c => c._id.toString() === currentChatId)) {
            const newChat = activeChat ? {...activeChat, title: input.substring(0, 30)} : null;
            if(newChat) updatedChats.unshift(newChat);
          }
          setChats(updatedChats);
       }
    }

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
      const historyForAI = [...(activeChat?.messages || []), userMessage]
        .slice(0, -1) 
        .filter(msg => msg.content) 
        .map(({ role, content, type }) => {
          if (type === 'image') {
            return { role, content: '[An image was generated]' };
          }
          return { role, content };
        });

      const aiCallPayload = historyForAI.length > 0
        ? { history: historyForAI, query: input }
        : { query: input };

      const aiCall = isDeepSearch
        ? deepSearch(aiCallPayload)
        : quickResponse(aiCallPayload);

      const result = await aiCall;

      const finalAssistantMessage: Message = {
        id: assistantMessageId,
        role: "model",
        content: result.response,
        type: result.isImage ? 'image' : 'text',
        isStreaming: !result.isImage,
      };
      
      if (currentChatId) {
        await addMessageToChat(currentChatId, finalAssistantMessage);
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId ? { ...finalAssistantMessage, isLoading: false, isStreaming: !result.isImage } : msg
        )
      );

      if (result.isImage) {
        setIsLoading(false);
      } else {
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

       if (error instanceof Error) {
        if (error.message.includes('The input token count')) {
          errorMessageContent = "Sorry, the conversation history is too long. Please start a new chat.";
          toast({ variant: "destructive", title: "Conversation Limit Reached" });
        } else if (error.message.includes('503 Service Unavailable') || error.message.includes('The model is overloaded')) {
          errorMessageContent = "The AI is currently busy. Please wait a moment and try again.";
          toast({ variant: "destructive", title: "AI Service Busy" });
        } else {
          toast({ variant: "destructive", title: "Oh no! Something went wrong."});
        }
      } else {
          toast({ variant: "destructive", title: "Oh no! Something went wrong."});
      }

      const errorAssistantMessage = {
          id: assistantMessageId,
          role: 'model' as const,
          content: errorMessageContent,
          isStreaming: false,
          isLoading: false
      };
      
      setMessages((prev) => prev.map((msg) => msg.id === assistantMessageId ? errorAssistantMessage : msg));
      if(currentChatId) {
        addMessageToChat(currentChatId, errorAssistantMessage);
      }
      setIsLoading(false);
    }
  };
  
  const handleLogout = async () => {
    await logout();
    router.push('/');
    router.refresh();
  };
  
  const getPageTitle = () => {
    if (activeChat) {
      return activeChat.title;
    }
    return "New Chat";
  }

  return (
    <TooltipProvider>
      <div className="flex h-screen flex-col bg-transparent text-foreground">
        
        <aside className="hidden md:flex fixed top-0 left-0 h-full w-72 flex-col border-r bg-slate-950/80 backdrop-blur-sm p-4 z-10">
          <ChatSidebarContent
            user={user}
            chats={chats}
            activeChatId={activeChat?._id.toString()}
            onNewChat={handleCreateNewChat}
            onSelectChat={handleSelectChat}
            onDeleteChat={(id) => setItemToDelete(id)}
            onDeleteAccount={() => setIsDeleteAccountConfirmOpen(true)}
            onLogout={handleLogout}
          />
        </aside>

        <div className="flex h-full flex-col md:pl-72">
            <Card className="flex h-full flex-col bg-card/60 backdrop-blur-sm m-4 rounded-xl">
                <CardHeader className="flex flex-row items-center justify-between border-b">
                    <div className="flex items-center gap-3">
                    <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                        <SheetTrigger asChild className="md:hidden">
                        <Button variant="ghost" size="icon">
                            <PanelLeft />
                        </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-72 p-0 bg-slate-950/80 backdrop-blur-sm">
                        <ChatSidebarContent
                            user={user}
                            chats={chats}
                            activeChatId={activeChat?._id.toString()}
                            onNewChat={handleCreateNewChat}
                            onSelectChat={handleSelectChat}
                            onDeleteChat={(id) => setItemToDelete(id)}
                            onDeleteAccount={() => setIsDeleteAccountConfirmOpen(true)}
                            onLogout={handleLogout}
                            isSheet
                        />
                        </SheetContent>
                    </Sheet>
                    
                    <div className="flex items-center gap-2">
                        <Logo className="h-8 w-8 text-primary" />
                        <div>
                        <h1 className="font-headline text-xl font-bold">OngwaeGPT</h1>
                        <p className="text-xs text-muted-foreground truncate max-w-[150px] sm:max-w-xs">{getPageTitle()}</p>
                        </div>
                    </div>
                    </div>
                    <div className="flex items-center gap-2">
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
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4">
                    <div className="mx-auto max-w-4xl space-y-8">
                    {messages.map((message) => (
                        <ChatMessage key={message.id} message={message} />
                    ))}
                    <div ref={messagesEndRef} />
                    </div>
                </CardContent>
                <CardFooter className="flex-col items-start gap-2 border-t p-4">
                    <form onSubmit={handleSubmit} className="relative w-full">
                        <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask OngwaeGPT anything..."
                        className="h-12 w-full rounded-full bg-secondary/50 py-3 pl-5 pr-28 text-base shadow-inner"
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
                    <div className="flex w-full items-center justify-between">
                        <div className="flex items-center space-x-2">
                        <Switch
                            id="deep-search-mode"
                            checked={isDeepSearch}
                            onCheckedChange={setIsDeepSearch}
                            disabled={isLoading}
                        />
                        <Label htmlFor="deep-search-mode" className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Zap className={cn('h-4 w-4 transition-colors', isDeepSearch ? 'text-primary' : '')} />
                            {isDeepSearch ? "Deep Search" : "Quick Response"}
                        </Label>
                        </div>
                        <p className="text-center text-[10px] text-muted-foreground">
                        OngwaeGPT can make mistakes. Consider checking important information.
                        </p>
                    </div>
                </CardFooter>
            </Card>
        </div>

        <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this chat history. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteChat}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={isDeleteAccountConfirmOpen} onOpenChange={setIsDeleteAccountConfirmOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Your Account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete your account and all of your chat history. This action is irreversible. Are you sure you want to continue?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={handleDeleteAccount}>Delete Account</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}


interface ChatSidebarContentProps {
  user: { name: string };
  chats: Chat[];
  activeChatId?: string;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
  isSheet?: boolean;
}

function ChatSidebarContent({ user, chats, activeChatId, onNewChat, onSelectChat, onDeleteChat, onLogout, onDeleteAccount, isSheet = false}: ChatSidebarContentProps) {
  return (
    <div className="flex h-full flex-col">
       <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-3">
            <Logo className="h-8 w-8 text-primary" />
            <h1 className="font-headline text-xl font-bold">My Chats</h1>
          </div>
          {isSheet && (
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <X className="h-5 w-5" />
              </Button>
            </SheetTrigger>
          )}
        </div>
      <div className="p-4">
        <Button className="w-full" onClick={onNewChat}>
          <MessageSquarePlus className="mr-2" />
          New Chat
        </Button>
      </div>
      <nav className="flex-1 overflow-y-auto px-4">
        <ul className="space-y-1">
          {chats.map(chat => (
            <li key={chat._id.toString()}>
              <div
                className={cn(`group flex items-center justify-between rounded-md p-2 text-sm font-medium cursor-pointer transition-colors`, activeChatId === chat._id.toString() ? 'bg-primary/20 text-primary' : 'hover:bg-muted/50')}
                onClick={() => onSelectChat(chat._id.toString())}
              >
                <span className="truncate flex-1">{chat.title}</span>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`h-7 w-7 invisible group-hover:visible transition-opacity ${activeChatId === chat._id.toString() ? 'visible' : ''}`}
                            onClick={(e) => { e.stopPropagation(); onDeleteChat(chat._id.toString()); }}
                        >
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Delete chat</p></TooltipContent>
                </Tooltip>
              </div>
            </li>
          ))}
        </ul>
      </nav>
      <div className="border-t p-4">
         <div className="text-sm p-2 mb-2 rounded-md bg-muted/50">
           <p className="font-semibold">{user.name}</p>
         </div>
         <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={onDeleteAccount}>
           <UserX className="mr-2" />
           Delete Account
         </Button>
         <Button variant="outline" className="w-full mt-2" onClick={onLogout}>
           <LogOut className="mr-2" />
           Logout
         </Button>
      </div>
    </div>
  );
}

    