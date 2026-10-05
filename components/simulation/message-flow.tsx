import { KeyLabel } from "@/components/ui/key-label";
import type { Party } from "@/lib/steps";

interface MessageFlowProps {
  aliceName: string;
  bobName: string;
  /** Step being displayed (0 = not started). */
  view: number;
  /** Step that was rejected, if the run was aborted. */
  failedStep?: number;
}

type RowKind = "message" | "local" | "shared";

interface FlowRow {
  step: number;
  kind: RowKind;
  from: Party;
  to: Party;
  label: React.ReactNode;
  short?: React.ReactNode;
}

const COLUMN: Record<Party, number> = { alice: 0, kdc: 1, bob: 2 };
const center = (p: Party) => ((2 * COLUMN[p] + 1) / 6) * 100;

function rows(a: string, b: string): FlowRow[] {
  return [
    { step: 1, kind: "message", from: "alice", to: "kdc", label: <>REQUEST({a}, {b}, N₁)</>, short: <>REQUEST</> },
    { step: 2, kind: "local", from: "kdc", to: "kdc", label: <>generate <KeyLabel id="AB" /></> },
    { step: 3, kind: "local", from: "kdc", to: "kdc", label: <>Ticket = E(<KeyLabel id="B" />, …)</>, short: <>build Ticket</> },
    {
      step: 4,
      kind: "message",
      from: "kdc",
      to: "alice",
      label: <>E(<KeyLabel id="A" />, [N₁ ‖ {b} ‖ <KeyLabel id="AB" /> ‖ Ticket])</>,
      short: <>E(<KeyLabel id="A" />, …)</>,
    },
    { step: 5, kind: "local", from: "alice", to: "alice", label: <>decrypt with <KeyLabel id="A" /></>, short: <>decrypt</> },
    {
      step: 6,
      kind: "message",
      from: "alice",
      to: "bob",
      label: <>Ticket = E(<KeyLabel id="B" />, [{a} ‖ <KeyLabel id="AB" /> ‖ T])</>,
      short: <>Ticket</>,
    },
    { step: 7, kind: "shared", from: "alice", to: "bob", label: <>both hold <KeyLabel id="AB" /></> },
    { step: 8, kind: "message", from: "alice", to: "bob", label: <>E(<KeyLabel id="AB" />, message)</> },
  ];
}

/** Which keys each party holds after a given step. */
function knownKeys(party: Party, view: number, failedStep?: number): ("A" | "B" | "AB")[] {
  const ok = (step: number) => view >= step && failedStep !== step;
  switch (party) {
    case "alice":
      return ok(5) ? ["A", "AB"] : ["A"];
    case "kdc":
      return ok(2) ? ["A", "B", "AB"] : ["A", "B"];
    case "bob":
      return ok(6) ? ["B", "AB"] : ["B"];
  }
}

const PARTY_STYLE: Record<Party, string> = {
  alice: "border-alice/35 bg-alice-soft text-alice",
  kdc: "border-kdc/35 bg-kdc-soft text-kdc",
  bob: "border-bob/35 bg-bob-soft text-bob",
};

export function MessageFlow({ aliceName, bobName, view, failedStep }: MessageFlowProps) {
  const parties: { id: Party; name: string; role: string }[] = [
    { id: "alice", name: aliceName, role: "Initiator" },
    { id: "kdc", name: "KDC", role: "Trusted third party" },
    { id: "bob", name: bobName, role: "Responder" },
  ];

  return (
    <figure aria-label="Message flow between the participants" className="rounded border border-line bg-surface">
      {/* Participants */}
      <div className="grid grid-cols-3 gap-2 border-b border-line p-2 sm:gap-4 sm:p-3">
        {parties.map((p) => (
          <div key={p.id} className={`min-w-0 rounded border px-1.5 py-1.5 text-center sm:px-2 ${PARTY_STYLE[p.id]}`}>
            <p className="truncate text-sm font-semibold" title={p.name}>
              {p.name}
            </p>
            <p className="hidden truncate text-[10px] uppercase tracking-wide opacity-80 sm:block">{p.role}</p>
            <p className="mt-1 flex flex-wrap items-center justify-center gap-1 text-[11px] text-ink-soft">
              <span className="sr-only">Knows keys:</span>
              {knownKeys(p.id, view, failedStep).map((k) => (
                <span
                  key={k}
                  className={`rounded-sm bg-surface/80 px-1 ring-1 ring-line ${k === "AB" && view > 0 ? "fade-in" : ""}`}
                >
                  <KeyLabel id={k} />
                </span>
              ))}
            </p>
          </div>
        ))}
      </div>

      {/* Sequence rows */}
      <ol className="@container relative py-1.5">
        {(["alice", "kdc", "bob"] as Party[]).map((p) => (
          <span
            key={p}
            aria-hidden="true"
            className="absolute inset-y-0 w-px bg-line"
            style={{ left: `${center(p)}%` }}
          />
        ))}
        {rows(aliceName, bobName).map((row) => (
          <FlowRowView key={row.step} row={row} view={view} failed={failedStep === row.step} />
        ))}
      </ol>
      <figcaption className="sr-only">
        Current step {view} of 8. Rows after the current step are shown faintly.
      </figcaption>
    </figure>
  );
}

