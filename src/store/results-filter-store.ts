import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { SpecialtyCategory } from "@/types/competition";

interface ResultsFilterState {
  /** Last specialty and category viewed, by `selectionKey`. */
  selections: Record<string, SpecialtyCategory>;
  remember: (key: string, selection: SpecialtyCategory) => void;
}

export const useResultsFilterStore = create<ResultsFilterState>()(
  persist(
    (set) => ({
      selections: {},
      remember: (key, selection) =>
        set((state) => {
          const current = state.selections[key];
          if (
            current?.specialtyId === selection.specialtyId
            && current?.categoryId === selection.categoryId
          ) {
            return state;
          }
          return { selections: { ...state.selections, [key]: selection } };
        }),
    }),
    {
      name: "kancha-results-filters",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

/** Each league has its own database, so competition ids repeat across leagues. */
export function selectionKey(leagueId: string | null, competitionId: string): string {
  return `${leagueId ?? ""}:${competitionId}`;
}

const subscribeHydration = (onChange: () => void) =>
  useResultsFilterStore.persist.onFinishHydration(onChange);
const hasHydrated = () => useResultsFilterStore.persist.hasHydrated();

/**
 * True once the saved selections are loaded. AsyncStorage reads are async, so
 * wait for this before defaulting to a pair, or the default overwrites the
 * saved one. False in the static web render, which has no storage.
 */
export function useResultsFilterHydrated(): boolean {
  return useSyncExternalStore(subscribeHydration, hasHydrated, () => false);
}
