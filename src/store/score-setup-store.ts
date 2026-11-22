import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { rememberTeams } from "@/features/score/setup";

interface ScoreSetupState {
  /** Team names of the last matches started, most recent first. */
  recentTeams: string[];
  /** The target of the last match started; null before the first. */
  lastTarget: number | null;
  remember: (teamA: string, teamB: string, target: number) => void;
}

/** What the new match form remembers between matches, on the device only. */
export const useScoreSetupStore = create<ScoreSetupState>()(
  persist(
    (set) => ({
      recentTeams: [],
      lastTarget: null,
      remember: (teamA, teamB, target) =>
        set((state) => ({
          recentTeams: rememberTeams(state.recentTeams, [teamA, teamB]),
          lastTarget: target,
        })),
    }),
    {
      name: "kancha-score-setup",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
