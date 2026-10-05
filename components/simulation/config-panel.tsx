"use client";

import { useId, useState } from "react";
import { ChevronDown, Play, RefreshCw, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KeyLabel } from "@/components/ui/key-label";
import { randomKeyHex } from "@/lib/crypto";
import { MESSAGE_MAX, NAME_MAX, createDefaultConfig, validateConfig } from "@/lib/sim-config";
import type { ConfigErrors, ConfigField, SimConfig } from "@/types/simulation";

interface ConfigPanelProps {
  config: SimConfig;
  onChange: (config: SimConfig) => void;
  onStart: (config: SimConfig) => void;
}

export function ConfigPanel({ config, onChange, onStart }: ConfigPanelProps) {
  const [errors, setErrors] = useState<ConfigErrors>({});
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const advancedId = useId();

  const update = <K extends keyof SimConfig>(field: K, value: SimConfig[K]) => {
    onChange({ ...config, [field]: value });
    if (field in errors) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const found = validateConfig(config);
    setErrors(found);
    const firstInvalid = (Object.keys(found) as ConfigField[]).find((k) => found[k]);
    if (firstInvalid) {
      if (firstInvalid === "aliceKeyHex" || firstInvalid === "bobKeyHex") setAdvancedOpen(true);
      // Focus after the advanced section has had a chance to render.
      window.setTimeout(() => document.getElementById(`cfg-${firstInvalid}`)?.focus(), 0);
      return;
    }
    onStart(config);
  };

  const resetDefaults = () => {
    onChange(createDefaultConfig());
    setErrors({});
  };

  return (
    <form onSubmit={submit} noValidate className="rounded border border-line bg-surface" aria-labelledby="cfg-title">
      <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-2.5">
        <h2 id="cfg-title" className="text-sm font-semibold text-ink">
          Simulation settings
        </h2>
        <Button variant="ghost" size="sm" onClick={resetDefaults}>
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Reset to defaults
        </Button>
      </div>

      <div className="space-y-4 p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="cfg-aliceName"
            label="Initiator (Alice)"
            value={config.aliceName}
            maxLength={NAME_MAX}
            error={errors.aliceName}
            onChange={(v) => update("aliceName", v)}
          />
          <TextField
            id="cfg-bobName"
            label="Responder (Bob)"
            value={config.bobName}
            maxLength={NAME_MAX}
            error={errors.bobName}
            onChange={(v) => update("bobName", v)}
          />
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="cfg-message" className="text-xs font-medium text-ink-soft">
              Message to send securely
            </label>
            <span className="text-[11px] text-muted" aria-live="polite">
              {config.message.length}/{MESSAGE_MAX}
            </span>
          </div>
          <textarea
            id="cfg-message"
            rows={2}
            value={config.message}
            maxLength={MESSAGE_MAX}
            onChange={(e) => update("message", e.target.value)}
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={errors.message ? "cfg-message-err" : undefined}
            className={inputClass(!!errors.message) + " mt-1 resize-y text-sm"}
          />
          <FieldError id="cfg-message-err" message={errors.message} />
        </div>

        <div className="rounded border border-line">
          <button
            type="button"
            onClick={() => setAdvancedOpen((o) => !o)}
            aria-expanded={advancedOpen}
            aria-controls={advancedId}
            className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs font-medium text-ink-soft hover:text-ink"
          >
            <span>Advanced: long-term keys and tampering</span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${advancedOpen ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>
          <div id={advancedId} hidden={!advancedOpen} className="space-y-4 border-t border-line px-3 py-3">
            <p className="text-xs text-muted">
              Long-term keys are set up once, when a user registers with the KDC. Random 256-bit keys are provided; you
              may paste your own as 64 hexadecimal characters. They are kept when you restart the simulation.
            </p>
            <KeyField
              id="cfg-aliceKeyHex"
              label={
                <>
                  <KeyLabel id="A" /> — shared by {config.aliceName.trim() || "Alice"} and the KDC
                </>
              }
              value={config.aliceKeyHex}
              error={errors.aliceKeyHex}
              onChange={(v) => update("aliceKeyHex", v)}
              onGenerate={() => update("aliceKeyHex", randomKeyHex())}
            />
            <KeyField
              id="cfg-bobKeyHex"
              label={
                <>
                  <KeyLabel id="B" /> — shared by {config.bobName.trim() || "Bob"} and the KDC
                </>
              }
              value={config.bobKeyHex}
              error={errors.bobKeyHex}
              onChange={(v) => update("bobKeyHex", v)}
              onGenerate={() => update("bobKeyHex", randomKeyHex())}
            />
            <p className="text-xs text-muted">
              The session key <KeyLabel id="AB" /> is not configurable: the KDC generates a fresh random one on every
              run.
            </p>
            <label className="flex items-start gap-2.5 text-sm text-ink-soft">
              <input
                type="checkbox"
                checked={config.tamperTicket}
                onChange={(e) => update("tamperTicket", e.target.checked)}
                className="mt-1 h-4 w-4 accent-[var(--color-accent)]"
              />
              <span>
                Tamper with the ticket in transit
                <span className="block text-xs text-muted">
                  Flips one bit of the ticket while it travels from Alice to Bob, to show that Bob detects the change.
                </span>
              </span>
            </label>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button type="submit" variant="primary">
            <Play className="h-4 w-4" aria-hidden="true" />
            Start simulation
          </Button>
          <p className="text-xs text-muted">The defaults are ready to use.</p>
        </div>
      </div>
    </form>
  );
}

function inputClass(invalid: boolean) {
  return `block w-full rounded border bg-canvas px-2.5 py-1.5 text-ink placeholder:text-muted focus:bg-surface focus:outline-2 focus:outline-offset-0 focus:outline-accent ${
    invalid ? "border-bad" : "border-line-strong"
  }`;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1 text-xs text-bad">
      {message}
    </p>
  );
}

function TextField({
  id,
  label,
  value,
  maxLength,
  error,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  maxLength: number;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-xs font-medium text-ink-soft">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        maxLength={maxLength}
        autoComplete="off"
        spellCheck={false}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-err` : undefined}
        className={inputClass(!!error) + " mt-1 text-sm"}
      />
      <FieldError id={`${id}-err`} message={error} />
    </div>
  );
}

function KeyField({
  id,
  label,
  value,
  error,
  onChange,
  onGenerate,
}: {
  id: string;
  label: React.ReactNode;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-xs font-medium text-ink-soft">
        {label}
      </label>
      <div className="mt-1 flex gap-2">
        <input
          id={id}
          type="text"
          value={value}
          maxLength={80}
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => onChange(e.target.value.replace(/\s/g, ""))}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-err` : undefined}
          className={inputClass(!!error) + " min-w-0 font-mono text-xs"}
        />
        <Button size="sm" onClick={onGenerate} aria-label="Generate a new random key" className="h-auto">
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">New</span>
        </Button>
      </div>
      <FieldError id={`${id}-err`} message={error} />
    </div>
  );
}
