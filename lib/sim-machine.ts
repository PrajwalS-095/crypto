/**
 * Explicit state machine for the simulation UI.
 * Only valid transitions change state; anything else returns the state unchanged.
 */
import { TOTAL_STEPS } from "@/lib/kdc-protocol";
import { PHASES, type Phase, type ProtocolData, type SimConfig, type SimState } from "@/types/simulation";

export type SimAction =
  | { type: "START"; runId: number; config: SimConfig }
  | { type: "STEP_BEGIN"; runId: number; step: number }
  | { type: "STEP_SUCCESS"; runId: number; step: number; data: ProtocolData }
  | { type: "STEP_REJECTED"; runId: number; step: number; data: ProtocolData; reason: string }
  | { type: "FAILURE"; runId: number; message: string }
  | { type: "VIEW_PREVIOUS" }
  | { type: "VIEW_NEXT" }
  | { type: "EDIT_SETTINGS"; runId: number };

export const initialSimState: SimState = {
  status: "configuring",
  completed: 0,
  view: 0,
  config: null,
  data: {},
  runId: 0,
  error: null,
};

export function simReducer(state: SimState, action: SimAction): SimState {
  switch (action.type) {
    case "START":
      // Allowed from any state: discards the previous run entirely.
      return {
        status: "busy",
        completed: 0,
        view: 0,
        config: action.config,
        data: {},
        runId: action.runId,
        error: null,
      };

    case "STEP_BEGIN":
      if (action.runId !== state.runId || state.status !== "running") return state;
      if (action.step !== state.completed + 1 || state.view !== state.completed) return state;
      return { ...state, status: "busy" };

    case "STEP_SUCCESS": {
      if (action.runId !== state.runId || state.status !== "busy") return state;
      if (action.step !== state.completed + 1) return state;
      const completed = action.step;
      return {
        ...state,
        status: completed === TOTAL_STEPS ? "complete" : "running",
        completed,
        view: completed,
        data: action.data,
      };
    }

    case "STEP_REJECTED":
      if (action.runId !== state.runId || state.status !== "busy") return state;
      if (action.step !== state.completed + 1) return state;
      // The rejected step is shown, but is not counted as completed.
      return { ...state, status: "aborted", view: action.step, data: action.data, error: action.reason };

    case "FAILURE":
      if (action.runId !== state.runId) return state;
      return { ...state, status: "error", error: action.message };

    case "VIEW_PREVIOUS":
      if (state.status === "configuring" || state.status === "busy" || state.view <= 1) return state;
      return { ...state, view: state.view - 1 };

    case "VIEW_NEXT": {
      // Only moves through already-computed steps; new steps go through STEP_BEGIN.
      const lastViewable = state.status === "aborted" ? state.completed + 1 : state.completed;
      if (state.status === "busy" || state.view >= lastViewable) return state;
      return { ...state, view: state.view + 1 };
    }

    case "EDIT_SETTINGS":
      return { ...initialSimState, runId: action.runId };
  }
}

export function phaseOf(state: SimState): Phase {
  return PHASES[state.completed];
}
