import type {
  AnswerStatus,
  AnswerView,
  SessionDetail,
  SessionState,
  SessionSummary,
  SlotCard,
} from "@/api/pik-client";

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

// ── One session ───────────────────────────────────────────────────────────────

/** A group of the session screen: the answers of one status, or the members who did not answer. */
export type AnswerGroupKey = AnswerStatus | "none";

export interface GroupMember {
  memberId: string;
  /** Null for a member who left: "Ancien joueur". */
  name: string | null;
  /** The device's own member. */
  me: boolean;
}

export interface AnswerGroup {
  key: AnswerGroupKey;
  members: GroupMember[];
}

const GROUP_ORDER: readonly AnswerGroupKey[] = ["ok", "dispo", "ko", "none"];

/**
 * The names of a session grouped by answer: OK, Dispo, KO, then the members who did not answer.
 * Each group keeps pik's order, by answer time; every group is there, empty or not.
 */
export function answerGroups(
  session: Pick<SessionDetail, "answers" | "no_answer">,
): AnswerGroup[] {
  return GROUP_ORDER.map((key) => ({
    key,
    members: key === "none"
      ? session.no_answer.map(({ member_id, name, me }) => ({
        memberId: member_id,
        name: name ?? null,
        me,
      }))
      : session.answers
        .filter((answer) => answer.status === key)
        .map(({ member_id, name, me }) => ({ memberId: member_id, name: name ?? null, me })),
  }));
}

/**
 * The session as it reads once `memberId` answered `status`, before pik confirms it: the name
 * moves to the end of its new group, and the player's own answer changes when it is theirs. The
 * counts and the state stay pik's until pik answers: the gauge never shows a guess.
 */
export function withAnswer<T extends Pick<SessionDetail, "answers" | "no_answer" | "my_answer">>(
  session: T,
  memberId: string,
  status: AnswerStatus,
  answeredAt: string,
): T {
  const answered = session.answers.find((answer) => answer.member_id === memberId);
  const silent = session.no_answer.find((member) => member.member_id === memberId);
  const member = answered ?? silent;
  if (!member) return session;
  const moved: AnswerView = {
    member_id: memberId,
    name: member.name ?? null,
    status,
    answered_at: answeredAt,
    played: member.played,
    me: member.me,
  };
  const others = session.answers.filter((answer) => answer.member_id !== memberId);
  // pik lists OK, then Dispo, then KO: the new answer goes last of its status.
  const rank = (answer: Pick<AnswerView, "status">) => GROUP_ORDER.indexOf(answer.status);
  const at = others.findIndex((answer) => rank(answer) > rank(moved));
  const answers = at < 0
    ? [...others, moved]
    : [...others.slice(0, at), moved, ...others.slice(at)];
  return {
    ...session,
    answers,
    no_answer: session.no_answer.filter((other) => other.member_id !== memberId),
    my_answer: member.me ? status : session.my_answer,
  };
}

/**
 * The session after `date` that an organizer did not cancel, for "Prochaine séance": null when
 * the season has no other one.
 */
export function nextSession<T extends Pick<SessionSummary, "date" | "cancelled">>(
  sessions: readonly T[],
  date: string,
): T | null {
  const after = parseIsoDate(date);
  if (!after) return null;
  return sessions
    .map((session) => ({ session, day: parseIsoDate(session.date) }))
    .filter(({ session, day }) => day && !session.cancelled && compareDates(day, after) > 0)
    .sort((a, b) => compareDates(a.day as CivilDate, b.day as CivilDate))[0]?.session ?? null;
}

/** Which answers a player can give: pik takes only `ko` after the deadline, none once cancelled. */
export type AnswerChoice = "all" | "ko_only" | "none";

export interface SessionActions {
  answer: AnswerChoice;
  /** "Relancer": any member, before the deadline. */
  remind: boolean;
  /** "Prévenir": organizers, once the game is on or off. */
  notify: boolean;
  /** Cancel the date, or undo it: organizers, until the session starts. */
  cancel: boolean;
  restore: boolean;
}

/** The states "Prévenir" has a message for: the game is on, or it is off. */
const NOTIFIED_STATES: readonly SessionState[] = ["on", "cancelled_short", "cancelled"];

/** What the session screen offers, from pik's session and the member's role. */
export function sessionActions(
  session: Pick<SessionSummary, "cancelled" | "deadline_passed" | "state" | "starts_at">,
  organizer: boolean,
  now: Date,
): SessionActions {
  const started = Date.parse(session.starts_at) <= now.getTime();
  return {
    answer: session.cancelled ? "none" : session.deadline_passed ? "ko_only" : "all",
    remind: !session.cancelled && !session.deadline_passed,
    notify: organizer && NOTIFIED_STATES.includes(session.state),
    cancel: organizer && !session.cancelled && !started,
    restore: organizer && session.cancelled && !started,
  };
}

/** A translated part of the gauge's sentence. */
export interface SentencePart {
  key: string;
  params?: Record<string, number>;
}

/**
 * The short sentence under the gauge, from pik's state and counts: "2 places libres, 2 dispo
 * peuvent compléter" while the game is on or players are missing, the OK answers missing at the
 * deadline ("À compléter"), and why a session is off. The screen joins the parts.
 */
export function sessionSentence(
  session: Pick<SessionSummary, "state" | "counts" | "min_players" | "places">,
): SentencePart[] {
  const { ok, dispo } = session.counts;
  const key = (name: string) => `slot.session_screen.sentence.${name}`;
  switch (session.state) {
    case "cancelled":
      return [{ key: key("cancelled") }];
    case "cancelled_short":
      return [{ key: key("ok_at_deadline"), params: { ok, min: session.min_players } }];
    case "to_complete": {
      const parts: SentencePart[] = [
        { key: key("ok_short"), params: { count: Math.max(0, session.min_players - ok) } },
      ];
      if (dispo > 0) parts.push({ key: key("dispo_can_complete"), params: { count: dispo } });
      return parts;
    }
    case "on":
    case "missing": {
      const free = Math.max(0, session.places - ok);
      const waiting = Math.max(0, ok - session.places);
      const parts: SentencePart[] = [
        free > 0 ? { key: key("free_places"), params: { count: free } } : { key: key("full") },
      ];
      if (waiting > 0) parts.push({ key: key("waiting"), params: { count: waiting } });
      if (free > 0 && dispo > 0) {
        parts.push({ key: key("dispo_can_complete"), params: { count: dispo } });
      }
      return parts;
    }
  }
}
