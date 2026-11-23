import { createPikClient, pikBaseUrl } from "./pik-client";
import { pikTokenStore } from "./pik-token";

export * from "./pik-client";

/** The app's pik client. Components use the hooks of `@/hooks/use-slots`, never this. */
export const pikApi = createPikClient({
  fetch: (input, init) => fetch(input, init),
  // Read on each call, like the Frontis client. Written out in full, so Expo inlines it.
  baseUrl: () => pikBaseUrl(process.env.EXPO_PUBLIC_PIK_URL),
  tokens: pikTokenStore,
});
