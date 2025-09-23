// src/app/login/page.tsx
"use client";

import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader, LogIn } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ongwae/logo";
import { useRouter, useSearchParams } from 'next/navigation';
import { verifyLogin } from "@/lib/actions/user";

function LoginPageContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role');

  const isAnAdminLogin = role === 'admin';
  const title = isAnAdminLogin ? "Admin Portal" : "Welcome Back";
  const description = isAnAdminLogin ? "Sign in to manage OngwaeGPT" : "Sign in to continue to OngwaeGPT";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await verifyLogin({ email, password });

      if (result.success) {
        toast({
          title: "Login Successful!",
          description: "Redirecting...",
        });
        
        // Refresh the page to make sure the middleware recognizes the new session
        // and redirects the user correctly.
        router.refresh(); 
      } else {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: result.message,
        });
        setIsLoading(false);
      }
    } catch (error) {
        console.error("Login page error:", error);
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "An unexpected error occurred.",
        });
        setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <Link href="/" aria-label="Home">
            <Logo className="h-12 w-12 text-primary" />
          </Link>
          <h1 className="mt-4 font-headline text-3xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader className="animate-spin" /> : <LogIn className="mr-2" />}
            Sign In
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/signup" className="font-semibold text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
