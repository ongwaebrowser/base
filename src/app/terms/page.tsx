import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Terms of Service</CardTitle>
          <CardDescription>Last updated: {new Date().toLocaleDateString()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Welcome to OngwaeGPT. These Terms of Service ("Terms") govern your use of our application and services. By accessing or using our service, you agree to be bound by these Terms.
          </p>
          <h3 className="font-semibold">1. Use of Service</h3>
          <p>
            You agree to use our service in compliance with all applicable laws and regulations. You are responsible for all activities that occur under your account.
          </p>
          <h3 className="font-semibold">2. Prohibited Conduct</h3>
          <p>
            You agree not to use the service for any unlawful purpose or to engage in any conduct that could damage, disable, or impair the service.
          </p>
          <h3 className="font-semibold">3. Intellectual Property</h3>
          <p>
            The service and its original content, features, and functionality are and will remain the exclusive property of OngwaeGPT and its licensors.
          </p>
          <h3 className="font-semibold">4. Termination</h3>
          <p>
            We may terminate or suspend your access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
          </p>
          <h3 className="font-semibold">5. Limitation of Liability</h3>
           <p>
            In no event shall OngwaeGPT, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages.
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Chat
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
