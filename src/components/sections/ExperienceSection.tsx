import { site } from "@/content/site";

export default function ExperienceSection() {
  const { experience, education, certs } = site;
  return (
    <section id="experience" className="scroll-mt-20 py-16">
      <h2 className="font-display text-3xl font-semibold min-[960px]:text-4xl">Experience</h2>
      <ul className="mt-6 max-w-[40em] divide-y divide-line border-y border-line text-[17px]">
        {experience.map((e) => (
          <li key={e.period} className="flex flex-wrap items-baseline justify-between gap-x-4 py-4">
            <span>
              <b className="font-semibold">{e.title}</b>, {e.org}
            </span>
            <span className="font-mono text-xs font-medium text-muted">{e.period}</span>
          </li>
        ))}
        <li className="flex flex-wrap items-baseline justify-between gap-x-4 py-4">
          <span>
            <b className="font-semibold">{education.degree}</b>, {education.school}
          </span>
          <span className="font-mono text-xs font-medium text-muted">{education.period}</span>
        </li>
      </ul>
      <p className="mt-6 font-mono text-xs font-medium text-muted">CERTIFICATIONS</p>
      <ul className="mt-2 text-[17px]">
        {certs.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
    </section>
  );
}
