import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Names are stored with the ids, so the followed list shows offline and without a request.

export interface FollowedClub {
  id: string;
  name: string;
}

export interface FollowedPlayer {
  licence: string;
  /** Null when the league site lists the licence alone. */
  name: string | null;
}

/** A specialty and category of one competition: the results screen on that pair. */
export interface FollowedCategory {
  competitionId: string;
  competitionName: string;
  specialtyId: string;
  specialtyName: string;
  categoryId: string;
  categoryName: string;
}

/** What one league's reader follows, each list in the order it was followed. */
export interface LeagueFavourites {
  clubs: FollowedClub[];
  players: FollowedPlayer[];
  categories: FollowedCategory[];
}

/** A favourite to follow, with its names. */
export type Favourite =
  | ({ kind: "club" } & FollowedClub)
  | ({ kind: "player" } & FollowedPlayer)
  | ({ kind: "category" } & FollowedCategory);

/** What tells a favourite apart: its ids, without the names. */
export type FavouriteRef =
  | { kind: "club"; id: string }
  | { kind: "player"; licence: string }
  | { kind: "category"; competitionId: string; specialtyId: string; categoryId: string };

/** One shared empty value: a selector returning a new object each time would re-render forever. */
export const NO_FAVOURITES: LeagueFavourites = Object.freeze({
  clubs: [],
  players: [],
  categories: [],
}) as LeagueFavourites;

type CategoryIds = Pick<FollowedCategory, "competitionId" | "specialtyId" | "categoryId">;

const sameCategory = (a: CategoryIds, b: CategoryIds) =>
  a.competitionId === b.competitionId
  && a.specialtyId === b.specialtyId
  && a.categoryId === b.categoryId;

export function isFollowed(favourites: LeagueFavourites, ref: FavouriteRef): boolean {
  switch (ref.kind) {
    case "club":
      return favourites.clubs.some((c) => c.id === ref.id);
    case "player":
      return favourites.players.some((p) => p.licence === ref.licence);
    case "category":
      return favourites.categories.some((c) => sameCategory(c, ref));
  }
}

export function hasFavourites(favourites: LeagueFavourites): boolean {
  return favourites.clubs.length + favourites.players.length + favourites.categories.length > 0;
}

/** Adds the favourite at the end of its list; the same list when it is already there. */
export function addFavourite(favourites: LeagueFavourites, favourite: Favourite): LeagueFavourites {
  if (isFollowed(favourites, favourite)) return favourites;
  switch (favourite.kind) {
    case "club": {
      const { kind: _, ...club } = favourite;
      return { ...favourites, clubs: [...favourites.clubs, club] };
    }
    case "player": {
      const { kind: _, ...player } = favourite;
      return { ...favourites, players: [...favourites.players, player] };
    }
    case "category": {
      const { kind: _, ...category } = favourite;
      return { ...favourites, categories: [...favourites.categories, category] };
    }
  }
}

/** Removes the favourite; the same list when it is not there. */
export function removeFavourite(favourites: LeagueFavourites, ref: FavouriteRef): LeagueFavourites {
  if (!isFollowed(favourites, ref)) return favourites;
  switch (ref.kind) {
    case "club":
      return { ...favourites, clubs: favourites.clubs.filter((c) => c.id !== ref.id) };
    case "player":
      return {
        ...favourites,
        players: favourites.players.filter((p) => p.licence !== ref.licence),
      };
    case "category":
      return {
        ...favourites,
        categories: favourites.categories.filter((c) => !sameCategory(c, ref)),
      };
  }
}

export function toggleFavourite(
  favourites: LeagueFavourites,
  favourite: Favourite,
): LeagueFavourites {
  return isFollowed(favourites, favourite)
    ? removeFavourite(favourites, favourite)
    : addFavourite(favourites, favourite);
}

interface FavouritesState {
  /** By league id: each league has its own database, so ids repeat across leagues. */
  byLeague: Record<string, LeagueFavourites>;
  follow: (leagueId: string, favourite: Favourite) => void;
  unfollow: (leagueId: string, ref: FavouriteRef) => void;
  toggle: (leagueId: string, favourite: Favourite) => void;
}

type Change = (favourites: LeagueFavourites) => LeagueFavourites;

/** Applies `change` to one league; a league left with no favourite is dropped. */
function inLeague(state: FavouritesState, leagueId: string, change: Change) {
  const current = state.byLeague[leagueId] ?? NO_FAVOURITES;
  const next = change(current);
  if (next === current) return state;
  const { [leagueId]: _, ...others } = state.byLeague;
  return { byLeague: hasFavourites(next) ? { ...others, [leagueId]: next } : others };
}

/** The clubs, players and categories followed, on the device only, by league. */
export const useFavouritesStore = create<FavouritesState>()(
  persist(
    (set) => ({
      byLeague: {},
      follow: (leagueId, favourite) =>
        set((state) => inLeague(state, leagueId, (f) => addFavourite(f, favourite))),
      unfollow: (leagueId, ref) =>
        set((state) => inLeague(state, leagueId, (f) => removeFavourite(f, ref))),
      toggle: (leagueId, favourite) =>
        set((state) => inLeague(state, leagueId, (f) => toggleFavourite(f, favourite))),
    }),
    {
      name: "kancha-favourites",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ byLeague: state.byLeague }),
    },
  ),
);

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectLeagueFavourites =
  (leagueId: string | null) => (state: FavouritesState): LeagueFavourites =>
    (leagueId ? state.byLeague[leagueId] : undefined) ?? NO_FAVOURITES;

export const selectIsFollowed =
  (leagueId: string | null, ref: FavouriteRef) => (state: FavouritesState): boolean =>
    isFollowed(selectLeagueFavourites(leagueId)(state), ref);

const subscribeHydration = (onChange: () => void) =>
  useFavouritesStore.persist.onFinishHydration(onChange);
const hasHydrated = () => useFavouritesStore.persist.hasHydrated();

/**
 * True once the saved favourites are loaded. Until then a follow would be overwritten by the
 * saved list, and a star would show the wrong state. False in the static web render.
 */
export function useFavouritesHydrated(): boolean {
  return useSyncExternalStore(subscribeHydration, hasHydrated, () => false);
}
