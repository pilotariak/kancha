import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import { randomUUID } from "expo-crypto";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppState, Platform } from "react-native";

import {
  type CreateSlot,
  isPikFailure,
  type JoinPreview,
  type MemberChanges,
  pikApi,
  type SessionList,
  type SlotCard,
  type SlotDetail,
} from "@/api/pik";
import { isTransient } from "@/features/slots/errors";
import { creationKey, type PendingCreation } from "@/features/slots/idempotency";
import { candidateSlots, isSlotOfCode, type JoinChoice } from "@/features/slots/join";
import type { SlotSessions } from "@/features/slots/sessions";

/** Every pik query starts with "pik", apart from the Frontis ones. */
export const slotKeys = {
  all: ["pik"] as const,
  mine: ["pik", "me"] as const,
  sessions: (slotId: string) => ["pik", "slots", slotId, "sessions"] as const,
  slot: (slotId: string) => ["pik", "slots", slotId] as const,
  join: (code: string) => ["pik", "join", code] as const,
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

// ── Joining with an invite link ───────────────────────────────────────────────

/** The slot of an invite code and its free names (`GET /join/:code`); off without a code. */
export function useJoinPreview(code: string | null) {
  return useQuery({
    queryKey: slotKeys.join(code ?? ""),
    queryFn: () => pikApi.previewJoin(code ?? ""),
    enabled: !!code,
    staleTime: ALWAYS_STALE,
    // A code that no slot has, or no longer has once rotated, stays a 404.
    retry: (failureCount, error) => failureCount < 2 && isTransient(error),
  });
}

export interface RecognizedSlot {
  /** The device's member of the slot of the code, null when the device is not one. */
  slot: SlotDetail | null;
  /** Still finding out. */
  isPending: boolean;
}

/**
 * The slot of an invite code when this device is already one of its members, so that the join
 * screen skips "Who are you?". The preview has no slot id: the device's slots that show the same
 * name, weekday and time are read (`GET /slots/:id`), and the one with the code is the slot.
 */
export function useRecognizedSlot(code: string | null, preview: JoinPreview | undefined) {
  const mine = useMySlots();
  const candidates = useMemo(
    () => (preview && mine.data ? candidateSlots(mine.data.slots, preview) : []),
    [preview, mine.data],
  );
  const combine = useCallback(
    (queries: UseQueryResult<SlotDetail>[]): RecognizedSlot => ({
      slot: (code && queries.find((q) => q.data && isSlotOfCode(q.data, code))?.data) || null,
      isPending: queries.some((q) => q.isPending),
    }),
    [code],
  );
  const details = useQueries({
    queries: candidates.map((slot) => ({
      queryKey: slotKeys.slot(slot.id),
      queryFn: () => pikApi.slot(slot.id),
      staleTime: ALWAYS_STALE,
    })),
    combine,
  });
  // Without /me, the device counts as a new player: joining still works, pik answers
  // `already-member` if it was one.
  return { ...details, isPending: (!!preview && mine.isPending) || details.isPending };
}

/**
 * Joins the slot of an invite code: a free name ("C'est moi") or the player's own name. The
 * player's slots change: the Créneaux list and the recognized slot are read again.
 */
export function useJoinSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ code, choice }: { code: string; choice: JoinChoice }) =>
      pikApi.joinSlot(code, choice),
    onSettled: async (_data, error, { code }) => {
      // A name taken meanwhile, or a list closed meanwhile: show the preview as it is now.
      if (!error || isPikFailure(error, "name-taken") || isPikFailure(error, "list-closed")) {
        await queryClient.invalidateQueries({ queryKey: slotKeys.join(code) });
      }
      if (!error || isPikFailure(error, "already-member")) {
        await queryClient.invalidateQueries({ queryKey: slotKeys.mine });
      }
    },
  });
}

/** Redeems a recovery link (`POST /recover/:token`): once, within 24 hours. */
export function useRedeemRecovery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (recoveryToken: string) => pikApi.redeemRecovery(recoveryToken),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: slotKeys.all }),
  });
}

/**
 * The slots of the player a personal link holds (`GET /me` with its token). The key holds no
 * token, and nothing is kept once the screen closes.
 */
export function usePersonalLinkSlots(token: string | null) {
  return useQuery({
    queryKey: [...slotKeys.all, "personal-link"],
    queryFn: () => pikApi.playerSlots(token ?? ""),
    enabled: !!token,
    gcTime: 0,
    staleTime: Infinity,
    retry: (failureCount, error) => failureCount < 2 && isTransient(error),
  });
}

/** Keeps a personal link's token on this device (native), then reads the player's slots again. */
export function useAdoptToken() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => pikApi.adoptToken(token),
    onSuccess: () => queryClient.resetQueries({ queryKey: slotKeys.all }),
  });
}

// ── A slot and its list of names ──────────────────────────────────────────────

/** A slot with its members and the caller's role (`GET /slots/:id`). */
export function useSlotDetail(slotId: string | null) {
  return useQuery({
    queryKey: slotKeys.slot(slotId ?? ""),
    queryFn: () => pikApi.slot(slotId ?? ""),
    enabled: !!slotId,
    staleTime: ALWAYS_STALE,
    retry: (failureCount, error) => failureCount < 2 && isTransient(error),
  });
}

/** An organizer's change to a slot: the slot, and the cards of the list, are read again. */
function useSlotChange<Variables, Result>(
  slotId: string,
  change: (variables: Variables) => Promise<Result>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: change,
    onSettled: () => queryClient.invalidateQueries({ queryKey: slotKeys.slot(slotId) }),
  });
}

export const useAddMember = (slotId: string) =>
  useSlotChange(slotId, (name: string) => pikApi.addMember(slotId, name));

export const useUpdateMember = (slotId: string) =>
  useSlotChange(
    slotId,
    ({ memberId, changes }: { memberId: string; changes: MemberChanges }) =>
      pikApi.updateMember(slotId, memberId, changes),
  );

export const useReleaseName = (slotId: string) =>
  useSlotChange(slotId, (memberId: string) => pikApi.releaseName(slotId, memberId));

export const useRotateInviteCode = (slotId: string) =>
  useSlotChange(slotId, () => pikApi.rotateInviteCode(slotId));

export const useSetListClosed = (slotId: string) =>
  useSlotChange(slotId, (closed: boolean) => pikApi.setListClosed(slotId, closed));

/**
 * Creates a recovery link for a member. The caller draws the `Idempotency-Key` once per press, so
 * the automatic retries after a network failure send the same one: pik then returns the same
 * link with a fresh token rather than a second link.
 */
export function useCreateRecoveryLink(slotId: string) {
  return useMutation({
    mutationFn: ({ memberId, key }: { memberId: string; key: string }) =>
      pikApi.createRecoveryLink(slotId, memberId, key),
    retry: (failureCount, error) => failureCount < 2 && isTransient(error),
  });
}

/** A new `Idempotency-Key` (UUID v4). */
export const newIdempotencyKey = () => randomUUID();

/**
 * The device's player token for the personal link: the native app's, null on the web and until
 * it is read. Kept in this component's state only, never in the query cache.
 */
export function useDeviceToken(): string | null {
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    pikApi.deviceToken().then(
      (value) => {
        if (live) setToken(value);
      },
      () => undefined,
    );
    return () => {
      live = false;
    };
  }, []);
  return token;
}
