import { describe, expect, it, vi } from "vitest";

vi.mock("@safrs/database", () => {
  throw new Error("Database must not enter the browser client bundle.");
});

import { getBrowserApiBaseUrl, submitDemo } from "./api-client.js";

describe("submitDemo", () => {
  it("mengembalikan nama contoh dari respons API berhasil", async () => {
    const result = await submitDemo(
      async () =>
        new Response(JSON.stringify({ name: "Atlas" }), { status: 201 }),
      "Atlas",
    );

    expect(result).toEqual({ name: "Atlas", status: "success" });
  });

  it("menampilkan pesan validasi dari respons 400", async () => {
    const result = await submitDemo(
      async () =>
        new Response(JSON.stringify({ message: "Permintaan tidak valid." }), {
          status: 400,
        }),
      "",
    );

    expect(result).toEqual({
      message: "Permintaan tidak valid.",
      status: "error",
    });
  });

  it("menampilkan panduan saat respons 500 tidak memiliki pesan", async () => {
    const result = await submitDemo(
      async () => new Response(null, { status: 500 }),
      "Atlas",
    );

    expect(result).toEqual({
      message: "Contoh belum tersimpan. Periksa koneksi lalu coba kembali.",
      status: "error",
    });
  });

  it("memastikan URL API browser absolut dan tetap satu origin", () => {
    expect(getBrowserApiBaseUrl("http://localhost:3000")).toBe(
      "http://localhost:3000/api",
    );
  });

  it("memuat klien browser tanpa memuat database server", () => {
    expect(getBrowserApiBaseUrl("http://localhost:3000")).toBe(
      "http://localhost:3000/api",
    );
  });
});
