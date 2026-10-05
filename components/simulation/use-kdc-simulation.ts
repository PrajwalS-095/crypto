"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { TOTAL_STEPS, createSecrets, describeError, runStep } from "@/lib/kdc-protocol";
import { initialSimState, simReducer } from "@/lib/sim-machine";
import type { ProtocolData, ProtocolSecrets, SimConfig, StepNumber } from "@/types/simulation";

/**
 * Connects the pure state machine (sim-machine) to the async protocol engine (kdc-protocol).
 * CryptoKey objects live in a ref and never enter React state.
 */
export function useKdcSimulation() {
  const [state, dispatch] = useReducer(simReducer, initialSimState);
  const secretsRef = useRef<ProtocolSecrets | null>(null);
  const runIdRef = useRef(0);
  const inFlightRef = useRef(false);

  const execute = useCallback(async (runId: number, step: StepNumber, config: SimConfig, data: ProtocolData) => {
    inFlightRef.current = true;
    try {
      const secrets = secretsRef.current;
      if (!secrets) throw new Error("Simulation keys are not initialised.");
      const result = await runStep(step, config, secrets, data);
      if (runIdRef.current !== runId) return; // a restart happened meanwhile
      secretsRef.current = result.secrets;
      if (result.rejection) {
        dispatch({ type: "STEP_REJECTED", runId, step, data: result.data, reason: result.rejection });
      } else {
        dispatch({ type: "STEP_SUCCESS", runId, step, data: result.data });
      }
    } catch (err) {
      if (runIdRef.current !== runId) return;
      if (process.env.NODE_ENV !== "production") console.warn("[simulation]", err);
      dispatch({ type: "FAILURE", runId, message: describeError(err) });
    } finally {
      if (runIdRef.current === runId) inFlightRef.current = false;
    }
  }, []);

  const start = useCallback(
    async (config: SimConfig) => {
      const runId = runIdRef.current + 1;
      runIdRef.current = runId;
      secretsRef.current = null;
      inFlightRef.current = true;
      dispatch({ type: "START", runId, config });
      try {
        secretsRef.current = await createSecrets(config);
      } catch (err) {
        if (runIdRef.current !== runId) return;
        inFlightRef.current = false;
        dispatch({ type: "FAILURE", runId, message: describeError(err) });
        return;
      }
      if (runIdRef.current !== runId) return;
      await execute(runId, 1, config, {});
    },
    [execute],
  );

  const next = useCallback(() => {
    if (inFlightRef.current) return;
    const lastViewable = state.status === "aborted" ? state.completed + 1 : state.completed;
    if (state.view < lastViewable) {
      dispatch({ type: "VIEW_NEXT" });
      return;
    }
    if (state.status !== "running" || !state.config || state.completed >= TOTAL_STEPS) return;
    const step = (state.completed + 1) as StepNumber;
    dispatch({ type: "STEP_BEGIN", runId: state.runId, step });
    void execute(state.runId, step, state.config, state.data);
  }, [state, execute]);

  const previous = useCallback(() => dispatch({ type: "VIEW_PREVIOUS" }), []);

  const restart = useCallback(() => {
    if (state.config) void start(state.config);
  }, [state.config, start]);

  const editSettings = useCallback(() => {
    runIdRef.current += 1;
    secretsRef.current = null;
    inFlightRef.current = false;
    dispatch({ type: "EDIT_SETTINGS", runId: runIdRef.current });
  }, []);

  // Drop key material when the simulation unmounts.
  useEffect(
    () => () => {
      runIdRef.current += 1;
      secretsRef.current = null;
    },
    [],
  );

  return { state, start, next, previous, restart, editSettings };
}
