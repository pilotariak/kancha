import type { SessionSummary } from "@/api/pik-client";

import { myAnswerLabel, sessionRows, sessionStateLabel, type SlotSessions } from "./sessions";

const session = (date: string, changes: Partial<SessionSummary> = {}): SessionSummary => ({
  date,
  starts_at: `${date}T17:00:00Z`,
  deadline: `${date}T19:00:00Z`,
  deadline_passed: false,
  state: "missing",
  missing: 2,
  min_players: 4,
  places: 8,
  cancelled: false,
  counts: { ok: 2, dispo: 1, ko: 1, none: 4 },
  my_answer: null,
  ...changes,
});

/** Slot ids as pik writes them: UUID v7. */
const SLOT_ID_A = "01a216ce-ea00-7762-b174-5b003c884036";
const SLOT_ID_B = "01a216ce-ea04-75e1-ac75-6f793b4c6793";

const slot = (id: string, name: string, timeFrom: string) => ({
  id,
  name,
  schedule: { weekday: 3, time_from: timeFrom, interval_weeks: 1 },
});

describe("sessionStateLabel", () => {
  it("labels each state pik computes", () => {
    expect(sessionStateLabel({ state: "on", missing: 0 })).toEqual({
      key: "slot.state.on",
      tone: "green",
    });
    expect(sessionStateLabel({ state: "missing", missing: 2 })).toEqual({
      key: "slot.state.missing",
      params: { count: 2 },
      tone: "red",
    });
    expect(sessionStateLabel({ state: "to_complete", missing: 0 }).tone).toBe("amber");
    expect(sessionStateLabel({ state: "cancelled_short", missing: 0 }).key).toBe(
      "slot.state.cancelled_short",
    );
    expect(sessionStateLabel({ state: "cancelled", missing: 0 }).tone).toBe("soft");
  });
});

describe("myAnswerLabel", () => {
  it("uses the legend's colours", () => {
    expect(myAnswerLabel("ok")).toEqual({ key: "slot.status.ok", tone: "green" });
    expect(myAnswerLabel("ko")).toEqual({ key: "slot.status.ko", tone: "red" });
    expect(myAnswerLabel("dispo")).toEqual({ key: "slot.status.disponible", tone: "amber" });
  });

  it("is amber while the player has not answered", () => {
    expect(myAnswerLabel(null)).toEqual({ key: "slot.my_answer.none", tone: "amber" });
    expect(myAnswerLabel(undefined).key).toBe("slot.my_answer.none");
  });
});

describe("sessionRows", () => {
  const slots: SlotSessions[] = [
    {
      slot: slot(SLOT_ID_B, "Jeudi", "19:00"),
      sessions: [session("2026-11-26"), session("2026-12-03")],
    },
    {
      slot: slot(SLOT_ID_A, "Mercredi", "18:00"),
      sessions: [session("2026-12-03"), session("2026-11-25")],
    },
  ];

  it("merges the slots by date, then start time, under a row per month", () => {
    const rows = sessionRows(slots);
    expect(
      rows.map((row) => (row.type === "month" ? row.key : `${row.slotName} ${row.session.date}`)),
    )
      .toEqual([
        "month-2026-11",
        "Mercredi 2026-11-25",
        "Jeudi 2026-11-26",
        "month-2026-12",
        "Mercredi 2026-12-03",
        "Jeudi 2026-12-03",
      ]);
  });

  it("marks the first session as the next one", () => {
    const next = sessionRows(slots).filter((row) => row.type === "session" && row.isNext);
    expect(next).toHaveLength(1);
    expect(next[0]).toMatchObject({ slotId: SLOT_ID_A, timeFrom: "18:00" });
  });

  it("gives each row a unique key", () => {
    const rows = sessionRows(slots);
    expect(new Set(rows.map((row) => row.key)).size).toBe(rows.length);
  });

  it("skips a date it cannot read, and is empty without sessions", () => {
    expect(sessionRows([{ slot: slot("s", "S", "18:00"), sessions: [session("bad")] }])).toEqual(
      [],
    );
    expect(sessionRows([])).toEqual([]);
  });
});
