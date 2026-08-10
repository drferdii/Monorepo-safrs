import { describe, expect, it } from "vitest";
import { assertDisposableDatabase } from "./reset-guard.js";

describe("assertDisposableDatabase", () => {
  it("accepts the declared local database", () => {
    expect(
      assertDisposableDatabase(
        "postgresql://safrs:safrs@127.0.0.1:54329/safrs_local",
      ).hostname,
    ).toBe("127.0.0.1");
  });

  it.each([
    "postgresql://user:pass@db.example.com/production",
    "postgresql://user:pass@127.0.0.1:54329/customer_data",
    "postgresql://user:pass@localhost:5432/postgres",
    "postgresql://user@127.0.0.1:54329/safrs_local",
    "mysql://user:pass@127.0.0.1:54329/safrs_local",
    "postgresql://user:pass@127.0.0.1:54329/safrs_local?sslmode=require",
  ])("rejects unsafe target %s", (url) => {
    expect(() => assertDisposableDatabase(url)).toThrow(
      /^\[DATABASE\] RESET DITOLAK/,
    );
  });
});
