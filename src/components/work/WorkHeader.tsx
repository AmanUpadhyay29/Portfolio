import CommitBars from "../CommitBars";
import { asOfLabel, formatCount, getRepo, sinceLabel } from "../../lib/numbers";
import type { WorkMeta } from "../../lib/work-schema";
import WorkIcon from "./WorkIcon";

export default function WorkHeader({ work }: { work: WorkMeta }) {
  const { total, first } = getRepo(work.repo);
  return (
    <header className="mb-10 border-b border-line pb-8">
      <div className="flex items-center gap-5">
        <WorkIcon object={work.object} />
        <div>
          <h1 className="font-display text-4xl font-semibold leading-tight min-[960px]:text-5xl">{work.title}</h1>
          <p className="mt-1 font-mono text-sm text-status">● {work.status}</p>
        </div>
      </div>
      <p className="mt-5 text-lg text-muted">{work.summary}</p>
      <ul className="mt-4 flex flex-wrap gap-2" aria-label="Stack">
        {work.stack.map((s) => (
          <li key={s} className="rounded-full border border-line bg-panel px-3 py-1 font-mono text-xs text-muted">
            {s}
          </li>
        ))}
      </ul>
      <div className="mt-6 max-w-sm">
        <p className="font-mono text-sm text-fg">
          {formatCount(total)} commits · {sinceLabel(first)}
        </p>
        <CommitBars repo={work.repo} days={90} />
        <p className="mt-1 font-mono text-xs text-muted">last 90 days · {asOfLabel()}</p>
      </div>
    </header>
  );
}
