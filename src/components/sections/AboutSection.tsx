import { site } from "@/content/site";
import Picture from "@/components/Picture";

export default function AboutSection() {
  return (
    <section id="about" className="scroll-mt-20 py-16">
      <h2 className="font-display text-3xl font-semibold min-[960px]:text-4xl">About</h2>
      <div className="mt-6 grid items-start gap-8 min-[720px]:grid-cols-[220px_1fr]">
        <Picture
          src="aman"
          alt="Aman Upadhyay"
          sizes="220px"
          width={220}
          height={220}
          className="h-[220px] w-[220px] rounded-3xl border border-line object-cover"
        />
        <div className="max-w-[40em] space-y-4 text-[17px] leading-relaxed">
          {site.about.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <p className="font-mono text-xs font-medium text-muted">{site.location}</p>
        </div>
      </div>
    </section>
  );
}
