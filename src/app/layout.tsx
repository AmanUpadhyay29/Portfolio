import type { Metadata } from "next";
import Link from "next/link";
import { Fredoka, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import ThemeToggle from "@/components/ThemeToggle";
import HyperName from "@/components/HyperName";
import { themeInitScript } from "@/lib/theme";
import { site } from "@/content/site";
import { siteUrl } from "@/lib/site-url";

const display = Fredoka({ variable: "--font-fredoka", subsets: ["latin"], weight: ["500", "600", "700"] });
const body = Inter({ variable: "--font-inter", subsets: ["latin"], weight: ["400", "500", "600"] });
const mono = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], weight: ["500"] });

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: "Aman Upadhyay — Database Administrator & Software Engineer",
  description:
    "Uptime is my job. Building is my habit. SQL Server DBA by day; I build and run my own trading platform by night.",
  icons: { icon: "/favicon.svg" },
  // site-wide: pages that set no twitter block still get the large card
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="night"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen flex flex-col">
        <header className="mx-auto flex h-[72px] w-full max-w-[1320px] items-center justify-between px-6 min-[960px]:px-8">
          <Link href="/" className="font-display text-lg font-semibold">
            <HyperName text={site.name} />
          </Link>
          <div className="flex items-center gap-5">
            <nav aria-label="Main" className="hidden gap-5 text-muted sm:flex">
              <Link href="/#room" className="hover:text-fg">Work</Link>
              <Link href="/#job" className="hover:text-fg">Job</Link>
              <Link href="/#about" className="hover:text-fg">About</Link>
              <Link href="/#contact" className="hover:text-fg">Contact</Link>
            </nav>
            <ThemeToggle />
          </div>
        </header>
        {children}
        <footer className="mx-auto w-full max-w-[1320px] px-6 pb-10 pt-8 font-mono text-xs text-muted min-[960px]:px-8">
          <Link href="/credits" className="hover:text-fg">Credits</Link>
        </footer>
      </body>
    </html>
  );
}
