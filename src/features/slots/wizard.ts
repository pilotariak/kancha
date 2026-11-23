import type { CreateSlot, SlotCourt } from "@/api/pik-client";

import {
  addDays,
  type CivilDate,
  compareDates,
  daysBetween,
  type IsoWeekday,
  parseDateInput,
  parseIsoDate,
  toDateInput,
  toIsoDate,
  weekdayDates,
} from "./dates";

/**
 * The slot creation wizard: the values of `POST /slots` and the rules pik checks on them
 * (`Slot::validate`, `DisplayName::parse` and `parse_time` in pik's src/domain), so the wizard
 * says what to fix before pik answers 422. The wizard sets the slot's values only: the minimum,
 * places and deadline of one date change on the session screen. It does not ask for the number of
 * points of a game: pik keeps its default, 40.
 */

export const WIZARD_STEPS = ["slot", "frequency", "players", "summary"] as const;
export type WizardStep = (typeof WIZARD_STEPS)[number];

/** The specialties the wizard offers. pik also takes a Frontis specialty id. */
export const SPECIALTIES = ["gomme_creuse", "gomme_pleine"] as const;
export type SlotSpecialty = (typeof SPECIALTIES)[number];

export const COURTS: readonly SlotCourt[] = ["trinquet", "mur_a_gauche", "place_libre"];

export const INTERVALS = [1, 2] as const;
export type SlotInterval = (typeof INTERVALS)[number];

/** pik's limits. Lengths count characters (code points), as Rust's `chars().count()`. */
export const LIMITS = {
  name: 60,
  venue: 80,
  organizerName: 40,
  players: 30,
  seasonDays: 366,
  deadlineDaysBefore: 6,
} as const;

export interface SlotDraft {
  name: string;
  venue: string;
  specialty: SlotSpecialty;
  court: SlotCourt;
  /** As typed: see `parseDateInput`. */
  seasonStart: string;
  seasonEnd: string;
  weekday: IsoWeekday;
  intervalWeeks: SlotInterval;
  /**
   * The first session, "YYYY-MM-DD", picked among `firstSessionChoices`. Null, or a date that is
   * no longer a choice after the season or the weekday changed, means the first choice.
   */
  anchorDate: string | null;
  /** As typed: see `parseTimeInput`. */
  timeFrom: string;
  /** Optional: empty for no end time. */
  timeTo: string;
  minPlayers: number;
  places: number;
  deadlineDaysBefore: number;
  deadlineTime: string;
  organizerName: string;
}

export type DraftField =
  | "name"
  | "venue"
  | "seasonStart"
  | "seasonEnd"
  | "anchorDate"
  | "timeFrom"
  | "timeTo"
  | "minPlayers"
  | "places"
  | "deadlineDaysBefore"
  | "deadlineTime"
  | "organizerName";

export type DraftErrorCode =
  | "required"
  | "too_long"
  | "control_characters"
  | "invalid_date"
  | "season_order"
  | "season_too_long"
  | "no_session"
  | "invalid_time"
  | "time_order"
  | "out_of_range";

export interface DraftError {
  code: DraftErrorCode;
  /** The bounds a message quotes: the maximum length, or the range of a number. */
  min?: number;
  max?: number;
}

export type DraftErrors = Partial<Record<DraftField, DraftError>>;

export const STEP_FIELDS: Record<WizardStep, readonly DraftField[]> = {
  slot: ["name", "venue"],
  frequency: ["seasonStart", "seasonEnd", "anchorDate", "timeFrom", "timeTo"],
  players: ["minPlayers", "places", "deadlineDaysBefore", "deadlineTime", "organizerName"],
  summary: [],
};

/** The values a new draft starts from: pik's defaults, and the given season. */
export function defaultDraft(season: { start: CivilDate; end: CivilDate }): SlotDraft {
  return {
    name: "",
    venue: "",
    specialty: "gomme_creuse",
    court: "trinquet",
    seasonStart: toDateInput(season.start),
    seasonEnd: toDateInput(season.end),
    weekday: 3,
    intervalWeeks: 1,
    anchorDate: null,
    timeFrom: "18:00",
    timeTo: "20:00",
    minPlayers: 4,
    places: 4,
    deadlineDaysBefore: 1,
    deadlineTime: "20:00",
    organizerName: "",
  };
}

