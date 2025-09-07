
import { PageLayout } from "@/components/page-layout";

export default function PrivacyPolicyPage() {
  return (
    <PageLayout
      title="Privacy Policy"
      description={`Last updated: ${new Date().toLocaleDateString()}`}
    >
      <div className="space-y-6 text-muted-foreground">
        <p>
          Your privacy is important to us. It is OngwaeGPT's policy to respect your privacy regarding any information we may collect from you across our website, and other sites we own and operate.
        </p>

        <section>
          <h2 className="text-xl font-bold font-headline text-foreground mb-2">1. Information We Collect</h2>
          <p>
            We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.
          </p>
          <p className="mt-2">
            The information we collect includes your name, email address, and chat history for the purpose of providing and personalizing your experience. For anonymous users, we do not store chat history permanently.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold font-headline text-foreground mb-2">2. How We Use Your Information</h2>
          <p>
            We use the information we collect to operate and maintain our service, to provide you with the features and functionality of the service, to communicate with you, and to personalize your experience. Your chat data is used to provide context for the AI and is not used for training models without your explicit consent.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold font-headline text-foreground mb-2">3. Data Security</h2>
          <p>
            We take the security of your data seriously and use appropriate technical and organizational measures to protect it against unauthorized or unlawful processing and against accidental loss, destruction, or damage.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold font-headline text-foreground mb-2">4. Data Deletion</h2>
          <p>
            You have the right to delete your account and all associated data at any time. This can be done from your user profile within the application. Once deleted, this data cannot be recovered.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold font-headline text-foreground mb-2">5. Changes to This Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
          </p>
        </section>

        <p>
          If you have any questions about how we handle user data and personal information, feel free to contact us.
        </p>
      </div>
    </PageLayout>
  );
}
