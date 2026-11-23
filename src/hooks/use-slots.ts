import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import { randomUUID } from "expo-crypto";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { AppState, Platform } from "react-native";

import { type CreateSlot, pikApi, type SessionList, type SlotCard } from "@/api/pik";
import { isTransient } from "@/features/slots/errors";
import { creationKey, type PendingCreation } from "@/features/slots/idempotency";
import type { SlotSessions } from "@/features/slots/sessions";

/** Every pik query starts with "pik", apart from the Frontis ones. */
export const slotKeys = {
  all: ["pik"] as const,
  mine: ["pik", "me"] as const,
  sessions: (slotId: string) => ["pik", "slots", slotId, "sessions"] as const,
};

// pik answers with `Cache-Control: private, no-store`: players answer at any time, so slot data
// is stale at once, unlike Frontis data. A mount or a focused browser tab fetches it again.
const ALWAYS_STALE = 0;

/** The player's slots, one card each (`GET /me`). Empty on a device without a player. */
export function useMySlots() {
  return useQuery({
    queryKey: slotKeys.mine,
    queryFn: () => pikApi.mySlots(),
    staleTime: ALWAYS_STALE,
  });
}

export interface SlotsSessions {
  /** Each slot with its sessions from today on, once every query succeeded; undefined until then. */
  data: SlotSessions[] | undefined;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  isRefetching: boolean;
  refetch: () => void;
}

/** The upcoming sessions of each slot, one request per slot (`GET /slots/:id/sessions`). */
export function useSlotsSessions(slots: readonly SlotCard[]): SlotsSessions {
  const combine = useCallback(
    (queries: UseQueryResult<SessionList>[]): SlotsSessions => {
      const failed = queries.find((q) => q.isError);
      return {
        data: queries.every((q) => q.isSuccess)
          ? slots.map((slot, index) => ({ slot, sessions: queries[index]?.data?.sessions ?? [] }))
          : undefined,
        isPending: queries.some((q) => q.isPending),
        isError: !!failed,
        error: failed?.error ?? null,
        isRefetching: queries.some((q) => q.isRefetching),
        refetch: () => {
          for (const q of queries) if (q.isError) void q.refetch();
        },
      };
    },
    [slots],
  );
  return useQueries({
    queries: slots.map((slot) => ({
      queryKey: slotKeys.sessions(slot.id),
      queryFn: () => pikApi.slotSessions(slot.id),
      staleTime: ALWAYS_STALE,
    })),
    combine,
  });
}

/**
 * Fetches the slot data on screen again: returns the pull to refresh action, and runs it when
 * the screen gets the focus back and when the app comes back to the foreground. The web build
 * already refetches when its tab gets the focus, as the queries are always stale.
 */
export function useSlotsRefresh(): () => Promise<void> {
  const queryClient = useQueryClient();
  const refresh = useCallback(
    () => queryClient.refetchQueries({ queryKey: slotKeys.all, type: "active" }),
    [queryClient],
  );

  // The first focus is the mount, which already fetched.
  const focused = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (focused.current) void refresh();
      focused.current = true;
    }, [refresh]),
  );

  useEffect(() => {
    if (Platform.OS === "web") return;
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void refresh();
    });
    return () => subscription.remove();
  }, [refresh]);

  return refresh;
}

/**
 * Creates a slot (`POST /slots`). The same creation keeps one `Idempotency-Key` across its
 * retries, the automatic ones after a network failure and the ones the user starts, as long as
 * the body does not change: pik then returns the slot it created rather than a second one.
 */
export function useCreateSlot() {
  const queryClient = useQueryClient();
  const pending = useRef<PendingCreation | null>(null);
  return useMutation({
    mutationFn: (slot: CreateSlot) => {
      pending.current = creationKey(pending.current, slot, randomUUID);
      return pikApi.createSlot(slot, pending.current.key);
    },
    retry: (failureCount, error) => failureCount < 2 && isTransient(error),
    onSuccess: async () => {
      pending.current = null;
      // The list shows the new slot when the wizard closes.
      await queryClient.invalidateQueries({ queryKey: slotKeys.all });
    },
  });
}
