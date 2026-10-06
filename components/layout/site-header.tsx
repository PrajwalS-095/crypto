import Link from "next/link";
import { MobileNav } from "@/components/layout/mobile-nav";
import { EXPERIMENT_TITLE } from "@/lib/sections";

/** Three nodes joined through a centre: the KDC topology, used as the lab mark. */
function LabMark() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className="h-8 w-8 shrink-0">
      <rect width="32" height="32" rx="5" className="fill-accent" />
      <path d="M16 12.5 9.6 20.3M16 12.5l6.4 7.8" stroke="#f2f3f0" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M11.4 23h9.2" stroke="#f2f3f0" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="2 2" />
      <circle cx="16" cy="9" r="3.2" fill="#f2f3f0" />
      <circle cx="8" cy="23" r="3.2" fill="#f2f3f0" />
      <circle cx="24" cy="23" r="3.2" fill="#f2f3f0" />
    </svg>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur-sm">
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
        <MobileNav />
        <Link href="/aim" className="flex min-w-0 items-center gap-3 rounded-sm">
          <span className="hidden sm:block">
            <LabMark />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block text-xs text-muted">Cryptography virtual lab</span>
            <span className="block truncate font-serif text-[0.95rem] text-ink sm:text-base">{EXPERIMENT_TITLE}</span>
          </span>
        </Link>
      </div>
    </header>
  );
}
