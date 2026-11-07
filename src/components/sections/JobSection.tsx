import Link from "next/link";
import { site } from "@/content/site";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const since = (iso: string) => {
  const [y, m] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${y}`;
};

export default function JobSection() {
  const { job } = site;
  return (
    <section id="job" className="scroll-mt-20 py-16">
      <p className="font-mono text-xs font-medium tracking-[.06em] text-primary-ink">THE DAY JOB</p>
      <h2 className="mt-2 font-display text-3xl font-semibold min-[960px]:text-4xl">
        {job.title}, {job.employer}
      </h2>
      <p className="mt-1 font-mono text-xs font-medium text-status">on duty since {since(job.since)}</p>
      <p className="mt-4 max-w-[40em] text-[17px] leading-relaxed text-muted">{job.summary}</p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 min-[960px]:grid-cols-3">
        {job.areas.map((a) => (
          <li key={a.name} className="rounded-2xl border border-line bg-panel p-5">
            <h3 className="font-display text-lg font-semibold">{a.name}</h3>
            <p className="mt-1 text-[16px] text-muted">{a.items.join(" · ")}</p>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-[17px] text-muted">Employer systems stay private.</p>
      <p className="mt-2 text-[17px]">
        <Link className="font-semibold text-primary-ink underline underline-offset-4" href="/work/matrix#the-database-work" prefetch={false}>
          See the database work I do on my own systems →
        </Link>
      </p>
    </section>
  );
}
