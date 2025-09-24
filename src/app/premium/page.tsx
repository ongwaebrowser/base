
// src/app/premium/page.tsx
"use client";

import { PageLayout } from "@/components/page-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Zap, Image, BrainCircuit } from "lucide-react";
import { requestPremium } from "@/lib/actions/user";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getSession } from "@/lib/actions/user";
import type { User } from "@/lib/types";

export default function PremiumPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [session, setSession] = useState< (User & { userId: string }) | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchSession() {
      const sessionData = await getSession();
      setSession(sessionData);
    }
    fetchSession();
  }, []);

  const handlePayment = async () => {
    setIsLoading(true);
    const result = await requestPremium();
    if (result.success) {
      toast({
        title: "Request Submitted!",
        description: "Your request for a premium subscription has been sent. An admin will approve it shortly after payment confirmation.",
      });
      router.push('/chat');
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.message || "Something went wrong.",
      });
      setIsLoading(false);
    }
  };

  const paymentStatus = session?.subscription?.paymentStatus;

  return (
    <PageLayout
      title="Go Premium"
      description="Unlock the full power of OngwaeGPT and enhance your AI experience."
    >
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Premium Plan</CardTitle>
              <CardDescription>KES 100.00 / week</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="font-semibold text-foreground">Premium features include:</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Access to <span className="font-semibold text-foreground">Deep Search</span> for more comprehensive answers.</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Higher message limits.</span>
                </li>
                 <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Priority access to new features.</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Generate more images with our advanced models.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
           <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Payment Instructions</CardTitle>
              <CardDescription>Follow these steps to upgrade.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">For Kenyan Users (M-Pesa):</h3>
                <p className="text-muted-foreground">1. Go to your M-Pesa menu.</p>
                <p className="text-muted-foreground">2. Select "Lipa na M-Pesa".</p>
                <p className="text-muted-foreground">3. Select "Buy Goods and Services".</p>
                <p className="text-muted-foreground">4. Enter Till Number: <span className="font-bold text-primary">6664345</span></p>
                <p className="text-muted-foreground">5. Enter Amount: <span className="font-bold text-primary">KES 100</span></p>
                <p className="text-muted-foreground">6. Complete the transaction.</p>
              </div>
               <div>
                <h3 className="font-semibold text-foreground mb-2">For International Users (M-Pesa Global):</h3>
                <p className="text-muted-foreground">1. Use your provider's service to send money to Kenya.</p>
                <p className="text-muted-foreground">2. Send to M-Pesa Number: <span className="font-bold text-primary">+254720796321</span></p>
                <p className="text-muted-foreground">3. Amount: Equivalent of KES 100 in your local currency.</p>
              </div>
            </CardContent>
            <CardFooter className="flex-col items-stretch space-y-4">
               <p className="text-xs text-center text-muted-foreground">After completing the payment, click the button below. Your account will be upgraded once an admin verifies the transaction.</p>
                {paymentStatus === 'pending' ? (
                  <Button disabled className="w-full">
                    Approval Pending
                  </Button>
                ) : (
                  <Button onClick={handlePayment} disabled={isLoading} className="w-full">
                    {isLoading ? "Submitting..." : "I Have Paid"}
                  </Button>
                )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
