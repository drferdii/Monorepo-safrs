export type GateResult = {
  check_id: string;
  verdict: string;
  reason: string;
  checked: number;
};

/** Parse the JSON array `saf gate --all` prints. Throws on any other shape. */
export function parseGates(raw: string): GateResult[] {
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error("gate output is not an array");
  }
  return parsed.map((entry) => {
    const record = entry as Partial<GateResult>;
    return {
      check_id: record.check_id ?? "(tanpa id)",
      verdict: record.verdict ?? "UNKNOWN",
      reason: record.reason ?? "",
      checked: record.checked ?? 0,
    };
  });
}
