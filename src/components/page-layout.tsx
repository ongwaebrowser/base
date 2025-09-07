
// src/components/page-layout.tsx
import Link from 'next/link';
import { Logo } from './ongwae/logo';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';

interface PageLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function PageLayout({ title, description, children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <span className="font-headline text-xl font-bold">OngwaeGPT</span>
          </Link>
          <Button asChild variant="ghost">
            <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4"/>
                Back to Chat
            </Link>
          </Button>
        </div>
      </header>
      <main className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
        <div className="mb-8 border-b pb-4">
          <h1 className="font-headline text-4xl font-bold">{title}</h1>
          <p className="mt-2 text-muted-foreground">{description}</p>
        </div>
        <article className="prose prose-lg dark:prose-invert max-w-none">
            {children}
        </article>
      </main>
    </div>
  );
}
