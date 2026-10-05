"use client";

import { useState } from "react";
import { Check, Copy, Eye, EyeOff } from "lucide-react";

interface HexValueProps {
  hex: string;
  /** Accessible name, e.g. "Session key K_AB". */
  label: string;
  /** Mask the value until the user chooses to reveal it. */
  secret?: boolean;
  /** Number of bytes shown before truncating. */
  previewBytes?: number;
  tone?: "neutral" | "alice" | "kdc" | "bob";
}

const TONES = {
  neutral: "border-line bg-sunken",
  alice: "border-alice/30 bg-alice-soft/60",
  kdc: "border-kdc/30 bg-kdc-soft/70",
  bob: "border-bob/30 bg-bob-soft/60",
} as const;

function groupBytes(hex: string): string {
  return (hex.toUpperCase().match(/.{1,2}/g) ?? []).join(" ");
}

/** Monospace display of a byte string with truncate / expand / copy / reveal controls. */
export function HexValue({ hex, label, secret = false, previewBytes = 16, tone = "neutral" }: HexValueProps) {
  const [expanded, setExpanded] = useState(false);
  const [revealed, setRevealed] = useState(!secret);
  const [copied, setCopied] = useState(false);

  const totalBytes = hex.length / 2;
  const truncated = totalBytes > previewBytes;
  const visibleHex = expanded || !truncated ? hex : hex.slice(0, previewBytes * 2);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={`rounded border ${TONES[tone]}`}>
      <div className="flex items-start gap-2 px-2.5 py-2">
        <code
          aria-label={revealed ? `${label}: ${hex}` : `${label} (hidden)`}
          className="min-w-0 flex-1 break-all font-mono text-[0.8rem] leading-relaxed text-ink"
        >
          {revealed ? (
            <>
              {groupBytes(visibleHex)}
              {truncated && !expanded && <span className="text-muted"> …</span>}
            </>
          ) : (
            <span className="tracking-widest text-muted">•••• •••• •••• ••••</span>
          )}
        </code>
        <div className="flex shrink-0 items-center gap-0.5">
          {secret && (
            <IconButton
              onClick={() => setRevealed((r) => !r)}
              label={revealed ? `Hide ${label}` : `Show ${label}`}
              pressed={revealed}
            >
              {revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </IconButton>
          )}
          <IconButton onClick={copy} label={copied ? "Copied" : `Copy ${label}`}>
            {copied ? <Check className="h-3.5 w-3.5 text-ok" /> : <Copy className="h-3.5 w-3.5" />}
          </IconButton>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-line/70 px-2.5 py-1 text-[11px] text-muted">
        <span>
          {totalBytes} bytes ({totalBytes * 8} bits)
        </span>
        {truncated && revealed && (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            aria-expanded={expanded}
            className="rounded px-1 font-medium text-accent hover:underline"
          >
            {expanded ? "Show less" : "Show all"}
          </button>
        )}
      </div>
    </div>
  );
}

function IconButton({
  children,
  label,
  onClick,
  pressed,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  pressed?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      className="grid h-7 w-7 place-items-center rounded text-muted hover:bg-surface hover:text-ink"
    >
      {children}
    </button>
  );
}
