import type { PikTokenStore } from "./pik-client";

/**
 * No token store on the web: pik keeps the token in its `HttpOnly` cookie, out of reach of page
 * scripts and of Safari's seven-day cap on script-writable storage (kancha ADR-0004).
 */
export const pikTokenStore: PikTokenStore | null = null;
