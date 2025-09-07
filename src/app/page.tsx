import { AnonymousGpt } from "@/components/ongwae/anonymous-gpt";
import { getSession } from "@/lib/actions/user";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getSession();

  // If the user is logged in, redirect them to their chat interface
  if (session) {
    if (session.role === 'admin') {
      redirect("/admin");
    }
    redirect("/chat");
  }
  
  // If the user is not logged in, show the anonymous chat interface
  return <AnonymousGpt />;
}
