'use client';

import * as React from 'react';
import { nanoid } from 'nanoid';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  useSidebar,
  SidebarFooter,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { ChatMessages } from '@/components/chat/chat-messages';
import { ChatInput } from '@/components/chat/chat-input';
import {
  sendMessage,
  getChatHistory,
  removeMessage,
  clearAllMessages,
} from '@/app/actions';
import type { Message } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/logo';
import { PlusCircle, LogIn, UserPlus, Shield, PanelLeft, Trash2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import Link from 'next/link';
import { ThemeToggle } from '../theme-toggle';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { SheetTitle } from '../ui/sheet';
import { useSearchParams } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '../ui/button';

const initialState: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: "Hello! I'm OngwaeGPT. How can I help you today?",
  },
];

function Chat() {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isPending, startTransition] = React.useTransition();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { setOpenMobile } = useSidebar();
  const searchParams = useSearchParams();
  const isAdminVisible = searchParams.get('admin') === 'true';

  React.useEffect(() => {
    async function loadHistory() {
      setLoading(true);
      try {
        const history = await getChatHistory();
        if (history.length > 0) {
          setMessages(history);
        } else {
          setMessages(initialState);
        }
      } catch (error) {
        setMessages(initialState);
        toast({
          title: 'Error',
          description: 'Could not load chat history.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [toast]);

  const handleNewChat = () => {
    setMessages(initialState);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleFormSubmit = async (value: string) => {
    const optimisticMessage: Message = {
      id: nanoid(),
      role: 'user',
      content: value,
    };
    const newMessages = [...messages, optimisticMessage];
    setMessages(newMessages);

    startTransition(async () => {
      const result = await sendMessage(newMessages);
      if ('content' in result) {
        setMessages(prev => [...prev.slice(0, -1), optimisticMessage, result]);
      } else {
        toast({
          title: 'Error',
          description: 'Something went wrong.',
          variant: 'destructive',
        });
        setMessages(prev => prev.slice(0, -1));
      }
    });
  };

  const handleDeleteMessage = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
    startTransition(async () => {
      await removeMessage(id);
    });
  };

  const handleClearChat = () => {
    setMessages(initialState);
    startTransition(async () => {
      await clearAllMessages();
    });
  };

  return (
    <>
      <Sidebar>
        {isMobile && (
          <VisuallyHidden>
            <SheetTitle>Sidebar</SheetTitle>
          </VisuallyHidden>
        )}
        <SidebarHeader className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="text-lg font-semibold">OngwaeGPT</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleNewChat}>
                <PlusCircle />
                <span>New Chat</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarSeparator />
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="#" passHref>
                <SidebarMenuButton>
                  <LogIn />
                  <span>Login</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="#" passHref>
                <SidebarMenuButton>
                  <UserPlus />
                  <span>Sign Up</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            {isAdminVisible && (
              <SidebarMenuItem>
                <Link href="#" passHref>
                  <SidebarMenuButton>
                    <Shield />
                    <span>Admin Login</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="flex h-full flex-col">
          <header className="p-4 flex justify-between items-center border-b">
            <SidebarTrigger className="md:hidden">
              <PanelLeft />
            </SidebarTrigger>
            <div className="flex items-center gap-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Trash2 />
                    <span className="sr-only">Clear Chat</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete your current chat history.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearChat}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <div className="flex-1 text-center">
              <h1 className="text-2xl font-bold text-primary">OngwaeGPT</h1>
              <p className="text-sm text-muted-foreground">
                By Josephat Ongwae Onyinkwa
              </p>
            </div>
            <div className="w-8">
              <ThemeToggle />
            </div>
          </header>
          <div className="flex-1 overflow-y-auto">
            <ChatMessages
              messages={messages}
              isLoading={isPending || loading}
              onDeleteMessage={handleDeleteMessage}
            />
          </div>
          <div className="w-full p-4 md:p-6 border-t">
            <ChatInput onSubmit={handleFormSubmit} isLoading={isPending} />
          </div>
        </div>
      </SidebarInset>
    </>
  );
}

export function ChatLayout() {
  return (
    <React.Suspense
      fallback={
        <div className="flex h-svh w-full items-center justify-center">
          Loading...
        </div>
      }
    >
      <SidebarProvider>
        <Chat />
      </SidebarProvider>
    </React.Suspense>
  );
}
