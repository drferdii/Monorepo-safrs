import assert from "node:assert/strict";
import { test } from "node:test";

import { parseGates } from "./gates-parse.ts";

const SAMPLE = JSON.stringify([
  {
    check_id: "safrs.contract",
    verdict: "PASS",
    reason: "all stored contracts recompile",
    checked: 4,
  },
  {
    check_id: "safrs.review",
    verdict: "FAIL",
    reason: "independent review missing",
    checked: 1,
  },
]);

test("parseGates membaca array verdict", () => {
  const gates = parseGates(SAMPLE);
  assert.equal(gates.length, 2);
  assert.equal(gates[0]?.check_id, "safrs.contract");
  assert.equal(gates[1]?.verdict, "FAIL");
});

test("parseGates menolak bentuk yang bukan array", () => {
  assert.throws(() => parseGates("{}"));
  assert.throws(() => parseGates("bukan json"));
});
