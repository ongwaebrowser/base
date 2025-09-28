import { ChatLayout } from '@/components/chat/chat-layout';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="p-4 text-center">
        <h1 className="text-2xl font-bold text-primary">ongwaeGPT</h1>
        <p className="text-sm text-muted-foreground">
          By Josephat Ongwae Onyinkwa
        </p>
      </header>
      <main className="flex flex-1 flex-col items-center p-4 md:justify-center">
        <Card className="w-full max-w-4xl flex-1 md:flex-initial md:h-[70vh] shadow-lg">
          <CardContent className="p-0 h-full">
            <ChatLayout />
          </CardContent>
        </Card>
      </main>
      <footer className="p-4 text-center text-xs text-muted-foreground">
        <div className="flex justify-center gap-4">
          <Link href="#" className="hover:underline">
            Terms of Service
          </Link>
          <Link href="#" className="hover:underline">
            Privacy Policy
          </Link>
        </div>
      </footer>
    </div>
  );
}
