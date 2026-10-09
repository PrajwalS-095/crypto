export type KeyId = "A" | "B" | "AB";

const KEY_STYLES: Record<KeyId, string> = {
  A: "text-alice",
  B: "text-bob",
  AB: "text-kdc",
};

/** Renders K_A / K_B / K_AB in a consistent colour-coded notation. */
export function KeyLabel({ id, className = "" }: { id: KeyId; className?: string }) {
  return (
    <span className={`whitespace-nowrap font-mono font-medium ${KEY_STYLES[id]} ${className}`}>
      K<sub className="text-[0.72em]">{id}</sub>
    </span>
  );
}
