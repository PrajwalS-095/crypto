import { ArrowDown, CheckCircle2, XCircle } from "lucide-react";

/** A labelled block within a step: "Message", "Cryptographic operation", … */
export function Block({
  title,
  tag,
  children,
}: {
  title: string;
  tag?: "notation" | "browser";
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2.5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        {tag === "notation" && <span className="text-xs text-muted">Protocol notation</span>}
        {tag === "browser" && (
          <span className="inline-flex items-center gap-1.5 text-xs text-ok">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-ok" />
            Computed in your browser with Web Crypto
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

/** Protocol-level notation, e.g. "Alice → KDC : REQUEST(Alice, Bob, N₁)". */
export function Notation({ children }: { children: React.ReactNode }) {
  return (
    <p className="overflow-x-auto rounded border border-line bg-sunken px-3 py-2.5 font-mono text-[0.85rem] text-ink">
      {children}
    </p>
  );
}

export interface Field {
  name: React.ReactNode;
  value: React.ReactNode;
}

/** Structured (plaintext) contents of a message. */
export function FieldBox({ caption, fields }: { caption: React.ReactNode; fields: Field[] }) {
  return (
    <div className="rounded border border-line bg-surface">
      <p className="border-b border-line bg-sunken/60 px-3 py-1.5 text-xs font-medium text-ink-soft">{caption}</p>
      <dl className="divide-y divide-line/70">
        {fields.map((f, i) => (
          <div key={i} className="grid gap-x-3 gap-y-1 px-3 py-2 sm:grid-cols-[9.5rem_minmax(0,1fr)]">
            <dt className="text-xs text-muted sm:pt-0.5">{f.name}</dt>
            <dd className="min-w-0 break-words font-mono text-[0.8rem] text-ink">{f.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Downward arrow describing the operation that turns one value into the next. */
export function OpArrow({ children, api }: { children: React.ReactNode; api?: string }) {
  return (
    <div className="flex items-center gap-3 py-0.5 pl-3">
      <ArrowDown className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
      <div className="min-w-0 text-sm">
        <p className="font-medium text-ink">{children}</p>
        {api && <p className="truncate font-mono text-[11px] text-muted">{api}</p>}
      </div>
    </div>
  );
}

export function CheckList({ items }: { items: { ok: boolean; text: React.ReactNode }[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-sm text-ink-soft">
          {item.ok ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-ok" aria-label="Passed" />
          ) : (
            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-bad" aria-label="Failed" />
          )}
          <span>{item.text}</span>
        </li>
      ))}
    </ul>
  );
}

export function Explanation({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2 text-sm leading-relaxed text-ink-soft">{children}</div>;
}

/** Collapsible implementation details. */
export function TechDetails({ items }: { items: { label: string; value: React.ReactNode }[] }) {
  return (
    <details className="group text-sm">
      <summary className="cursor-pointer select-none text-xs font-medium text-ink-soft hover:text-ink">
        Technical details
      </summary>
      <dl className="mt-2.5 space-y-2 rounded border border-line bg-canvas px-3 py-2.5">
        {items.map((item) => (
          <div key={item.label} className="grid gap-x-3 sm:grid-cols-[9.5rem_minmax(0,1fr)]">
            <dt className="text-xs text-muted">{item.label}</dt>
            <dd className="min-w-0 break-all font-mono text-[0.78rem] text-ink-soft">{item.value}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}
