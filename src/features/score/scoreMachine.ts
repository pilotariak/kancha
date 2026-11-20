/**
 * Pure state machine for the live score keeper (see the match screen).
 *
 * Kept free of React and React Native imports so it can be unit-tested in
 * isolation and reused across platforms. The screen holds this in a
 * `useReducer` and renders from `phase`.
 */

export type Phase = "setup" | "playing" | "won";

export type Side = "a" | "b";

export interface ScoreState {
  phase: Phase;
  teamA: string;
  teamB: string;
  target: number;
  scoreA: number;
  scoreB: number;
  winner: Side | null;
}

export type ScoreAction =
  | { type: "start"; teamA: string; teamB: string; target: number }
  | { type: "increment"; side: Side }
  | { type: "undo"; side: Side }
  | { type: "reset" };

export const INITIAL: ScoreState = {
  phase: "setup",
  teamA: "",
  teamB: "",
  target: 0,
  scoreA: 0,
  scoreB: 0,
  winner: null,
};

/** Sets both scores and derives the phase and the winner from them. */
function withScores(state: ScoreState, scoreA: number, scoreB: number): ScoreState {
  const winner = scoreA >= state.target ? "a" : scoreB >= state.target ? "b" : null;
  return { ...state, scoreA, scoreB, phase: winner ? "won" : "playing", winner };
}

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
    case "increment":
      if (state.phase !== "playing") return state;
      return action.side === "a"
        ? withScores(state, state.scoreA + 1, state.scoreB)
        : withScores(state, state.scoreA, state.scoreB + 1);
    // Points are all alike, so a team's last point is one point off its score.
    case "undo":
      if (state.phase === "setup") return state;
      if (action.side === "a") {
        return state.scoreA > 0 ? withScores(state, state.scoreA - 1, state.scoreB) : state;
      }
      return state.scoreB > 0 ? withScores(state, state.scoreA, state.scoreB - 1) : state;
    case "reset":
      return INITIAL;
  }
}
