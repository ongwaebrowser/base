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

export default function PrivacyPolicy() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Privacy Policy</CardTitle>
          <CardDescription>Last updated: {new Date().toLocaleDateString()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Welcome to OngwaeGPT. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.
          </p>
          <h3 className="font-semibold">Information We Collect</h3>
          <p>
            We may collect information that you provide directly to us, such as when you create an account, send a message, or otherwise communicate with us. This information may include your name, email address, and the content of your messages.
          </p>
           <h3 className="font-semibold">How We Use Your Information</h3>
          <p>
            We use the information we collect to provide, maintain, and improve our services, including to respond to your comments, questions, and requests, and to personalize your experience.
          </p>
          <h3 className="font-semibold">Data Security</h3>
           <p>
            We use reasonable measures to help protect your information from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction.
          </p>
          <h3 className="font-semibold">Changes to This Policy</h3>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
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
