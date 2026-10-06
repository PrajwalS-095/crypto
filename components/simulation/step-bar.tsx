"use client";

import { ChevronLeft, ChevronRight, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TOTAL_STEPS } from "@/lib/kdc-protocol";
import type { SimStatus } from "@/types/simulation";

interface StepBarProps {
  view: number;
  completed: number;
  status: SimStatus;
  title: string;
  phase: string;
  /** Short label for each of the steps, in order. */
  stepLabels: string[];
  onPrevious: () => void;
  onNext: () => void;
  onRestart: () => void;
}

export function StepBar({
  view,
  completed,
  status,
  title,
  phase,
  stepLabels,
  onPrevious,
  onNext,
  onRestart,
}: StepBarProps) {
  const busy = status === "busy";
  const failedStep = status === "aborted" ? completed + 1 : null;
  const lastViewable = failedStep ?? completed;
  const atFrontier = view >= lastViewable;
  const finished = status === "complete" && view === TOTAL_STEPS;
  const nextDisabled =
    busy || (atFrontier && (status === "aborted" || status === "error" || status === "complete"));
  const nextLabel = atFrontier ? "Next step" : "Next";
  const shown = Math.max(view, 1);

  return (
    <div className="sticky top-14 z-20 -mx-4 border-b border-line bg-canvas/95 px-4 pb-3 pt-4 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:-mx-6 lg:px-6">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4" aria-live="polite" aria-atomic="true">
          <p
            className={`flex shrink-0 items-baseline font-serif leading-none ${failedStep === view ? "text-bad" : "text-accent"}`}
          >
            <span className="sr-only">Step </span>
            <span className="text-[2rem] font-medium tabular-nums sm:text-[2.6rem]">{shown}</span>
            <span className="ml-0.5 text-base text-muted">
              <span className="sr-only"> of </span>
              <span aria-hidden="true">/</span>
              {TOTAL_STEPS}
            </span>
          </p>
          <div className="min-w-0">
            <h2 className="text-base font-semibold leading-snug text-ink sm:text-xl">{title}</h2>
            <p className="mt-0.5 hidden text-xs text-muted sm:block">
              Protocol state <code className="font-mono text-ink-soft">{phase}</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={onPrevious} disabled={busy || view <= 1} aria-label="Previous step">
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Previous</span>
          </Button>
          {finished || (atFrontier && (status === "aborted" || status === "error")) ? (
            <Button variant="primary" onClick={onRestart}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Restart simulation
            </Button>
          ) : (
            <Button variant="primary" onClick={onNext} disabled={nextDisabled}>
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                  Working…
                </>
              ) : (
                <>
                  {nextLabel}
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <ol className="mt-3.5 grid grid-cols-8 gap-1.5" aria-label="Progress">
        {stepLabels.map((label, i) => {
          const n = i + 1;
          const failed = n === failedStep;
          const current = n === view;
          const done = n <= completed;
          const bar = failed ? "bg-bad" : current ? "bg-accent" : done ? "bg-accent/40" : "bg-line";
          const text = failed ? "text-bad" : current ? "text-ink font-medium" : done ? "text-ink-soft" : "text-muted/70";
          const state = failed ? "failed" : done ? "completed" : "not reached";
          return (
            <li key={n} className="min-w-0">
              <span aria-hidden="true" className={`block h-1 rounded-full ${bar}`} />
              <span className={`mt-1.5 hidden truncate text-[11px] lg:block ${text}`}>{label}</span>
              <span className="sr-only">
                Step {n}, {label}: {state}
                {current ? " (shown)" : ""}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
