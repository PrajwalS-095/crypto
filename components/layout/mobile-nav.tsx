"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { NavLinks } from "@/components/layout/nav-links";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      triggerRef.current?.focus();
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open experiment sections"
        aria-expanded={open}
        aria-controls="mobile-nav"
        className="-ml-1.5 grid h-9 w-9 place-items-center rounded text-ink-soft hover:bg-sunken"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      {open && (
        <div className="fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label="Experiment sections">
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            className="absolute inset-0 bg-ink/30"
            onClick={() => setOpen(false)}
          />
          <nav
            id="mobile-nav"
            aria-label="Experiment sections"
            className="fade-in absolute inset-y-0 left-0 w-64 max-w-[80vw] border-r border-line bg-sidebar py-4 shadow-lg"
          >
            <div className="mb-3 flex items-center justify-between px-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Experiment</p>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close navigation"
                className="grid h-8 w-8 place-items-center rounded text-ink-soft hover:bg-surface"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <NavLinks onNavigate={() => setOpen(false)} />
          </nav>
        </div>
      )}
    </div>
  );
}
