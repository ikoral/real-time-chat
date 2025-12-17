import { treaty } from "@elysiajs/eden";
import type { App } from "../app/api/[[...slugs]]/route";

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    // Browser: use env var or current origin
    return process.env.NEXT_PUBLIC_API_URL || window.location.origin;
  }
  // Server: use env var or default
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
};

export const client = treaty<App>(getBaseUrl()).api;
