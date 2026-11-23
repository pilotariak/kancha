import * as SecureStore from "expo-secure-store";

import { logger } from "@/utils/logger";

import type { PikTokenStore } from "./pik-client";

const KEY = "pik_player_token";

/**
 * The native app keeps the device's player token in the Keychain (iOS) or the Keystore
 * (Android), as kancha ADR-0002 asks. pik stores only its hash and cannot give it back.
 */
export const pikTokenStore: PikTokenStore | null = {
  async get() {
    try {
      return await SecureStore.getItemAsync(KEY);
    } catch {
      // A value that can no longer be decrypted, such as one restored from another device, is
      // lost: drop it, so the next slot created or joined gets a new player.
      logger.warn("pik: the stored player token is unreadable and was dropped");
      await SecureStore.deleteItemAsync(KEY).catch(() => undefined);
      return null;
    }
  },
  set: (token) => SecureStore.setItemAsync(KEY, token),
  clear: () => SecureStore.deleteItemAsync(KEY),
};