function FlowRowView({ row, view, failed }: { row: FlowRow; view: number; failed: boolean }) {
  const state = row.step === view ? "current" : row.step < view ? "done" : "future";
  const left = Math.min(center(row.from), center(row.to));
  const width = Math.abs(center(row.to) - center(row.from));
  const rtl = center(row.to) < center(row.from);

  const rowTone =
    state === "current" ? (failed ? "bg-bad-soft/70" : "bg-accent-soft/60") : state === "future" ? "opacity-35" : "";
  const lineTone = failed && state === "current" ? "bg-bad" : state === "current" ? "bg-accent" : "bg-ink-soft";
  const textTone = failed && state === "current" ? "text-bad" : state === "current" ? "text-ink" : "text-ink-soft";

  const label = (
    <>
      {row.short ? (
        <>
          <span className={row.step === 4 ? "hidden @2xl:inline" : "hidden @md:inline"}>{row.label}</span>
          <span className={row.step === 4 ? "@2xl:hidden" : "@md:hidden"}>{row.short}</span>
        </>
      ) : (
        row.label
      )}
    </>
  );

  return (
    <li
      className={`relative h-10 transition-colors ${rowTone}`}
      aria-current={state === "current" ? "step" : undefined}
    >
      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 font-mono text-[10px] text-muted">{row.step}</span>

      {row.kind === "local" && (
        <span
          className="absolute top-1/2 max-w-[32%] -translate-x-1/2 -translate-y-1/2 truncate rounded-sm border border-line bg-surface px-1.5 py-0.5 font-mono text-[11px]"
          style={{ left: `${center(row.from)}%` }}
        >
          <span className={textTone}>{label}</span>
        </span>
      )}

      {row.kind !== "local" && (
        <div className="absolute top-0 h-full" style={{ left: `${left}%`, width: `${width}%` }}>
          <span
            className={`absolute inset-x-1 top-1 truncate text-center font-mono text-[11px] leading-4 ${textTone}`}
          >
            {failed && state === "current" ? <>✕ {label}</> : label}
          </span>
          {/* Line */}
          {row.kind === "shared" ? (
            <span
              aria-hidden="true"
              className={`absolute left-1 right-1 top-[26px] h-0 border-t-[1.5px] border-dashed ${
                state === "current" ? "border-accent" : "border-ink-soft"
              }`}
            />
          ) : (
            <span aria-hidden="true" className={`absolute left-0 right-0 top-[26px] h-px ${lineTone}`} />
          )}
          {/* Arrow heads */}
          {(row.kind === "shared" || !rtl) && <ArrowHead side="right" tone={lineTone} />}
          {(row.kind === "shared" || rtl) && <ArrowHead side="left" tone={lineTone} />}
          {/* Travelling packet */}
          {state === "current" && row.kind === "message" && (
            <span aria-hidden="true" className="absolute inset-x-0 top-[23px] h-[7px]">
              <span
                key={view}
                data-dir={rtl ? "rtl" : "ltr"}
                className={`packet absolute top-0 h-[7px] w-[7px] -translate-x-1/2 rounded-full ${failed ? "bg-bad" : "bg-accent"}`}
              />
            </span>
          )}
        </div>
      )}
    </li>
  );
}

function ArrowHead({ side, tone }: { side: "left" | "right"; tone: string }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute top-[23px] h-[7px] w-[7px] ${tone}`}
      style={{
        [side]: 0,
        clipPath: side === "right" ? "polygon(0 0, 100% 50%, 0 100%)" : "polygon(100% 0, 0 50%, 100% 100%)",
      }}
    />
  );
}
