import { useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

import { tokenOfFragment } from "@/features/slots/links";
import { clearSecret, readSecret, type SecretKind } from "@/features/slots/pending-secret";

export interface LinkSecret {
  /** The token of the link, null when it came without a valid one. */
  token: string | null;
  /** False until the link was read: on the web, after hydration. */
  ready: boolean;
}

/**
 * The token of the personal or recovery link that opened this screen.
 *
 * - Native: the native intent kept it in memory (`pending-secret.ts`). It is dropped when the
 *   screen closes.
 * - Web: it is in the URL fragment, read after hydration (the static render has no window), then
 *   taken out of the address bar, the history entry and the router's params, so that it is not
 *   left on screen or saved with the page.
 */
export function useLinkSecret(kind: SecretKind): LinkSecret {
  const navigation = useNavigation();
  const [secret, setSecret] = useState<LinkSecret>(() =>
    Platform.OS === "web" ? { token: null, ready: false } : { token: readSecret(kind), ready: true }
  );

  useEffect(() => {
    if (Platform.OS !== "web") return () => clearSecret(kind);
    const { hash, pathname, search } = window.location;
    if (hash) {
      window.history.replaceState(window.history.state, "", `${pathname}${search}`);
      // Expo Router keeps the fragment as the `#` param and writes it back into the URL on its
      // next navigation update: drop it there too, which also takes the token out of its state.
      navigation.setParams({ "#": "" } as never);
    }
    // A second run (React's strict mode) finds the fragment gone: keep what the first one read.
    setSecret((previous) =>
      previous.ready ? previous : { token: tokenOfFragment(hash), ready: true }
    );
    return undefined;
  }, [kind, navigation]);

  return secret;
}
