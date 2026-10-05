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
  onPrevious: () => void;
  onNext: () => void;
  onRestart: () => void;
}

export function StepBar({ view, completed, status, title, phase, onPrevious, onNext, onRestart }: StepBarProps) {
  const busy = status === "busy";
  const failedStep = status === "aborted" ? completed + 1 : null;
  const lastViewable = failedStep ?? completed;
  const atFrontier = view >= lastViewable;
  const finished = status === "complete" && view === TOTAL_STEPS;
  const nextDisabled =
    busy || (atFrontier && (status === "aborted" || status === "error" || status === "complete"));
  const nextLabel = atFrontier ? "Next step" : "Next";

  return (
    <div className="sticky top-14 z-20 -mx-4 border-b border-line bg-canvas/95 px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <div className="min-w-0 flex-1" aria-live="polite" aria-atomic="true">
          <p className="flex flex-wrap items-center gap-x-3 text-xs text-muted">
            <span className="font-semibold uppercase tracking-wider text-accent">
              Step {Math.max(view, 1)} of {TOTAL_STEPS}
            </span>
            <span className="hidden sm:inline">
              Protocol state: <code className="font-mono text-ink-soft">{phase}</code>
            </span>
          </p>
          <h2 className="mt-0.5 text-lg font-semibold leading-snug text-ink sm:text-xl">{title}</h2>
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

      <ol className="mt-3 grid grid-cols-8 gap-1" aria-label="Progress">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => {
          const n = i + 1;
          const tone =
            n === failedStep
              ? "bg-bad"
              : n === view
                ? "bg-accent"
                : n <= completed
                  ? "bg-accent/35"
                  : "bg-line";
          const state = n === failedStep ? "failed" : n <= completed ? "completed" : "not reached";
          return (
            <li key={n} className={`h-1.5 rounded-full ${tone}`}>
              <span className="sr-only">
                Step {n}: {state}
                {n === view ? " (shown)" : ""}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
