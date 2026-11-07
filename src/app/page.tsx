import type { Metadata } from "next";
import { site } from "@/content/site";
import { siteUrl } from "@/lib/site-url";
import { jsonLd } from "@/lib/json-ld";
import Hero from "@/components/sections/Hero";
import JobSection from "@/components/sections/JobSection";
import AboutSection from "@/components/sections/AboutSection";
import ExperienceSection from "@/components/sections/ExperienceSection";
import SkillsSection from "@/components/sections/SkillsSection";
import ContactSection from "@/components/sections/ContactSection";

const title = `${site.name} — Database Administrator & Software Engineer`;
const description =
  "Uptime is my job. Building is my habit. SQL Server DBA by day; I build and run my own trading platform by night.";

export const metadata: Metadata = {
  openGraph: { title, description, images: ["/og/home.png"] },
  twitter: { card: "summary_large_image", images: ["/og/home.png"] },
};

const personLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  jobTitle: "Database Administrator & Software Engineer",
  url: siteUrl().toString(),
  sameAs: [site.links.github, site.links.linkedin],
  address: { "@type": "PostalAddress", addressLocality: "Noida", addressCountry: "IN" },
};

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-[1320px] px-6 min-[960px]:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(personLd) }}
      />
      <Hero />
      <JobSection />
      <AboutSection />
      <ExperienceSection />
      <SkillsSection />
      <ContactSection />
    </main>
  );
}
