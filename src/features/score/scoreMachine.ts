/**
 * Pure state machine for the live score keeper (see score screen).
 *
 * Kept free of React and React Native imports so it can be unit-tested in
 * isolation and reused across platforms. The screen holds this in a
 * `useReducer` and renders from `phase`.
 */

export type Phase = "setup" | "playing" | "won";

export interface ScoreState {
  phase: Phase;
  teamA: string;
  teamB: string;
  target: number;
  scoreA: number;
  scoreB: number;
  prev: { scoreA: number; scoreB: number } | null;
  winner: "a" | "b" | null;
}

export type ScoreAction =
  | { type: "start"; teamA: string; teamB: string; target: number }
  | { type: "increment"; side: "a" | "b" }
  | { type: "undo" }
  | { type: "reset" };

export const INITIAL: ScoreState = {
  phase: "setup",
  teamA: "",
  teamB: "",
  target: 0,
  scoreA: 0,
  scoreB: 0,
  prev: null,
  winner: null,
};

export function reducer(state: ScoreState, action: ScoreAction): ScoreState {
  switch (action.type) {
    case "start":
      return {
        ...INITIAL,
        phase: "playing",
        teamA: action.teamA,
        teamB: action.teamB,
        target: action.target,
      };
    case "increment": {
      const nextA = action.side === "a" ? state.scoreA + 1 : state.scoreA;
      const nextB = action.side === "b" ? state.scoreB + 1 : state.scoreB;
      const won = nextA >= state.target || nextB >= state.target;
      return {
        ...state,
        prev: { scoreA: state.scoreA, scoreB: state.scoreB },
        scoreA: nextA,
        scoreB: nextB,
        phase: won ? "won" : "playing",
        winner: won ? (nextA >= state.target ? "a" : "b") : null,
      };
    }
    case "undo":
      if (!state.prev) return state;
      return { ...state, ...state.prev, prev: null, phase: "playing", winner: null };
    case "reset":
      return INITIAL;
  }
}
