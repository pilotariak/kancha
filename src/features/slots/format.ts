import {
  type CivilDate,
  type DateNames,
  type IsoWeekday,
  isoWeekday,
  monthName,
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