/**
 * A time typed in a wizard field, as pik's "HH:MM" from 00:00 to 23:59: "18:30", "9:05", and the
 * French "18h30" and "18h" are read too. Null when it is not a time of day.
 */
export function parseTimeInput(text: string): string | null {
  const match = /^(\d{1,2})\s*(?:[:hH.]\s*(\d{2})?)?$/.exec(text.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2] ?? "0");
  if (hours > 23 || minutes > 59) return null;
  // A bare number is an hour only with "h": "1830" or "18" alone stays ambiguous.
  if (match[2] === undefined && !/[hH]\s*$/.test(text.trim())) return null;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

const characters = (text: string) => [...text].length;

/** Rust's `char::is_control`: the Cc category, U+0000 to U+001F and U+007F to U+009F. */
const hasControlCharacter = (text: string) =>
  [...text].some((ch) => {
    const code = ch.codePointAt(0) ?? 0;
    return code < 0x20 || (code >= 0x7f && code <= 0x9f);
  });

/** pik's `short_text`: trimmed, 1 to `max` characters, no control character. */
function textError(value: string, max: number): DraftError | undefined {
  const text = value.trim();
  if (!text) return { code: "required" };
  if (characters(text) > max) return { code: "too_long", max };
  if (hasControlCharacter(text)) return { code: "control_characters" };
  return undefined;
}

/**
 * A member's name as pik stores it (`DisplayName::parse`): white space collapsed to one space,
 * then the NFC form. Tabs and line breaks are white space, so no control character is left.
 */
export const normalizeName = (name: string) =>
  name.split(/\s+/).filter(Boolean).join(" ").normalize("NFC");

function nameError(value: string): DraftError | undefined {
  const name = normalizeName(value);
  if (!name) return { code: "required" };
  if (hasControlCharacter(name)) return { code: "control_characters" };
  if (characters(name) > LIMITS.organizerName) {
    return { code: "too_long", max: LIMITS.organizerName };
  }
  return undefined;
}

const inRange = (value: number, min: number, max: number) =>
  Number.isInteger(value) && value >= min && value <= max;

/**
 * The first sessions the wizard offers, from the season start or today, whichever comes later: a
 * slot created during its season starts with its next session. Every week has one choice; every
 * other week has two, this week or the next one, which set the weeks the slot plays.
 */
export function firstSessionChoices(draft: SlotDraft, today: CivilDate): CivilDate[] {
  const start = parseDateInput(draft.seasonStart);
  if (!start) return [];
  const from = compareDates(start, today) < 0 ? today : start;
  return weekdayDates(from, draft.weekday, draft.intervalWeeks);
}

/** The first session the draft will send: the picked one if still offered, else the first. */
export function firstSession(draft: SlotDraft, today: CivilDate): CivilDate | null {
  const choices = firstSessionChoices(draft, today);
  const picked = draft.anchorDate ? parseIsoDate(draft.anchorDate) : null;
  return (picked && choices.find((date) => compareDates(date, picked) === 0)) ?? choices[0] ?? null;
}

function frequencyErrors(draft: SlotDraft, today: CivilDate): DraftErrors {
  const errors: DraftErrors = {};
  const start = parseDateInput(draft.seasonStart);
  const end = parseDateInput(draft.seasonEnd);
  if (!start) errors.seasonStart = { code: draft.seasonStart.trim() ? "invalid_date" : "required" };
  if (!end) errors.seasonEnd = { code: draft.seasonEnd.trim() ? "invalid_date" : "required" };
  if (start && end) {
    if (compareDates(end, start) < 0) {
      errors.seasonEnd = { code: "season_order" };
    } else if (daysBetween(start, end) > LIMITS.seasonDays) {
      errors.seasonEnd = { code: "season_too_long", max: LIMITS.seasonDays };
    } else {
      const anchor = firstSession(draft, today);
      // pik wants the first session within the season. None is left when the season ends before
      // today, or before the first session on the weekday.
      if (!anchor || compareDates(anchor, end) > 0) errors.anchorDate = { code: "no_session" };
    }
  }

  const from = parseTimeInput(draft.timeFrom);
  if (!from) errors.timeFrom = { code: draft.timeFrom.trim() ? "invalid_time" : "required" };
  if (draft.timeTo.trim()) {
    const to = parseTimeInput(draft.timeTo);
    if (!to) errors.timeTo = { code: "invalid_time" };
    else if (from && to <= from) errors.timeTo = { code: "time_order" };
  }
  return errors;
}

