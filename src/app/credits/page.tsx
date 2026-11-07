import type { Metadata } from "next";
import Link from "next/link";

const title = "Credits · Aman Upadhyay";
const description = "The libraries, fonts and ideas this site is built on.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, images: ["/og/home.png"] },
};

type Credit = { name: string; href: string; note: string };

const sections: { heading: string; items: Credit[] }[] = [
  {
    heading: "Components and inspiration",
    items: [
      { name: "Magic UI", href: "https://magicui.design", note: "Hyper Text component (MIT licence), used for the name in the header." },
      {
        name: "Vengeance UI",
        href: "https://www.vengenceui.com",
        note: "The isometric scene was inspired by its isometric hero (MIT licence). Inspiration only: no code was copied.",
      },
    ],
  },
  {
    heading: "Fonts",
    items: [
      { name: "Fredoka", href: "https://fonts.google.com/specimen/Fredoka", note: "Headings. SIL Open Font License." },
      { name: "Inter", href: "https://rsms.me/inter/", note: "Body text. SIL Open Font License." },
      { name: "JetBrains Mono", href: "https://www.jetbrains.com/lp/mono/", note: "Labels. SIL Open Font License." },
    ],
  },
  {
    heading: "Built with",
    items: [
      { name: "Next.js", href: "https://nextjs.org", note: "Static export." },
      { name: "Tailwind CSS", href: "https://tailwindcss.com", note: "Styling." },
      { name: "content-collections", href: "https://github.com/sdorra/content-collections", note: "The case studies, as MDX." },
      { name: "Motion", href: "https://motion.dev", note: "Animation." },
      { name: "Vitest", href: "https://vitest.dev", note: "Tests." },
      { name: "Cloudflare Workers", href: "https://workers.cloudflare.com", note: "Hosting." },
    ],
  },
];

export default function Credits() {
  return (
    <main className="mx-auto w-full max-w-[68ch] px-6 pb-24 pt-4 text-[17px] leading-[1.7]">
      <Link href="/" className="mb-8 inline-block font-mono text-sm text-muted hover:text-fg">
        ← Back to the room
      </Link>
      <h1 className="font-display text-4xl font-semibold leading-tight min-[960px]:text-5xl">Credits</h1>
      <p className="mt-3 text-muted">Things I did not make, and am glad to have.</p>
      {sections.map((s) => (
        <section key={s.heading} className="mt-10">
          <h2 className="font-display text-2xl font-semibold">{s.heading}</h2>
          <ul className="mt-3 space-y-3">
            {s.items.map((c) => (
              <li key={c.name}>
                <a href={c.href} className="font-semibold text-primary-ink underline underline-offset-4" rel="noopener">
                  {c.name}
                </a>
                <span className="text-muted"> — {c.note}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <p className="mt-12 border-t border-line pt-6">Built with Claude Code as a pair programmer.</p>
    </main>
  );
}
