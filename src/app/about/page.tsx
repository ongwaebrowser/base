
import { PageLayout } from "@/components/page-layout";

export default function AboutPage() {
  return (
    <PageLayout
      title="About OngwaeGPT"
      description="Learn more about our mission and the team behind this platform."
    >
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-bold font-headline mb-3">Our Mission</h2>
          <p>
            Our mission is to provide an accessible, powerful, and intuitive AI assistant that empowers creativity, enhances productivity, and helps users explore the vast possibilities of artificial intelligence. We believe in building tools that are not only technologically advanced but also user-friendly and reliable.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-bold font-headline mb-3">Our Story</h2>
          <p>
            OngwaeGPT is a product of the <span className="font-semibold">ongwaebrowser O browser app</span>, developed and envisioned by <span className="font-semibold">Josephat Ongwae</span>. Born from a passion for cutting-edge technology and a desire to make AI accessible to everyone, OngwaeGPT represents a significant step forward in personal and professional AI assistance.
          </p>
          <p className="mt-4">
            Our journey began with a simple idea: to create an AI that could not only answer questions but also serve as a creative partner, a coding assistant, and a reliable source of information. We are committed to continuous improvement and innovation, ensuring that OngwaeGPT remains at the forefront of AI technology.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-bold font-headline mb-3">Why Choose Us?</h2>
          <p>
            We are dedicated to user privacy, data security, and providing a seamless experience. Our platform is built on a robust infrastructure, ensuring reliability and performance. We are constantly exploring new features, from advanced chat capabilities to powerful image generation, to meet the evolving needs of our users.
          </p>
        </section>
      </div>
    </PageLayout>
  );
}
