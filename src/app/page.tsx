
import { getSession } from "@/lib/actions/user";
import { redirect } from "next/navigation";
import { AnonymousGpt } from "@/components/ongwae/anonymous-gpt";

export default async function Home() {
  const session = await getSession();

  // If the user is logged in, redirect them to their correct dashboard
  if (session) {
    if (session.role === 'admin') {
      redirect("/admin");
    } else {
      redirect("/chat");
    }
  }
  
  // If the user is not logged in, show the anonymous chat interface
  return <AnonymousGpt />;
}
