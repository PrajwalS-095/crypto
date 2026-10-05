"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LAB_SECTIONS } from "@/lib/sections";

interface NavLinksProps {
  onNavigate?: () => void;
}

export function NavLinks({ onNavigate }: NavLinksProps) {
  const pathname = usePathname();

  return (
    <ol className="space-y-0.5">
      {LAB_SECTIONS.map((section, index) => {
        const active = pathname === section.href;
        return (
          <li key={section.slug}>
            <Link
              href={section.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={[
                "flex items-center gap-3 border-l-[3px] px-4 py-2.5 text-sm transition-colors",
                active
                  ? "border-accent bg-surface font-semibold text-ink"
                  : "border-transparent text-ink-soft hover:border-line-strong hover:bg-surface/60 hover:text-ink",
              ].join(" ")}
            >
              <span
                aria-hidden="true"
                className={[
                  "grid h-5 w-5 shrink-0 place-items-center rounded-sm font-mono text-[11px]",
                  active ? "bg-accent text-canvas" : "bg-canvas text-muted ring-1 ring-line",
                ].join(" ")}
              >
                {index + 1}
              </span>
              {section.title}
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
