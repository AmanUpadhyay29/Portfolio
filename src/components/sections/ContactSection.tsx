import { site } from "@/content/site";

const btn = "rounded-[14px] px-5 py-3 text-[15px] font-semibold leading-none";

export default function ContactSection() {
  return (
    <section id="contact" className="scroll-mt-20 py-16">
      <h2 className="font-display text-3xl font-semibold min-[960px]:text-4xl">Contact</h2>
      <p className="mt-4 max-w-[40em] text-[17px] text-muted">
        The quickest way to reach me is email. I am based in {site.location}.
      </p>
      <div className="mt-6 flex flex-wrap gap-2.5">
        <a href={`mailto:${site.links.email}`} className={`${btn} bg-primary text-on-primary`}>
          {site.links.email}
        </a>
        <a href={site.links.github} className={`${btn} border border-line bg-panel text-fg`}>
          GitHub
        </a>
        <a href={site.links.linkedin} className={`${btn} border border-line bg-panel text-fg`}>
          LinkedIn
        </a>
        {site.resume.available && (
          <a href={site.resume.href} className={`${btn} border border-line bg-panel text-fg`}>
            Résumé
          </a>
        )}
      </div>
    </section>
  );
}
