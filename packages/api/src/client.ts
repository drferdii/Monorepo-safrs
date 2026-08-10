import { hc } from "hono/client";
import type { AppType } from "./app.js";

export type ApiClient = ReturnType<typeof hc<AppType>>;

export const createApiClient = (...args: Parameters<typeof hc>): ApiClient =>
  hc<AppType>(...args);
