import type { SessionSummary } from "@/api/pik-client";

import { type DateNames, parseIsoDate } from "./dates";
import { formatDay, formatDeadline, type Translate } from "./format";
import { inviteUrl } from "./links";

/**
 * The messages a player shares in the group chat from the session screen (kancha ADR-0003),
 * instead of push notifications:
 *
 * - "Relancer", for any player before the deadline: the OK answers, the minimum, the deadline
 *   and the invite link;
 * - "Prévenir", for organizers: the game is on with its free places, or the session is off with
 *   the date of the next one.
 *
 * The text and the link stay apart: iOS shares a URL next to the text, Android and the web
 * share one text (`messageText`).
 */
export interface ShareMessage {
  text: string;
  url?: string;
}

const text = (value: unknown) => (typeof value === "string" ? value : "");

/** "Mercredi soir · jeu. 26 nov.": the first line of each message. */
function titleLine(t: Translate, names: DateNames, slotName: string, date: string) {
  const day = parseIsoDate(date);
  return text(t("slot.session_message.title", {
    slot: slotName,
    day: day ? formatDay(t, names, day) : date,
  }));
}

type MessageSession = Pick<
  SessionSummary,
  "date" | "deadline" | "state" | "counts" | "min_players" | "places"
>;

/**
 * "Relancer":
 *
 * ```
 * Mercredi soir · jeu. 26 nov.
 * 3 OK, il en faut 4
 * Réponds avant mercredi 20h :
 * https://kancha.pilotariak.com/slot/join?code=K7Q2M9XP
 * ```
 */
export function reminderMessage(
  t: Translate,
  names: DateNames,
  { slotName, session, inviteCode }: {
    slotName: string;
    session: MessageSession;
    inviteCode: string;
  },
): ShareMessage {
  const day = parseIsoDate(session.date);
  const { ok } = session.counts;
  const free = Math.max(0, session.places - ok);
  const count = session.state === "on"
    ? free > 0
      ? t("slot.session_message.ok_free", { ok, count: free })
      : t("slot.session_message.ok_full", { ok })
    : t("slot.session_message.ok_needed", { ok, min: session.min_players });
  const deadline = day ? formatDeadline(t, names, session.deadline, day, "message") : "";
  return {
    text: [
      titleLine(t, names, slotName, session.date),
      text(count),
      text(t("slot.session_message.answer_before", { deadline })),
    ].join("\n"),
    url: inviteUrl(inviteCode),
  };
}

/**
 * "Prévenir", once pik says the game is on or off; null in any other state:
 *
 * ```
 * Mercredi soir · jeu. 26 nov.
 * Annulée : 3 OK à la date limite
 * Prochaine séance : jeu. 10 déc.
 * ```
 */
export function outcomeMessage(
  t: Translate,
  names: DateNames,
  { slotName, session, next }: {
    slotName: string;
    session: MessageSession;
    /** The next session an organizer did not cancel; null when the season has none. */
    next: Pick<SessionSummary, "date"> | null;
  },
): ShareMessage | null {
  const { ok } = session.counts;
  const free = Math.max(0, session.places - ok);
  const nextDay = next ? parseIsoDate(next.date) : null;
  const nextLine = nextDay
    ? [text(t("slot.session_message.next", { day: formatDay(t, names, nextDay) }))]
    : [];
  let lines: string[];
  switch (session.state) {
    case "on":
      lines = [
        text(
          free > 0
            ? t("slot.session_message.on_free", { ok, count: free })
            : t("slot.session_message.on_full", { ok }),
        ),
      ];
      break;
    case "cancelled_short":
      lines = [text(t("slot.session_message.cancelled_short", { ok })), ...nextLine];
      break;
    case "cancelled":
      lines = [text(t("slot.session_message.cancelled")), ...nextLine];
      break;
    default:
      return null;
  }
  return { text: [titleLine(t, names, slotName, session.date), ...lines].join("\n") };
}

/** The message as one text, the link on its last line: what Android and the web share. */
export const messageText = ({ text: body, url }: ShareMessage) =>
  [body, url].filter(Boolean).join("\n");
