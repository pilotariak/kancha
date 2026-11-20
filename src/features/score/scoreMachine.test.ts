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
      const stale = playing({ scoreA: 10, scoreB: 9, phase: "won", winner: "a" });
      const next = reducer(stale, { type: "start", teamA: "A", teamB: "B", target: 10 });
      expect(next.scoreA).toBe(0);
      expect(next.scoreB).toBe(0);
      expect(next.phase).toBe("playing");
      expect(next.winner).toBeNull();
    });
  });

  describe("increment", () => {
    it("adds one point to the chosen side only", () => {
      const next = reducer(playing(), { type: "increment", side: "a" });
      expect(next.scoreA).toBe(1);
      expect(next.scoreB).toBe(0);
      expect(next.phase).toBe("playing");
    });

    it("adds one point to side B only", () => {
      const next = reducer(playing({ scoreA: 3, scoreB: 2 }), { type: "increment", side: "b" });
      expect(next.scoreA).toBe(3);
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

    it("is a no-op once the game is won", () => {
      const won = reducer(playing({ scoreA: 9, target: 10 }), { type: "increment", side: "a" });
      expect(reducer(won, { type: "increment", side: "a" })).toBe(won);
      expect(reducer(won, { type: "increment", side: "b" })).toBe(won);
    });

    it("is a no-op before the game starts", () => {
      expect(reducer(INITIAL, { type: "increment", side: "a" })).toBe(INITIAL);
    });
  });

  describe("undo", () => {
    it("removes the last point of the chosen side only", () => {
      const undone = reducer(playing({ scoreA: 5, scoreB: 4 }), { type: "undo", side: "a" });
      expect(undone.scoreA).toBe(4);
      expect(undone.scoreB).toBe(4);
      expect(undone.phase).toBe("playing");
    });

    it("leaves the other side's points alone, whichever scored last", () => {
      const afterA = reducer(playing({ scoreA: 2, scoreB: 3 }), { type: "increment", side: "a" });
      const undone = reducer(afterA, { type: "undo", side: "b" });
      expect(undone.scoreA).toBe(3);
      expect(undone.scoreB).toBe(2);
    });

    it("can be chained, one point at a time", () => {
      let state = playing({ scoreB: 3 });
      state = reducer(state, { type: "undo", side: "b" });
      state = reducer(state, { type: "undo", side: "b" });
      expect(state.scoreB).toBe(1);
    });

    it("reverts the winning point back to playing", () => {
      const won = reducer(playing({ scoreA: 9, target: 10 }), { type: "increment", side: "a" });
      expect(won.phase).toBe("won");
      const undone = reducer(won, { type: "undo", side: "a" });
      expect(undone.phase).toBe("playing");
      expect(undone.winner).toBeNull();
      expect(undone.scoreA).toBe(9);
    });

    it("keeps the game won when the loser's point is undone", () => {
      const won = playing({ scoreA: 10, scoreB: 6, phase: "won", winner: "a" });
      const undone = reducer(won, { type: "undo", side: "b" });
      expect(undone.scoreB).toBe(5);
      expect(undone.phase).toBe("won");
      expect(undone.winner).toBe("a");
    });

    it("is a no-op when the side has no point", () => {
      const state = playing({ scoreA: 2 });
      expect(reducer(state, { type: "undo", side: "b" })).toBe(state);
    });

    it("is a no-op before the game starts", () => {
      expect(reducer(INITIAL, { type: "undo", side: "a" })).toBe(INITIAL);
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
