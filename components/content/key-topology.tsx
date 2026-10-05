import { KeyLabel } from "@/components/ui/key-label";

/**
 * Static diagram: each user shares exactly one long-term key with the KDC.
 * Built from HTML/CSS so it reflows on narrow screens.
 */
export function KeyTopology() {
  return (
    <figure className="my-6 rounded border border-line bg-surface p-4 sm:p-5">
      <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-1 sm:gap-2">
        <Node name="Alice" tone="alice" />
        <KeyEdge keyId="A" />
        <Node name="KDC" tone="kdc" sub="trusted" />
        <KeyEdge keyId="B" />
        <Node name="Bob" tone="bob" />
      </div>
      <figcaption className="mt-4 text-center text-xs text-muted">
        Figure 1. Long-term keys. Alice shares <KeyLabel id="A" /> only with the KDC; Bob shares <KeyLabel id="B" /> only
        with the KDC. Alice and Bob share nothing in advance.
      </figcaption>
    </figure>
  );
}

const TONES = {
  alice: "border-alice/40 bg-alice-soft text-alice",
  kdc: "border-kdc/40 bg-kdc-soft text-kdc",
  bob: "border-bob/40 bg-bob-soft text-bob",
} as const;

function Node({ name, tone, sub }: { name: string; tone: keyof typeof TONES; sub?: string }) {
  return (
    <div className={`rounded border px-2 py-2 text-center ${TONES[tone]}`}>
      <p className="text-sm font-semibold">{name}</p>
      {sub && <p className="text-[10px] uppercase tracking-wide opacity-80">{sub}</p>}
    </div>
  );
}

function KeyEdge({ keyId }: { keyId: "A" | "B" }) {
  return (
    <div className="flex min-w-10 flex-col items-center sm:min-w-20">
      <KeyLabel id={keyId} className="text-xs" />
      <div className="mt-0.5 h-px w-full bg-line-strong" />
    </div>
  );
}
