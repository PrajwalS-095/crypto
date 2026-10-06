"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, RotateCcw, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KeyLabel } from "@/components/ui/key-label";
import { ConfigPanel } from "@/components/simulation/config-panel";
import { HexValue } from "@/components/simulation/hex-value";
import { MessageFlow } from "@/components/simulation/message-flow";
import { StepBar } from "@/components/simulation/step-bar";
import { StepContent } from "@/components/simulation/step-content";
import { useKdcSimulation } from "@/components/simulation/use-kdc-simulation";
import { isWebCryptoAvailable } from "@/lib/crypto";
import { TOTAL_STEPS } from "@/lib/kdc-protocol";
import { createDefaultConfig, normaliseConfig } from "@/lib/sim-config";
import { phaseOf } from "@/lib/sim-machine";
import { STEP_META, personaliseTitle } from "@/lib/steps";
import type { SimConfig, SimState, StepNumber } from "@/types/simulation";

const STEP_NUMBERS: StepNumber[] = [1, 2, 3, 4, 5, 6, 7, 8];

export function Simulation() {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [draft, setDraft] = useState<SimConfig | null>(null);
  const sim = useKdcSimulation();

  // Browser-only initialisation: feature detection and random default keys.
  useEffect(() => {
    setSupported(isWebCryptoAvailable());
    setDraft(createDefaultConfig());
  }, []);

  if (supported === null || draft === null) {
    return <p className="py-10 text-sm text-muted">Preparing the simulation…</p>;
  }

  if (!supported) return <UnsupportedNotice />;

  const { state } = sim;

  if (state.status === "configuring" || !state.config) {
    return (
      <div className="grid gap-5 xl:grid-cols-2 xl:items-start">
        <div className="space-y-2">
          <MessageFlow
            aliceName={draft.aliceName.trim() || "Alice"}
            bobName={draft.bobName.trim() || "Bob"}
            view={0}
          />
          <p className="text-xs text-muted">
            Preview of the exchange. Each row is one step; you will move through them one at a time.
          </p>
        </div>
        <ConfigPanel config={draft} onChange={setDraft} onStart={(cfg) => void sim.start(normaliseConfig(cfg))} />
      </div>
    );
  }

  return <RunningView state={state} config={state.config} sim={sim} />;
}

