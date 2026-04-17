import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface LeagueState {
  selectedLeagueId: string | null;
  setLeague: (id: string) => void;
  clearLeague: () => void;
}

export const useLeagueStore = create<LeagueState>()(
  persist(
    (set) => ({
      selectedLeagueId: null,
      setLeague: (id) => set({ selectedLeagueId: id }),
      clearLeague: () => set({ selectedLeagueId: null }),
    }),
    {
      name: "kancha-league",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
