import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { LAB_SECTIONS, type LabSection } from "@/lib/sections";

interface SectionPageProps {
  slug: LabSection["slug"];
  /** Wider content area (used by the simulation). */
  wide?: boolean;
  intro?: React.ReactNode;
  children: React.ReactNode;
}

export function SectionPage({ slug, wide = false, intro, children }: SectionPageProps) {
  const index = LAB_SECTIONS.findIndex((s) => s.slug === slug);
  const section = LAB_SECTIONS[index];
  const prev = index > 0 ? LAB_SECTIONS[index - 1] : undefined;
  const next = index < LAB_SECTIONS.length - 1 ? LAB_SECTIONS[index + 1] : undefined;

  return (
    <article
      className={
        wide
          ? "mx-auto max-w-6xl"
          : // Reading pages sit on one sheet aligned with the sidebar, so the width is used rather than left empty.
            "mx-auto max-w-[58rem] rounded border border-line bg-surface px-5 py-6 sm:px-8 sm:py-8 lg:mx-0 lg:px-10 2xl:max-w-[66rem]"
      }
    >
      <header className="mb-7 border-b border-line pb-4">
        <h1 className="font-serif text-[2rem] font-medium leading-tight text-ink">{section.title}</h1>
        {intro && <p className="mt-1.5 max-w-2xl text-[0.95rem] text-muted">{intro}</p>}
      </header>

      {children}

      <nav
        aria-label="Section navigation"
        className={`${wide ? "mt-12" : "mt-10"} flex items-center justify-between gap-4 border-t border-line pt-4 text-sm`}
      >
        {prev ? (
          <Link
            href={prev.href}
            className="inline-flex items-center gap-1 rounded px-2 py-1 text-ink-soft hover:bg-sunken hover:text-ink"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            href={next.href}
            className="inline-flex items-center gap-1 rounded px-2 py-1 font-medium text-accent hover:bg-accent-soft"
          >
            {next.title}
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        )}
      </nav>
    </article>
  );
}
