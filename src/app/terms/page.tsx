
import { PageLayout } from "@/components/page-layout";

export default function TermsOfServicePage() {
  return (
    <PageLayout
      title="Terms of Service"
      description={`Last updated: ${new Date().toLocaleDateString()}`}
    >
      <div className="space-y-6 text-muted-foreground">
        <p>
          By accessing the website at OngwaeGPT, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.
        </p>

        <section>
          <h2 className="text-xl font-bold font-headline text-foreground mb-2">1. Use License</h2>
          <p>
            Permission is granted to temporarily download one copy of the materials (information or software) on OngwaeGPT's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not: modify or copy the materials; use the materials for any commercial purpose, or for any public display (commercial or non-commercial); attempt to decompile or reverse engineer any software contained on OngwaeGPT's website; remove any copyright or other proprietary notations from the materials; or transfer the materials to another person or "mirror" the materials on any other server.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold font-headline text-foreground mb-2">2. User Conduct</h2>
          <p>
            You agree not to use the service to generate content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable. We reserve the right to terminate accounts that violate these terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold font-headline text-foreground mb-2">3. Disclaimer</h2>
          <p>
            The materials on OngwaeGPT's website are provided on an 'as is' basis. OngwaeGPT makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights. The AI may produce inaccurate information; do not rely on its responses as a substitute for professional advice.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold font-headline text-foreground mb-2">4. Limitations</h2>
          <p>
            In no event shall OngwaeGPT or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on OngwaeGPT's website, even if OngwaeGPT or a OngwaeGPT authorized representative has been notified orally or in writing of the possibility of such damage.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold font-headline text-foreground mb-2">5. Governing Law</h2>
          <p>
            These terms and conditions are governed by and construed in accordance with the laws of the applicable jurisdiction and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
          </p>
        </section>
      </div>
    </PageLayout>
  );
}