function RunningView({
  state,
  config,
  sim,
}: {
  state: SimState;
  config: SimConfig;
  sim: ReturnType<typeof useKdcSimulation>;
}) {
  const failedStep = state.status === "aborted" ? state.completed + 1 : undefined;
  const view = Math.max(state.view, 1) as StepNumber;
  const showingFrontier = view === (failedStep ?? state.completed);
  const meta = STEP_META[view];
  const title = personaliseTitle(meta.title, config.aliceName, config.bobName);
  const phase = view === failedStep ? "ABORTED" : view < state.completed ? meta.phase : phaseOf(state);

  return (
    <div>
      <StepBar
        view={state.view}
        completed={state.completed}
        status={state.status}
        title={state.view === 0 ? "Starting…" : title}
        phase={state.view === 0 ? "IDLE" : phase}
        stepLabels={STEP_NUMBERS.map((n) => personaliseTitle(STEP_META[n].short, config.aliceName, config.bobName))}
        onPrevious={sim.previous}
        onNext={sim.next}
        onRestart={sim.restart}
      />

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] xl:items-start">
        <div className="space-y-3">
          <MessageFlow aliceName={config.aliceName} bobName={config.bobName} view={state.view} failedStep={failedStep} />
          <RunSummary config={config} onEdit={sim.editSettings} onRestart={sim.restart} busy={state.status === "busy"} />
        </div>

        <div className="min-w-0 space-y-5">
          {state.status === "error" && (
            <div role="alert" className="flex gap-3 rounded border border-bad/40 bg-bad-soft px-4 py-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-bad" aria-hidden="true" />
              <div className="text-sm">
                <p className="font-semibold text-bad">The simulation stopped</p>
                <p className="mt-0.5 text-ink-soft">{state.error}</p>
              </div>
            </div>
          )}

          {state.view > 0 && (
            <section
              key={view}
              aria-label={`Step ${view} details`}
              className="fade-in rounded border border-line bg-surface p-4 sm:p-5 [&>*+*]:mt-5 [&>*+*]:border-t [&>*+*]:border-line [&>*+*]:pt-5"
            >
              <StepContent
                step={view}
                config={config}
                data={state.data}
                rejection={view === failedStep ? state.error : null}
              />
            </section>
          )}

          {state.status === "complete" && view === TOTAL_STEPS && (
            <FinalSummary state={state} config={config} onRestart={sim.restart} />
          )}

          {state.status === "running" && showingFrontier && (
            <p className="text-xs text-muted">Press “Next step” to continue the protocol.</p>
          )}
          {!showingFrontier && state.status !== "busy" && (
            <p className="text-xs text-muted">
              You are reviewing an earlier step. Use “Next” to return to step {failedStep ?? state.completed}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function RunSummary({
  config,
  onEdit,
  onRestart,
  busy,
}: {
  config: SimConfig;
  onEdit: () => void;
  onRestart: () => void;
  busy: boolean;
}) {
  return (
    <div className="rounded border border-line bg-surface px-3 py-2.5 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="min-w-0 text-ink-soft">
          <span className="font-medium text-alice">{config.aliceName}</span> →{" "}
          <span className="font-medium text-bob">{config.bobName}</span>
          {config.tamperTicket && (
            <span className="ml-2 rounded-sm bg-warn-soft px-1.5 py-0.5 text-[11px] font-medium text-warn">
              ticket tampering on
            </span>
          )}
        </p>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={onRestart} disabled={busy}>
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Restart
          </Button>
          <Button size="sm" variant="ghost" onClick={onEdit}>
            <Settings2 className="h-3.5 w-3.5" aria-hidden="true" />
            Change settings
          </Button>
        </div>
      </div>
      <p className="mt-1 truncate text-xs text-muted" title={config.message}>
        Message: “{config.message}”
      </p>
    </div>
  );
}

function FinalSummary({ state, config, onRestart }: { state: SimState; config: SimConfig; onRestart: () => void }) {
  const { message, sessionKeyHex } = state.data;
  if (!message || !sessionKeyHex) return null;
  return (
    <section aria-labelledby="final-title" className="rounded border border-ok/40 bg-surface">
      <div className="flex items-center gap-2 border-b border-ok/30 bg-ok-soft px-4 py-2.5">
        <CheckCircle2 className="h-5 w-5 text-ok" aria-hidden="true" />
        <h3 id="final-title" className="font-semibold text-ok">
          Exchange complete
        </h3>
      </div>
      <dl className="space-y-3 p-4 text-sm">
        <div>
          <dt className="mb-1 text-xs font-medium text-ink-soft">
            Session key <KeyLabel id="AB" /> shared by {config.aliceName} and {config.bobName}
          </dt>
          <dd>
            <HexValue hex={sessionKeyHex} label="Session key K_AB" secret tone="kdc" previewBytes={32} />
          </dd>
        </div>
        <div>
          <dt className="mb-1 text-xs font-medium text-ink-soft">Encrypted message</dt>
          <dd>
            <HexValue hex={message.encrypted.ciphertext} label="Encrypted message" previewBytes={12} />
          </dd>
        </div>
        <div>
          <dt className="mb-1 text-xs font-medium text-ink-soft">{config.bobName}&apos;s decrypted message</dt>
          <dd className="rounded border border-line bg-sunken px-3 py-2 font-mono text-[0.85rem] text-ink">
            “{message.decrypted}”
          </dd>
        </div>
      </dl>
      <div className="flex flex-wrap items-center gap-3 border-t border-line px-4 py-3">
        <Button variant="primary" onClick={onRestart}>
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Restart simulation
        </Button>
        <p className="text-xs text-muted">Restarting generates a new session key, nonce and IVs.</p>
      </div>
    </section>
  );
}

function UnsupportedNotice() {
  return (
    <div role="alert" className="flex gap-3 rounded border border-warn/40 bg-warn-soft px-4 py-3">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warn" aria-hidden="true" />
      <div className="text-sm text-ink-soft">
        <p className="font-semibold text-ink">Web Crypto is not available</p>
        <p className="mt-1">
          This simulation performs real AES-GCM encryption using your browser&apos;s Web Crypto API, which is only
          available on secure (HTTPS or localhost) pages in modern browsers. Please open the site over HTTPS in a current
          version of Chrome, Edge, Firefox or Safari.
        </p>
      </div>
    </div>
  );
}