/** Every rule pik checks, by field. An empty object means pik will accept the draft. */
export function validateDraft(draft: SlotDraft, today: CivilDate): DraftErrors {
  const errors: DraftErrors = {};
  const name = textError(draft.name, LIMITS.name);
  if (name) errors.name = name;
  const venue = textError(draft.venue, LIMITS.venue);
  if (venue) errors.venue = venue;

  Object.assign(errors, frequencyErrors(draft, today));

  if (!inRange(draft.minPlayers, 1, LIMITS.players)) {
    errors.minPlayers = { code: "out_of_range", min: 1, max: LIMITS.players };
  } else if (!inRange(draft.places, draft.minPlayers, LIMITS.players)) {
    errors.places = { code: "out_of_range", min: draft.minPlayers, max: LIMITS.players };
  }
  if (!inRange(draft.deadlineDaysBefore, 0, LIMITS.deadlineDaysBefore)) {
    errors.deadlineDaysBefore = { code: "out_of_range", min: 0, max: LIMITS.deadlineDaysBefore };
  }
  if (!parseTimeInput(draft.deadlineTime)) {
    errors.deadlineTime = { code: draft.deadlineTime.trim() ? "invalid_time" : "required" };
  }
  const organizer = nameError(draft.organizerName);
  if (organizer) errors.organizerName = organizer;
  return errors;
}

/** The errors of one step's fields: the wizard moves on once there is none. */
export function stepErrors(draft: SlotDraft, step: WizardStep, today: CivilDate): DraftErrors {
  const errors = validateDraft(draft, today);
  return Object.fromEntries(
    STEP_FIELDS[step].flatMap((field) => (errors[field] ? [[field, errors[field]]] : [])),
  ) as DraftErrors;
}

/** The first step with an error, or null when the draft is complete. */
export function firstInvalidStep(draft: SlotDraft, today: CivilDate): WizardStep | null {
  return WIZARD_STEPS.find((step) => Object.keys(stepErrors(draft, step, today)).length > 0)
    ?? null;
}

/**
 * The body of `POST /slots`, or null while the draft has an error. Every optional value the
 * wizard asks for is sent, so the slot does not depend on pik's defaults; `target`, which it does
 * not ask for, is left out.
 */
export function toCreateSlot(draft: SlotDraft, today: CivilDate): CreateSlot | null {
  if (Object.keys(validateDraft(draft, today)).length > 0) return null;
  const start = parseDateInput(draft.seasonStart);
  const end = parseDateInput(draft.seasonEnd);
  const anchor = firstSession(draft, today);
  const timeFrom = parseTimeInput(draft.timeFrom);
  const deadlineTime = parseTimeInput(draft.deadlineTime);
  if (!start || !end || !anchor || !timeFrom || !deadlineTime) return null;
  return {
    name: draft.name.trim(),
    venue: draft.venue.trim(),
    court: draft.court,
    specialty: draft.specialty,
    anchor_date: toIsoDate(anchor),
    interval_weeks: draft.intervalWeeks,
    time_from: timeFrom,
    time_to: draft.timeTo.trim() ? parseTimeInput(draft.timeTo) : null,
    season_start: toIsoDate(start),
    season_end: toIsoDate(end),
    min_players: draft.minPlayers,
    places: draft.places,
    deadline_days_before: draft.deadlineDaysBefore,
    deadline_time: deadlineTime,
    organizer_name: normalizeName(draft.organizerName),
  };
}

/**
 * Raising the minimum above the places raises the places with it, as pik wants as many places as
 * the minimum at least.
 */
export function withMinPlayers(draft: SlotDraft, minPlayers: number): SlotDraft {
  const min = Math.min(Math.max(minPlayers, 1), LIMITS.players);
  return { ...draft, minPlayers: min, places: Math.max(draft.places, min) };
}

export function withPlaces(draft: SlotDraft, places: number): SlotDraft {
  return { ...draft, places: Math.min(Math.max(places, draft.minPlayers), LIMITS.players) };
}

/** The date `days` before a session: the answer deadline's day, for the wizard's example. */
export const deadlineDay = (session: CivilDate, daysBefore: number) =>
  addDays(session, -daysBefore);
