"use client";

import { createApiClient } from "@safrs/api/client";
import { clientEnv } from "@safrs/env/client";

type ApiErrorBody = {
  message?: string;
};

export type DemoSubmission =
  | { name: string; status: "success" }
  | { message: string; status: "error" };

export function getBrowserApiBaseUrl(locationOrigin: string): string {
  const configuredOrigin = clientEnv.NEXT_PUBLIC_APP_URL
    ? new URL(clientEnv.NEXT_PUBLIC_APP_URL).origin
    : locationOrigin;
  const sameOrigin =
    configuredOrigin === locationOrigin ? configuredOrigin : locationOrigin;

  return new URL("/api", sameOrigin).toString();
}

export function createBrowserApiClient(locationOrigin: string) {
  return createApiClient(getBrowserApiBaseUrl(locationOrigin));
}

export async function submitDemo(
  request: (name: string) => Promise<Response>,
  name: string,
): Promise<DemoSubmission> {
  const response = await request(name);

  if (response.ok) {
    const demo = (await response.json()) as { name: string };
    return { name: demo.name, status: "success" };
  }

  const error = (await response.json().catch(() => ({}))) as ApiErrorBody;
  return {
    message:
      error.message ??
      "Contoh belum tersimpan. Periksa koneksi lalu coba kembali.",
    status: "error",
  };
}
