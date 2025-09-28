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
import { sendMessage } from '@/app/actions';
import type { Message } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/logo';
import { PlusCircle, LogIn, UserPlus, Shield, PanelLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import Link from 'next/link';
import { ThemeToggle } from '../theme-toggle';

const initialState: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: "Hello! I'm OngwaeGPT. How can I help you today?",
  },
];

function Chat() {
  const [messages, setMessages] = React.useState<Message[]>(initialState);
  const [isPending, startTransition] = React.useTransition();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { setOpenMobile } = useSidebar();

  const handleNewChat = () => {
    setMessages(initialState);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleFormSubmit = async (value: string) => {
    const optimisticMessage: Message = { id: nanoid(), role: 'user', content: value };
    const newMessages = [...messages, optimisticMessage];
    setMessages(newMessages);

    startTransition(async () => {
      const result = await sendMessage(newMessages);
      if ('content' in result) {
        setMessages((prev) => [...prev, result]);
      } else {
        toast({
          title: 'Error',
          description: 'Something went wrong.',
          variant: 'destructive',
        });
        setMessages((prev) => prev.slice(0, -1));
      }
    });
  };

  return (
    <>
      <Sidebar>
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
            <SidebarMenuItem>
              <Link href="#" passHref>
                <SidebarMenuButton>
                  <Shield />
                  <span>Admin Login</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="flex h-full flex-col">
          <header className="p-4 flex justify-between items-center border-b">
            <SidebarTrigger className="md:hidden">
              <PanelLeft />
            </SidebarTrigger>
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
            <ChatMessages messages={messages} isLoading={isPending} />
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
    <SidebarProvider>
      <Chat />
    </SidebarProvider>
  );
}
