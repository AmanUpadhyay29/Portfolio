import { site } from "@/content/site";

export default function SkillsSection() {
  return (
    <section id="skills" className="scroll-mt-20 py-16">
      <h2 className="font-display text-3xl font-semibold min-[960px]:text-4xl">Skills</h2>
      <div className="mt-6 grid gap-10 min-[720px]:grid-cols-3">
        {site.skills.map((g) => (
          <div key={g.group}>
            <h3 className="font-mono text-xs font-medium tracking-[.06em] text-primary-ink">{g.group.toUpperCase()}</h3>
            <ul className="mt-3 space-y-3 text-[17px]">
              {g.items.map((i) => (
                <li key={i.name}>
                  {i.name}
                  <span className="block text-[15px] text-muted">{i.where}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
