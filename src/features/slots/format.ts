import {
  type CivilDate,
  type DateNames,
  daysBetween,
  type IsoWeekday,
  isoWeekday,
  monthName,
  parisTime,
  weekdayName,
} from "./dates";

/** i18next's `t`, reduced to what these helpers call. */
export type Translate = (key: string, options?: Record<string, unknown>) => unknown;

const text = (value: unknown) => (typeof value === "string" ? value : "");

const list = (t: Translate, key: string): readonly string[] => {
  const value = t(key, { returnObjects: true });
  return Array.isArray(value) ? value.map(String) : [];
};

/**
 * Weekday and month names of the active language, from `slot.date`. Never from Intl: Chrome has
 * no Basque names and shows English ones for "eu".
 */
export function dateNames(t: Translate): DateNames {
  return {
    weekdays: list(t, "slot.date.weekdays"),
    weekdaysShort: list(t, "slot.date.weekdays_short"),
    months: list(t, "slot.date.months"),
    monthsShort: list(t, "slot.date.months_short"),
  };
}

/** Short weekday, day and month: "mer. 25 nov.", "aza. 25, az.". */
export const formatDay = (t: Translate, names: DateNames, date: CivilDate) =>
  text(t("slot.date.day", {
    weekday: weekdayName(isoWeekday(date), names.weekdaysShort),
    day: date.day,
    month: monthName(date.month, names.monthsShort),
  }));

/** Weekday, day, month and year in full: "mercredi 25 novembre 2026". */
export const formatLongDate = (t: Translate, names: DateNames, date: CivilDate) =>
  text(t("slot.date.long", {
    weekday: weekdayName(isoWeekday(date), names.weekdays),
    day: date.day,
    month: monthName(date.month, names.months),
    year: date.year,
  }));

/** A month header: "novembre 2026", "2026(e)ko azaroa". */
export const formatMonthYear = (t: Translate, names: DateNames, year: number, month: number) =>
  text(t("slot.date.month_year", { month: monthName(month, names.months), year }));

/** Weekday names start lowercase in French, Spanish and Basque: capitalize one that opens a line. */
export const capitalize = (value: string, locale: string) =>
  value.charAt(0).toLocaleUpperCase(locale) + value.slice(1);

/** When a slot meets, on one line: "Wednesday · 18:00 · Every week". */
export const formatSchedule = (
  t: Translate,
  names: DateNames,
  locale: string,
  schedule: { weekday: number; time_from: string; time_to?: string | null; interval_weeks: number },
) =>
  [
    capitalize(weekdayName(schedule.weekday as IsoWeekday, names.weekdays), locale),
    schedule.time_to ? `${schedule.time_from}–${schedule.time_to}` : schedule.time_from,
    text(t(schedule.interval_weeks === 2 ? "slot.interval.fortnightly" : "slot.interval.weekly")),
  ].join(" · ");

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * A time on the Paris clock. `screen` writes it as the app does, "20:00"; `message` as a chat
 * message in the language does: "20h" or "20h30" in French, "20:00" in English.
 */
export function formatClock(
  t: Translate,
  { hour, minute }: { hour: number; minute: number },
  style: "screen" | "message",
) {
  const params = { hour, hh: pad(hour), mm: pad(minute) };
  if (style === "screen") return text(t("slot.time.clock", params));
  return text(t(minute === 0 ? "slot.time.message" : "slot.time.message_minutes", params));
}

/**
 * The answer deadline of a session, an instant pik sends in UTC, on the Paris clock: "mardi
 * 20:00" on screen, "mercredi 20h" in a French message. The weekday alone names the day when it
 * falls in the six days before the session, as pik's deadline rule does; a deadline an organizer
 * moved further away also gets its date ("mar. 17 nov. 20:00"). Empty when pik sent no instant.
 */
export function formatDeadline(
  t: Translate,
  names: DateNames,
  deadline: string,
  session: CivilDate,
  style: "screen" | "message",
) {
  const at = parisTime(deadline);
  if (!at) return "";
  const before = daysBetween(at.date, session);
  const day = before >= 0 && before <= 6
    ? weekdayName(isoWeekday(at.date), names.weekdays)
    : formatDay(t, names, at.date);
  return text(t("slot.date.day_time", { day, time: formatClock(t, at, style) }));
}
