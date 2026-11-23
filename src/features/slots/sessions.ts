import type { AnswerStatus, SessionSummary, SlotCard } from "@/api/pik-client";

import { type CivilDate, compareDates, parseIsoDate } from "./dates";

/** A StatusPill tone (DESIGN.md, Status Pills). */
export type SlotTone = "green" | "red" | "amber" | "soft";

export interface SlotLabel {
  /** Translation key. */
  key: string;
  params?: Record<string, number>;
  tone: SlotTone;
}

/**
 * A session's state as pik computed it: green once it is on ("Assurée"), red while OK answers
 * are missing ("Il manque 2"), amber when Dispo answers would complete it at the deadline, and
 * the two cancellations.
 */
export function sessionStateLabel(session: Pick<SessionSummary, "state" | "missing">): SlotLabel {
  switch (session.state) {
    case "on":
      return { key: "slot.state.on", tone: "green" };
    case "missing":
      return { key: "slot.state.missing", params: { count: session.missing }, tone: "red" };
    case "to_complete":
      return { key: "slot.state.to_complete", tone: "amber" };
    case "cancelled_short":
      return { key: "slot.state.cancelled_short", tone: "red" };
    case "cancelled":
      return { key: "slot.state.cancelled", tone: "soft" };
  }
}

/** The player's own answer, in the colours of the legend; amber when they have not answered. */
export function myAnswerLabel(answer: AnswerStatus | null | undefined): SlotLabel {
  switch (answer) {
    case "ok":
      return { key: "slot.status.ok", tone: "green" };
    case "ko":
      return { key: "slot.status.ko", tone: "red" };
    case "dispo":
      return { key: "slot.status.disponible", tone: "amber" };
    default:
      return { key: "slot.my_answer.none", tone: "amber" };
  }
}

/** The sessions of one of the player's slots, as `GET /slots/:id/sessions` lists them. */
export interface SlotSessions {
  slot: Pick<SlotCard, "id" | "name" | "schedule">;
  sessions: readonly SessionSummary[];
}

export interface MonthRow {
  type: "month";
  key: string;
  year: number;
  month: number;
}

export interface SessionRow {
  type: "session";
  key: string;
  date: CivilDate;
  slotId: string;
  slotName: string;
  timeFrom: string;
  session: SessionSummary;
  /** The first session of the list: the next one to play. */
  isNext: boolean;
}

export type SessionListRow = MonthRow | SessionRow;

/**
 * The sessions of every slot of the player in one list, by date and start time, under a row
 * for each month. pik lists them from today on, so the first one is the next session.
 */
export function sessionRows(slots: readonly SlotSessions[]): SessionListRow[] {
  const sessions = slots
    .flatMap(({ slot, sessions }) =>
      sessions.flatMap((session) => {
        const date = parseIsoDate(session.date);
        return date
          ? [{ date, slot, session, timeFrom: slot.schedule.time_from }]
          : [];
      })
    )
    .sort((a, b) =>
      compareDates(a.date, b.date)
      || (a.timeFrom < b.timeFrom ? -1 : a.timeFrom > b.timeFrom ? 1 : 0)
      || a.slot.name.localeCompare(b.slot.name)
    );

  const rows: SessionListRow[] = [];
  let month = "";
  sessions.forEach(({ date, slot, session, timeFrom }, index) => {
    const monthKey = `${date.year}-${date.month}`;
    if (monthKey !== month) {
      rows.push({ type: "month", key: `month-${monthKey}`, year: date.year, month: date.month });
      month = monthKey;
    }
    rows.push({
      type: "session",
      key: `session-${slot.id}-${session.date}`,
      date,
      slotId: slot.id,
      slotName: slot.name,
      timeFrom,
      session,
      isNext: index === 0,
    });
  });
  return rows;
}
