// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader, LogIn } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ongwae/logo";
import { useRouter } from 'next/navigation';

// We need a server action for login as well
async function verifyLogin(formData: FormData) {
  'use server'
  // This is a placeholder for actual login verification
  // In a real app, you'd check credentials against the database
  // For now, we'll simulate a successful login
  return { success: true, message: 'Login successful (simulated)' }
}


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // This is a placeholder as well until we implement sessions
    // In a real app, you'd use a library like next-auth
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Login Successful!",
      description: "Redirecting you to the main app... (This is a demo)",
    });
    
    router.push('/');

    // In a real implementation:
    // const formData = new FormData();
    // formData.append('email', email);
    // formData.append('password', password);
    // const result = await verifyLogin(formData);

    // if (result.success) {
    //   toast({
    //     title: "Login Successful!",
    //     description: "Redirecting...",
    //   });
    //   router.push('/');
    // } else {
    //   toast({
    //     variant: "destructive",
    //     title: "Login Failed",
    //     description: result.message,
    //   });
    // }
    
    setIsLoading(false);
  };

  return (
    <div className="flex h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <Logo className="h-12 w-12 text-primary" />
          <h1 className="mt-4 font-headline text-3xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to continue to OngwaeGPT</p>
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