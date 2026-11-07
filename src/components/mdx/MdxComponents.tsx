import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { diagrams } from "../diagrams";
import { slugify } from "../../lib/slugify";

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (node && typeof node === "object" && "props" in node) {
    return textOf((node as { props: { children?: ReactNode } }).props.children);
  }
  return "";
}

export function H2({ children, ...rest }: ComponentPropsWithoutRef<"h2">) {
  return (
    <h2 id={slugify(textOf(children))} className="mt-12 mb-4 scroll-mt-24 font-display text-3xl font-semibold" {...rest}>
      {children}
    </h2>
  );
}

export function H3({ children, ...rest }: ComponentPropsWithoutRef<"h3">) {
  return (
    <h3 id={slugify(textOf(children))} className="mt-8 mb-3 scroll-mt-24 font-display text-xl font-semibold" {...rest}>
      {children}
    </h3>
  );
}

/**
 * Renders diagrams[name]. A missing name shows a labelled placeholder in development
 * and throws in a production build, so a missing diagram cannot ship silently.
 */
export function Diagram({ name }: { name: string }) {
  const D = diagrams[name];
  if (D) return <D />;
  if (process.env.NODE_ENV === "production") {
    throw new Error(`Diagram "${name}" is not registered in src/components/diagrams/index.ts`);
  }
  return (
    <div
      className="my-8 rounded-2xl border border-dashed border-line p-8 text-center font-mono text-sm text-muted"
      data-diagram-placeholder
    >
      Diagram: {name}
    </div>
  );
}

export const mdxComponents = {
  h2: H2,
  h3: H3,
  p: (p: ComponentPropsWithoutRef<"p">) => <p className="my-5" {...p} />,
  ul: (p: ComponentPropsWithoutRef<"ul">) => <ul className="my-5 list-disc space-y-2 pl-6 marker:text-primary" {...p} />,
  ol: (p: ComponentPropsWithoutRef<"ol">) => <ol className="my-5 list-decimal space-y-2 pl-6 marker:text-primary" {...p} />,
  a: (p: ComponentPropsWithoutRef<"a">) => <a className="text-primary-ink underline underline-offset-4" {...p} />,
  code: (p: ComponentPropsWithoutRef<"code">) => <code className="font-mono text-[0.9em] [font-variant-ligatures:none]" {...p} />,
  pre: (p: ComponentPropsWithoutRef<"pre">) => (
    <pre className="my-6 overflow-x-auto rounded-2xl border border-line bg-panel p-4 font-mono text-sm leading-relaxed" {...p} />
  ),
  Diagram,
};
