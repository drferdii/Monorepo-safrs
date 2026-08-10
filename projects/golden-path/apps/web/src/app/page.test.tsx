import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ReadinessDesk } from "./page.js";

describe("ReadinessDesk", () => {
  it("menjelaskan monorepo siap serta menyediakan status dan formulir yang dapat diakses", () => {
    const markup = renderToStaticMarkup(
      createElement(ReadinessDesk, {
        readiness: {
          api: { detail: "Endpoint Hono merespons.", state: "ready" },
          database: { detail: "PostgreSQL dapat dijangkau.", state: "ready" },
        },
      }),
    );

    expect(markup).toContain("Monorepo siap untuk alur SAFRS");
    expect(markup).toContain("Database");
    expect(markup).toContain("API bertipe");
    expect(markup).toContain('label for="demo-name"');
    expect(markup).toContain('aria-label="Nama contoh"');
    expect(markup).toContain("Simpan contoh");
  });

  it("menandai langkah akhir perlu perhatian ketika dependensi belum siap", () => {
    const markup = renderToStaticMarkup(
      createElement(ReadinessDesk, {
        readiness: {
          api: {
            detail: "API belum dapat diperiksa.",
            state: "attention",
          },
          database: {
            detail: "PostgreSQL dapat dijangkau.",
            state: "ready",
          },
        },
      }),
    );

    expect(markup).toContain('aria-label="Status akhir: Perlu perhatian"');
  });
});
