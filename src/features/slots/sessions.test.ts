import type { SessionDetail, SessionSummary } from "@/api/pik-client";

import {
  answerGroups,
  myAnswerLabel,
  nextSession,
  sessionActions,
  sessionRows,
  sessionSentence,
  sessionStateLabel,
  type SlotSessions,
  withAnswer,
} from "./sessions";

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
      slot: slot("s_b", "Jeudi", "19:00"),
      sessions: [session("2026-11-26"), session("2026-12-03")],
    },
    {
      slot: slot("s_a", "Mercredi", "18:00"),
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
    expect(next[0]).toMatchObject({ slotId: "s_a", timeFrom: "18:00" });
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

const answer = (
  member_id: string,
  status: "ok" | "dispo" | "ko",
  changes: Partial<SessionDetail["answers"][number]> = {},
) => ({
  member_id,
  name: member_id.toUpperCase(),
  status,
  answered_at: "2026-11-20T10:00:00Z",
  played: 0,
  me: false,
  ...changes,
});

const silent = (member_id: string, me = false) => ({
  member_id,
  name: member_id.toUpperCase(),
  played: 0,
  me,
});

const detail = (changes: Partial<SessionDetail> = {}): SessionDetail => ({
  ...session("2026-11-26"),
  answers: [answer("m_a", "ok"), answer("m_b", "dispo"), answer("m_c", "ko")],
  no_answer: [silent("m_me", true), silent("m_d")],
  guests: [],
  call_order: [],
  lineup: { version: 0, games: [] } as unknown as SessionDetail["lineup"],
  ...changes,
});

describe("answerGroups", () => {
  it("groups the names by answer, then the members who did not answer", () => {
    const groups = answerGroups(detail());
    expect(groups.map((group) => [group.key, group.members.map((m) => m.memberId)])).toEqual([
      ["ok", ["m_a"]],
      ["dispo", ["m_b"]],
      ["ko", ["m_c"]],
      ["none", ["m_me", "m_d"]],
    ]);
    expect(groups[3]?.members[0]).toEqual({ memberId: "m_me", name: "M_ME", me: true });
  });

  it("keeps every group, and a member who left without a name", () => {
    const groups = answerGroups(
      detail({ answers: [answer("m_x", "ok", { name: null })], no_answer: [] }),
    );
    expect(groups.map((group) => group.members.length)).toEqual([1, 0, 0, 0]);
    expect(groups[0]?.members[0]?.name).toBeNull();
  });
});

describe("withAnswer", () => {
  const NOW = "2026-11-24T12:00:00Z";

  it("moves the player's own name to its group and sets their answer", () => {
    const next = withAnswer(detail(), "m_me", "ok", NOW);
    expect(next.my_answer).toBe("ok");
    expect(next.no_answer.map((m) => m.member_id)).toEqual(["m_d"]);
    expect(next.answers.map((a) => `${a.member_id}:${a.status}`)).toEqual([
      "m_a:ok",
      "m_me:ok",
      "m_b:dispo",
      "m_c:ko",
    ]);
    expect(next.answers[1]).toMatchObject({ me: true, answered_at: NOW, name: "M_ME" });
  });

  it("changes an answer, and leaves the counts and the state to pik", () => {
    const before = detail();
    const next = withAnswer(before, "m_a", "ko", NOW);
    expect(next.answers.map((a) => `${a.member_id}:${a.status}`)).toEqual([
      "m_b:dispo",
      "m_c:ko",
      "m_a:ko",
    ]);
    expect(next.counts).toBe(before.counts);
    expect(next.state).toBe(before.state);
    expect(next.my_answer).toBe(before.my_answer);
  });

  it("answers for another member without touching the player's own answer", () => {
    const next = withAnswer(detail({ my_answer: "dispo" }), "m_d", "dispo", NOW);
    expect(next.my_answer).toBe("dispo");
    expect(next.answers.map((a) => a.member_id)).toEqual(["m_a", "m_b", "m_d", "m_c"]);
  });

  it("leaves the session as it is for a member it does not list", () => {
    const before = detail();
    expect(withAnswer(before, "m_unknown", "ok", NOW)).toBe(before);
  });
});

describe("nextSession", () => {
  const sessions = [
    session("2026-11-26"),
    session("2026-12-10", { cancelled: true, state: "cancelled" }),
    session("2026-12-24"),
    session("2026-12-03"),
  ];

  it("finds the next date an organizer did not cancel", () => {
    expect(nextSession(sessions, "2026-11-26")?.date).toBe("2026-12-03");
    expect(nextSession(sessions, "2026-12-03")?.date).toBe("2026-12-24");
  });

  it("is null at the end of the season, or for a date it cannot read", () => {
    expect(nextSession(sessions, "2026-12-24")).toBeNull();
    expect(nextSession(sessions, "bad")).toBeNull();
  });
});

describe("sessionActions", () => {
  const NOW = new Date("2026-11-24T12:00:00Z");
  const upcoming = session("2026-11-26", { starts_at: "2026-11-26T17:00:00Z" });

  it("lets every player answer and send a reminder before the deadline", () => {
    expect(sessionActions(upcoming, false, NOW)).toEqual({
      answer: "all",
      remind: true,
      notify: false,
      cancel: false,
      restore: false,
    });
  });

  it("gives organizers Prévenir once the game is on, and the cancellation", () => {
    expect(sessionActions({ ...upcoming, state: "on" }, true, NOW)).toEqual({
      answer: "all",
      remind: true,
      notify: true,
      cancel: true,
      restore: false,
    });
    expect(sessionActions(upcoming, true, NOW).notify).toBe(false);
  });

  it("takes only KO after the deadline, and no reminder", () => {
    const closed = { ...upcoming, deadline_passed: true, state: "to_complete" as const };
    expect(sessionActions(closed, true, NOW)).toMatchObject({
      answer: "ko_only",
      remind: false,
      notify: false,
    });
    expect(sessionActions({ ...closed, state: "cancelled_short" }, true, NOW).notify).toBe(true);
  });

  it("takes no answer on a cancelled date, which an organizer can restore", () => {
    const cancelled = { ...upcoming, cancelled: true, state: "cancelled" as const };
    expect(sessionActions(cancelled, true, NOW)).toEqual({
      answer: "none",
      remind: false,
      notify: true,
      cancel: false,
      restore: true,
    });
    expect(sessionActions(cancelled, false, NOW).restore).toBe(false);
  });

  it("neither cancels nor restores a session that started", () => {
    const started = new Date("2026-11-26T17:00:00Z");
    expect(sessionActions(upcoming, true, started).cancel).toBe(false);
    expect(
      sessionActions({ ...upcoming, cancelled: true, state: "cancelled" }, true, started).restore,
    ).toBe(false);
  });
});

describe("sessionSentence", () => {
  const key = (name: string) => `slot.session_screen.sentence.${name}`;
  const of = (changes: Partial<SessionSummary>) => sessionSentence(session("2026-11-26", changes));

  it("counts the free places and the Dispo answers that can complete them", () => {
    expect(of({ state: "on", counts: { ok: 4, dispo: 2, ko: 0, none: 0 }, places: 6 })).toEqual([
      { key: key("free_places"), params: { count: 2 } },
      { key: key("dispo_can_complete"), params: { count: 2 } },
    ]);
    expect(of({ state: "missing", counts: { ok: 2, dispo: 0, ko: 1, none: 3 } })).toEqual([
      { key: key("free_places"), params: { count: 6 } },
    ]);
  });

  it("says when the places are full, and how many OK answers wait", () => {
    expect(of({ state: "on", counts: { ok: 9, dispo: 1, ko: 0, none: 0 }, places: 8 })).toEqual([
      { key: key("full") },
      { key: key("waiting"), params: { count: 1 } },
    ]);
  });

  it("explains each state pik reaches at the deadline", () => {
    expect(of({ state: "to_complete", counts: { ok: 3, dispo: 2, ko: 0, none: 0 } })).toEqual([
      { key: key("ok_short"), params: { count: 1 } },
      { key: key("dispo_can_complete"), params: { count: 2 } },
    ]);
    expect(of({ state: "cancelled_short", counts: { ok: 3, dispo: 0, ko: 2, none: 0 } }))
      .toEqual([{ key: key("ok_at_deadline"), params: { ok: 3, min: 4 } }]);
    expect(of({ state: "cancelled" })).toEqual([{ key: key("cancelled") }]);
  });
});
