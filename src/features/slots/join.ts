import type { JoinPreview, MemberView, SlotCard, SlotDetail } from "@/api/pik-client";

import { LIMITS, normalizeName } from "./wizard";

/** The longest member name pik takes (`MAX_NAME_CHARS`), the organizer's name included. */
export const NAME_MAX = LIMITS.organizerName;

/** Why a typed name cannot be sent; `in_list` when it is one of the free names, to pick instead. */
export type NameProblem =
  | { code: "required" }
  | { code: "too_long"; max: number }
  | { code: "in_list"; memberId: string };

/** pik compares names case-insensitively, in NFC (`DisplayName::key`). */
export const nameKey = (name: string) => normalizeName(name).toLowerCase().normalize("NFC");

/**
 * The problem of a name typed under "I'm not in the list", or `undefined` when pik should take
 * it. A free name typed again is the player's own, to claim: pik would answer `name-taken`.
 */
export function nameProblem(
  value: string,
  freeNames: JoinPreview["free_names"] = [],
): NameProblem | undefined {
  const name = normalizeName(value);
  if (!name) return { code: "required" };
  if (Array.from(name).length > NAME_MAX) return { code: "too_long", max: NAME_MAX };
  const key = nameKey(name);
  const free = freeNames.find((candidate) => nameKey(candidate.name) === key);
  return free ? { code: "in_list", memberId: free.member_id } : undefined;
}

/** What the player chose on "Who are you?". */
export type JoinChoice = { memberId: string } | { name: string };

/** Whether the player can add their own name: only while the organizer keeps the list open. */
export const canAddName = (preview: Pick<JoinPreview, "list_closed">) => !preview.list_closed;

/** Nothing left to pick: every name is taken and the list is closed. */
export const nothingToPick = (preview: Pick<JoinPreview, "list_closed" | "free_names">) =>
  preview.list_closed && preview.free_names.length === 0;

/**
 * The slots of the player that may be the one of the preview. The preview has no slot id, so the
 * device's slots are narrowed on what both show; the invite code of the slot settles it
 * (`isSlotOfCode`).
 */
export const candidateSlots = (
  slots: readonly SlotCard[],
  preview: Pick<JoinPreview, "name" | "weekday" | "time_from">,
) =>
  slots.filter((slot) =>
    slot.name === preview.name
    && slot.schedule.weekday === preview.weekday
    && slot.schedule.time_from === preview.time_from
  );

/** pik takes the code in any case. */
export const isSlotOfCode = (slot: Pick<SlotDetail, "invite_code">, code: string) =>
  slot.invite_code.toUpperCase() === code.toUpperCase();

/** The caller's name in a slot. */
export const myName = (slot: Pick<SlotDetail, "me" | "members">) =>
  slot.members.find((member) => member.id === slot.me.member_id)?.name ?? null;

// ── Organizer actions ─────────────────────────────────────────────────────────

export type MemberAction =
  | "make_organizer"
  | "remove_organizer"
  | "recovery_link"
  | "release_name";

/**
 * The actions an organizer has on a member of the list, none on their own name. A name nobody
 * holds can still become an organizer, as the creation flow suggests naming a second one before
 * they join: whoever claims it gets the role. pik refuses to demote or release the last
 * organizer (`last-organizer`).
 */
export function memberActions(
  member: Pick<MemberView, "id" | "role" | "claimed">,
  me: Pick<SlotDetail["me"], "member_id" | "role">,
): MemberAction[] {
  if (me.role !== "organizer" || member.id === me.member_id) return [];
  return [
    member.role === "organizer" ? "remove_organizer" : "make_organizer",
    "recovery_link",
    ...(member.claimed ? (["release_name"] as const) : []),
  ];
}

/** Organizers only, while they are the slot's only one: suggest naming a second organizer. */
export const suggestCoOrganizer = (slot: Pick<SlotDetail, "me" | "members">) =>
  slot.me.role === "organizer"
  && slot.members.filter((member) => member.role === "organizer").length < 2;
