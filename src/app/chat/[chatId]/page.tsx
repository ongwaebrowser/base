import { OngwaeGpt } from "@/components/ongwae/ongwae-gpt";
import { getSession } from "@/lib/actions/user";
import { redirect } from "next/navigation";
import { getChatsForUser, getChatById } from "@/lib/actions/chat";
import { notFound } from "next/navigation";

interface ChatPageProps {
  params: {
    chatId: string;
  };
}

export default async function ChatPage({ params }: ChatPageProps) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const { chatId } = params;
  
  if (chatId === 'new') {
    redirect('/chat');
  }

  const initialChats = await getChatsForUser(session.userId);
  const initialActiveChat = await getChatById(chatId);

  // Ensure the user has access to this chat
  if (!initialActiveChat || initialActiveChat.userId.toString() !== session.userId) {
    return notFound();
  }
  
  return (
    <OngwaeGpt 
      user={session} 
      initialChats={initialChats}
      initialActiveChat={initialActiveChat}
    />
  );
}
