import { describe, expect, it, vi } from "vitest";

vi.stubEnv("APP_URL", "http://localhost:3000");
vi.stubEnv(
  "DATABASE_URL",
  "postgresql://safrs:safrs@127.0.0.1:54329/safrs_test",
);
vi.stubEnv("NODE_ENV", "test");

const { createServerEnv } = await import("./server.js");

describe("createServerEnv", () => {
  it("reports a missing DATABASE_URL without exposing supplied values", () => {
    const suppliedAppUrl = "https://example.test/app?token=do-not-expose";

    expect(() =>
      createServerEnv({
        APP_URL: suppliedAppUrl,
        NODE_ENV: "test",
      }),
    ).toThrowError("Invalid environment variables: DATABASE_URL");

    try {
      createServerEnv({
        APP_URL: suppliedAppUrl,
        NODE_ENV: "test",
      });
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).not.toContain(suppliedAppUrl);
    }
  });
});
