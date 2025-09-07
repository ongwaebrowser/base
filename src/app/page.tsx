import { OngwaeGpt } from "@/components/ongwae/ongwae-gpt";
import { getSession } from "@/lib/actions/user";
import { redirect } from "next/navigation";
import { getChatsForUser } from "@/lib/actions/chat";

export default async function Home() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const initialChats = await getChatsForUser(session.userId);
  
  return <OngwaeGpt user={session} initialChats={initialChats} initialActiveChat={null} />;
}
