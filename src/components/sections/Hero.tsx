import Link from "next/link";
import { site } from "@/content/site";
import Room from "@/components/room/Room";
import RoomInteractive from "@/components/room/RoomInteractive";
import WindowButton from "@/components/WindowButton";

const btn = "rounded-[14px] px-5 py-3 text-[15px] font-semibold leading-none";
const link = "inline-block py-1 underline decoration-line underline-offset-4 hover:text-fg";

export default function Hero() {
  return (
    <section
      id="top"
      className="grid items-center gap-6 py-8 min-[960px]:min-h-[calc(100vh-72px)] min-[960px]:grid-cols-[.85fr_1.15fr] min-[960px]:gap-4"
    >
      <div className="order-2 min-[960px]:order-1">
        <p className="font-mono text-xs font-medium tracking-[.06em] text-primary-ink">
          <span className="k-night">23:00 · NOIDA · THE NIGHT SHIFT</span>
          <span className="k-day">09:00 · NOIDA · THE DAY SHIFT</span>
        </p>
        <h1 className="mt-4 font-display text-[clamp(44px,5vw,76px)] font-bold leading-[.98] tracking-[-.02em]">
          <span className="block">
            Uptime is my <span className="hl-day">job</span>.
          </span>{" "}
          <span className="block">
            <span className="hl-night">Building</span> is my habit.
          </span>
        </h1>
        <p className="mt-5 max-w-[32em] text-[17px] text-muted">{site.rolesLine}</p>
        <div className="mt-6 flex flex-wrap gap-2.5">
          <a
            href={site.links.github}
            className={`${btn} bg-primary text-on-primary shadow-[var(--shadow-primary)]`}
          >
            GitHub
          </a>
          <a href={site.links.linkedin} className={`${btn} border border-line bg-panel text-fg`}>
            LinkedIn
          </a>
          <a href={`mailto:${site.links.email}`} className={`${btn} border border-line bg-panel text-fg`}>
            Email
          </a>
          {site.resume.available && (
            <a href={site.resume.href} className={`${btn} border border-line bg-panel text-fg`}>
              Résumé
            </a>
          )}
        </div>
        <p className="mt-6 font-mono text-xs font-medium text-muted">hover or tap anything in the room →</p>
        <ul data-text-links className="mt-1 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs font-medium text-muted">
          <li>
            <Link className={link} href="/work/trading-platform" prefetch={false}>
              rack
            </Link>
          </li>
          <li>
            screens:{" "}
            <Link className={link} href="/work/matrix" prefetch={false}>
              Matrix
            </Link>
            {" / "}
            <Link className={link} href="/work/xchart" prefetch={false}>
              XcHart
            </Link>
          </li>
          <li>
            <Link className={link} href="/#job">
              database
            </Link>
          </li>
          <li>
            <Link className={link} href="/#about">
              photo
            </Link>
          </li>
          <li>
            <WindowButton className={`${link} font-mono`} />
          </li>
        </ul>
      </div>
      <div id="room" className="order-1 min-[960px]:order-2">
        <RoomInteractive>
          <Room />
        </RoomInteractive>
      </div>
    </section>
  );
}
