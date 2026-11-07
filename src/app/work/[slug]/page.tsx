import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXContent } from "@content-collections/mdx/react";
import WorkHeader from "@/components/work/WorkHeader";
import { mdxComponents } from "@/components/mdx/MdxComponents";
import { allWorks, getWork, neighbours } from "@/lib/works";

export const dynamicParams = false;

export function generateStaticParams() {
  return allWorks.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const work = getWork(slug);
  if (!work) return {};
  return {
    title: `${work.title} · Aman Upadhyay`,
    description: work.summary,
    openGraph: { title: work.title, description: work.summary, images: [`/og/${work.slug}.png`] },
  };
}

export default async function WorkPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const work = getWork(slug);
  if (!work) notFound();
  const { prev, next } = neighbours(work.slug);
  return (
    <main className="mx-auto w-full max-w-[68ch] px-6 pb-24 pt-4 text-[17px] leading-[1.7] min-[960px]:text-lg">
      <Link href="/" className="mb-8 inline-block py-1 font-mono text-sm text-muted hover:text-fg">
        ← Back to the room
      </Link>
      <WorkHeader work={work} />
      <article>
        <MDXContent code={work.mdx} components={mdxComponents} />
      </article>
      <nav aria-label="More work" className="mt-16 flex justify-between gap-4 border-t border-line pt-6 font-mono text-sm">
        {prev ? (
          <Link href={`/work/${prev.slug}`} prefetch={false} className="hover:text-primary-ink">
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/work/${next.slug}`} prefetch={false} className="hover:text-primary-ink">
            {next.title} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </main>
  );
}
