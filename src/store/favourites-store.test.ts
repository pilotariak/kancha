import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  addFavourite,
  type Favourite,
  hasFavourites,
  isFollowed,
  NO_FAVOURITES,
  removeFavourite,
  selectIsFollowed,
  selectLeagueFavourites,
  toggleFavourite,
  useFavouritesStore,
} from "./favourites-store";

jest.mock(
  "@react-native-async-storage/async-storage",
  () => jest.requireActual("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

// Figures from Frontis, league lcapb.
const club: Favourite = { kind: "club", id: "4063", name: "AMIS DE LA PEL.BASQUE-LE HAILLAN" };
const player: Favourite = { kind: "player", licence: "066629", name: "PUCHEUX Theo" };
const category: Favourite = {
  kind: "category",
  competitionId: "502",
  competitionName: "Championnat CCAPB 2025-2026",
  specialtyId: "136",
  specialtyName: "Mur à Gauche / P.G. Creuse Masculin Individuel",
  categoryId: "1573",
  categoryName: "1ère Série",
};

const STORAGE_KEY = "kancha-favourites";

describe("favourites lists", () => {
  it("adds each kind to its own list, without the kind", () => {
    const all = addFavourite(addFavourite(addFavourite(NO_FAVOURITES, club), player), category);
    expect(all).toEqual({
      clubs: [{ id: "4063", name: "AMIS DE LA PEL.BASQUE-LE HAILLAN" }],
      players: [{ licence: "066629", name: "PUCHEUX Theo" }],
      categories: [{
        competitionId: "502",
        competitionName: "Championnat CCAPB 2025-2026",
        specialtyId: "136",
        specialtyName: "Mur à Gauche / P.G. Creuse Masculin Individuel",
        categoryId: "1573",
        categoryName: "1ère Série",
      }],
    });
    expect(hasFavourites(all)).toBe(true);
    expect(hasFavourites(NO_FAVOURITES)).toBe(false);
  });

  it("adds a favourite once, and keeps the order they were followed in", () => {
    const other: Favourite = {
      kind: "club",
      id: "4132",
      name: "ASSOCIATION LE TRINQUET BORDELAIS",
    };
    const once = addFavourite(addFavourite(NO_FAVOURITES, club), other);
    expect(addFavourite(once, club)).toBe(once);
    expect(once.clubs.map((c) => c.id)).toEqual(["4063", "4132"]);
  });

  it("tells favourites apart by their ids, not their names", () => {
    const favourites = addFavourite(addFavourite(NO_FAVOURITES, player), category);
    expect(isFollowed(favourites, { kind: "player", licence: "066629" })).toBe(true);
    expect(isFollowed(favourites, { kind: "player", licence: "054123" })).toBe(false);
    expect(
      isFollowed(favourites, {
        kind: "category",
        competitionId: "502",
        specialtyId: "136",
        categoryId: "1573",
      }),
    ).toBe(true);
    // Another category of the same specialty, or the same pair in another season.
    expect(
      isFollowed(favourites, {
        kind: "category",
        competitionId: "502",
        specialtyId: "136",
        categoryId: "1574",
      }),
    ).toBe(false);
    expect(
      isFollowed(favourites, {
        kind: "category",
        competitionId: "506",
        specialtyId: "136",
        categoryId: "1573",
      }),
    ).toBe(false);
    // A club and a player never match each other, even with the same id.
    expect(isFollowed(favourites, { kind: "club", id: "066629" })).toBe(false);
  });

  it("removes a favourite by its ids, and leaves a list without it as it was", () => {
    const favourites = addFavourite(addFavourite(NO_FAVOURITES, club), category);
    const removed = removeFavourite(favourites, {
      kind: "category",
      competitionId: "502",
      specialtyId: "136",
      categoryId: "1573",
    });
    expect(removed.categories).toEqual([]);
    expect(removed.clubs).toEqual(favourites.clubs);
    expect(removeFavourite(removed, { kind: "club", id: "9999" })).toBe(removed);
  });

  it("toggles a favourite on, then off", () => {
    const on = toggleFavourite(NO_FAVOURITES, player);
    expect(isFollowed(on, player)).toBe(true);
    const off = toggleFavourite(on, player);
    expect(isFollowed(off, player)).toBe(false);
    expect(hasFavourites(off)).toBe(false);
  });
});

describe("useFavouritesStore", () => {
  beforeEach(async () => {
    useFavouritesStore.setState({ byLeague: {} });
    await AsyncStorage.clear();
  });

  it("follows and unfollows in the league given", () => {
    const { follow, unfollow } = useFavouritesStore.getState();
    follow("lcapb", club);
    follow("lcapb", player);
    expect(selectIsFollowed("lcapb", club)(useFavouritesStore.getState())).toBe(true);
    unfollow("lcapb", { kind: "club", id: "4063" });
    const state = useFavouritesStore.getState();
    expect(selectIsFollowed("lcapb", club)(state)).toBe(false);
    expect(selectLeagueFavourites("lcapb")(state).players).toHaveLength(1);
  });

  it("toggles a favourite", () => {
    const { toggle } = useFavouritesStore.getState();
    toggle("lcapb", category);
    expect(selectIsFollowed("lcapb", category)(useFavouritesStore.getState())).toBe(true);
    toggle("lcapb", category);
    expect(selectIsFollowed("lcapb", category)(useFavouritesStore.getState())).toBe(false);
  });

  it("keeps each league's favourites apart", () => {
    const { follow, toggle } = useFavouritesStore.getState();
    follow("lcapb", club);
    follow("lidfpb", player);
    // The same club id in another league is another club.
    toggle("lidfpb", club);
    toggle("lidfpb", club);

    const state = useFavouritesStore.getState();
    expect(selectIsFollowed("lcapb", club)(state)).toBe(true);
    expect(selectIsFollowed("lidfpb", club)(state)).toBe(false);
    expect(selectIsFollowed("lcapb", player)(state)).toBe(false);
    expect(selectIsFollowed("lidfpb", player)(state)).toBe(true);
  });

  it("gives one shared empty value for a league without favourites, and before a league", () => {
    const { follow, unfollow } = useFavouritesStore.getState();
    const state = useFavouritesStore.getState();
    expect(selectLeagueFavourites("ctpb")(state)).toBe(NO_FAVOURITES);
    expect(selectLeagueFavourites(null)(state)).toBe(NO_FAVOURITES);
    expect(selectIsFollowed(null, club)(state)).toBe(false);

    // A league whose last favourite goes is dropped, not kept empty.
    follow("ctpb", club);
    unfollow("ctpb", club);
    expect(useFavouritesStore.getState().byLeague).toEqual({});
  });

  it("does not notify when nothing changes", () => {
    const listener = jest.fn();
    const unsubscribe = useFavouritesStore.subscribe(listener);
    const { follow, unfollow } = useFavouritesStore.getState();
    follow("lcapb", club);
    const before = useFavouritesStore.getState();
    follow("lcapb", club);
    unfollow("lcapb", player);
    unsubscribe();
    expect(useFavouritesStore.getState()).toBe(before);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("saves the lists by league, names included, and nothing else", async () => {
    const { follow } = useFavouritesStore.getState();
    follow("lcapb", club);
    follow("lcapb", player);
    follow("lcapb", category);
    follow("lidfpb", { kind: "player", licence: "012345", name: null });

    const saved = JSON.parse((await AsyncStorage.getItem(STORAGE_KEY)) ?? "null");
    expect(saved).toEqual({
      state: {
        byLeague: {
          lcapb: {
            clubs: [{ id: "4063", name: "AMIS DE LA PEL.BASQUE-LE HAILLAN" }],
            players: [{ licence: "066629", name: "PUCHEUX Theo" }],
            categories: [{
              competitionId: "502",
              competitionName: "Championnat CCAPB 2025-2026",
              specialtyId: "136",
              specialtyName: "Mur à Gauche / P.G. Creuse Masculin Individuel",
              categoryId: "1573",
              categoryName: "1ère Série",
            }],
          },
          lidfpb: { clubs: [], players: [{ licence: "012345", name: null }], categories: [] },
        },
      },
      version: 0,
    });
  });

  it("loads the saved lists back", async () => {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        state: {
          byLeague: {
            lcapb: {
              clubs: [{ id: "4063", name: "AMIS DE LA PEL.BASQUE-LE HAILLAN" }],
              players: [],
              categories: [],
            },
          },
        },
        version: 0,
      }),
    );
    await useFavouritesStore.persist.rehydrate();

    const state = useFavouritesStore.getState();
    expect(useFavouritesStore.persist.hasHydrated()).toBe(true);
    expect(selectIsFollowed("lcapb", club)(state)).toBe(true);
    expect(selectLeagueFavourites("lcapb")(state).clubs[0].name).toBe(
      "AMIS DE LA PEL.BASQUE-LE HAILLAN",
    );
    // The actions survive the load.
    state.unfollow("lcapb", club);
    expect(useFavouritesStore.getState().byLeague).toEqual({});
  });
});
