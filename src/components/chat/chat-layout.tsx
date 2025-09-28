'use client';

import * as React from 'react';
import { nanoid } from 'nanoid';
import { useFormState } from 'react-dom';
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
} from '@/components/ui/sidebar';
import { ChatMessages } from '@/components/chat/chat-messages';
import { ChatInput } from '@/components/chat/chat-input';
import { sendMessage } from '@/app/actions';
import type { Message } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/logo';
import { PlusCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const initialState: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: "Hello! I'm OngwaeGPT. How can I help you today?",
  },
];

export function ChatLayout() {
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
          description: result.error,
          variant: 'destructive',
        });
        setMessages((prev) => prev.slice(0, -1));
      }
    });
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="text-lg font-semibold">OngwaeGPT</span>
          </div>
          <SidebarTrigger />
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
      </Sidebar>
      <SidebarInset>
        <div className="flex h-full flex-col">
          <div className="flex-1 overflow-y-auto">
            <ChatMessages messages={messages} isLoading={isPending} />
          </div>
          <div className="w-full p-4 md:p-6">
            <ChatInput onSubmit={handleFormSubmit} isLoading={isPending} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
