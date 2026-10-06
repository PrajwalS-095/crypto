import type { StepNumber } from "@/types/simulation";

export type Party = "alice" | "kdc" | "bob";

export interface StepMeta {
  step: StepNumber;
  title: string;
  /** Label for the progress stepper. */
  short: string;
  /** Who acts in this step. */
  actors: Party[];
  /** Phase entered when the step completes. */
  phase: string;
}

export const STEP_META: Record<StepNumber, StepMeta> = {
  1: { step: 1, title: "Alice requests a session key", short: "Request", actors: ["alice"], phase: "REQUEST_SENT" },
  2: { step: 2, title: "KDC generates a session key", short: "Session key", actors: ["kdc"], phase: "SESSION_KEY_GENERATED" },
  3: { step: 3, title: "KDC creates a ticket for Bob", short: "Ticket", actors: ["kdc"], phase: "TICKET_CREATED" },
  4: { step: 4, title: "KDC sends the response to Alice", short: "KDC reply", actors: ["kdc"], phase: "KDC_RESPONSE_SENT" },
  5: { step: 5, title: "Alice decrypts the KDC response", short: "Alice decrypts", actors: ["alice"], phase: "ALICE_DECRYPTED" },
  6: { step: 6, title: "Alice forwards the ticket to Bob", short: "Bob decrypts", actors: ["alice", "bob"], phase: "BOB_DECRYPTED" },
  7: { step: 7, title: "Secure session established", short: "Shared key", actors: ["alice", "bob"], phase: "SESSION_ESTABLISHED" },
  8: { step: 8, title: "Secure communication", short: "Message", actors: ["alice", "bob"], phase: "COMPLETE" },
};

/** Replace generic "Alice"/"Bob" in a title with the configured names. */
export function personaliseTitle(title: string, alice: string, bob: string): string {
  return title.replace(/\bAlice\b/g, "\u0000").replace(/\bBob\b/g, bob).replace(/\u0000/g, alice);
}
