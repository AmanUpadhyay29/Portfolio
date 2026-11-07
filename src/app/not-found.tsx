import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Page not found · Aman Upadhyay" };

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-[68ch] flex-col items-center px-6 pb-24 pt-8 text-center">
      <svg viewBox="0 0 200 220" role="img" aria-label="A window at night with a moon" className="w-48">
        <rect x="20" y="20" width="160" height="180" rx="10" fill="#6b4f2a" />
        <rect x="32" y="32" width="136" height="156" rx="4" fill="#0b0c1e" />
        <circle cx="70" cy="70" r="5" fill="#f3f1ff" opacity=".9" />
        <circle cx="140" cy="54" r="2" fill="#f3f1ff" opacity=".8" />
        <circle cx="128" cy="120" r="2.5" fill="#f3f1ff" opacity=".7" />
        <circle cx="52" cy="140" r="2" fill="#f3f1ff" opacity=".7" />
        <circle cx="112" cy="78" r="22" fill="#fff3c4" />
        <circle cx="120" cy="72" r="19" fill="#0b0c1e" />
        <rect x="98" y="32" width="4" height="156" fill="#6b4f2a" />
        <rect x="32" y="108" width="136" height="4" fill="#6b4f2a" />
        <rect x="14" y="196" width="172" height="10" rx="3" fill="#8a6a3a" />
      </svg>
      <h1 className="mt-6 font-display text-4xl font-semibold leading-tight min-[960px]:text-5xl">
        This page has 0% uptime.
      </h1>
      <p className="mt-3 text-lg text-muted">It doesn&apos;t exist, or it moved.</p>
      <Link href="/" className="mt-8 font-mono text-sm text-primary-ink underline underline-offset-4">
        ← Back to the room
      </Link>
    </main>
  );
}
