import { INITIAL, reducer, type ScoreState } from "./scoreMachine";

/** Build a "playing" state with the given scores (target defaults to 10). */
function playing(overrides: Partial<ScoreState> = {}): ScoreState {
  return {
    ...INITIAL,
    phase: "playing",
    teamA: "A",
    teamB: "B",
    target: 10,
    ...overrides,
  };
}

describe("scoreMachine reducer", () => {
  describe("start", () => {
    it("moves from setup to playing with the chosen teams and target", () => {
      const next = reducer(INITIAL, {
        type: "start",
        teamA: "Larralde",
        teamB: "Bielle",
        target: 40,
      });
      expect(next.phase).toBe("playing");
      expect(next.teamA).toBe("Larralde");
      expect(next.teamB).toBe("Bielle");
      expect(next.target).toBe(40);
      expect(next.scoreA).toBe(0);
      expect(next.scoreB).toBe(0);
      expect(next.winner).toBeNull();
    });

    it("clears any carried-over scores from a previous game", () => {
      const stale = playing({ scoreA: 7, scoreB: 9, prev: { scoreA: 6, scoreB: 9 } });
      const next = reducer(stale, { type: "start", teamA: "A", teamB: "B", target: 10 });
      expect(next.scoreA).toBe(0);
      expect(next.scoreB).toBe(0);
      expect(next.prev).toBeNull();
    });
  });

  describe("increment", () => {
    it("adds one point to the chosen side only", () => {
      const next = reducer(playing(), { type: "increment", side: "a" });
      expect(next.scoreA).toBe(1);
      expect(next.scoreB).toBe(0);
      expect(next.phase).toBe("playing");
    });

    it("records the previous scores so the move can be undone", () => {
      const next = reducer(playing({ scoreA: 3, scoreB: 2 }), { type: "increment", side: "b" });
      expect(next.prev).toEqual({ scoreA: 3, scoreB: 2 });
      expect(next.scoreB).toBe(3);
    });

    it("declares side A the winner when it reaches the target", () => {
      const next = reducer(playing({ scoreA: 9, target: 10 }), { type: "increment", side: "a" });
      expect(next.phase).toBe("won");
      expect(next.winner).toBe("a");
      expect(next.scoreA).toBe(10);
    });

    it("declares side B the winner when it reaches the target", () => {
      const next = reducer(playing({ scoreB: 9, target: 10 }), { type: "increment", side: "b" });
      expect(next.phase).toBe("won");
      expect(next.winner).toBe("b");
    });

    it("wins on reaching the target exactly (>= boundary)", () => {
      const next = reducer(playing({ scoreA: 0, target: 1 }), { type: "increment", side: "a" });
      expect(next.phase).toBe("won");
      expect(next.winner).toBe("a");
    });
  });

  describe("undo", () => {
    it("restores the scores captured before the last increment", () => {
      const afterPoint = reducer(playing({ scoreA: 4, scoreB: 4 }), {
        type: "increment",
        side: "a",
      });
      const undone = reducer(afterPoint, { type: "undo" });
      expect(undone.scoreA).toBe(4);
      expect(undone.scoreB).toBe(4);
      expect(undone.phase).toBe("playing");
      expect(undone.prev).toBeNull();
    });

    it("reverts a winning point back to playing", () => {
      const won = reducer(playing({ scoreA: 9, target: 10 }), { type: "increment", side: "a" });
      expect(won.phase).toBe("won");
      const undone = reducer(won, { type: "undo" });
      expect(undone.phase).toBe("playing");
      expect(undone.winner).toBeNull();
      expect(undone.scoreA).toBe(9);
    });

    it("is a no-op when there is nothing to undo", () => {
      const state = playing({ scoreA: 2 });
      expect(reducer(state, { type: "undo" })).toBe(state);
    });

    it("cannot be chained twice (only one step of history is kept)", () => {
      const first = reducer(playing(), { type: "increment", side: "a" });
      const undone = reducer(first, { type: "undo" });
      expect(reducer(undone, { type: "undo" })).toBe(undone);
    });
  });

  describe("reset", () => {
    it("returns to the initial setup state", () => {
      const won = reducer(playing({ scoreA: 10, phase: "won", winner: "a" }), { type: "reset" });
      expect(won).toEqual(INITIAL);
    });
  });

  it("never mutates the input state", () => {
    const state = playing({ scoreA: 5, scoreB: 5 });
    const snapshot = JSON.stringify(state);
    reducer(state, { type: "increment", side: "a" });
    expect(JSON.stringify(state)).toBe(snapshot);
  });
});
