import { buildFilterOptions, resolveSelection, withSelected } from "./resultFilters";

// Names and pairs come from Frontis, lcapb competition 502 (2025-2026): specialties
// 139 and 140 and category 1576 hold no results there, and 142 has 1ère Série only.
const SPECIALTIES = [
  { id: "136", name: "Mur à Gauche / P.G. Creuse Masculin Individuel" },
  { id: "139", name: "Place Libre / Grand Chistera" },
  { id: "141", name: "Place Libre / P.G. Pleine Masculin" },
  { id: "142", name: "Trinquet / P.G. Creuse Feminine" },
];
const CATEGORIES = [
  { id: "1573", name: "1ère Série" },
  { id: "1574", name: "2ème Série" },
  { id: "1575", name: "3ème Série" },
  { id: "1576", name: "Sénior" },
];
const PAIRS = [
  { specialtyId: "136", categoryId: "1573" },
  { specialtyId: "136", categoryId: "1574" },
  { specialtyId: "141", categoryId: "1573" },
  { specialtyId: "141", categoryId: "1574" },
  { specialtyId: "141", categoryId: "1575" },
  { specialtyId: "142", categoryId: "1573" },
];

const options = buildFilterOptions(PAIRS, SPECIALTIES, CATEGORIES);
const ids = (items: { id: string }[] | undefined) => items?.map((i) => i.id);

describe("buildFilterOptions", () => {
  it("keeps the specialties with results, in API order", () => {
    expect(ids(options.specialties)).toEqual(["136", "141", "142"]);
  });

  it("keeps each specialty's categories with results", () => {
    expect(ids(options.categories["136"])).toEqual(["1573", "1574"]);
    expect(ids(options.categories["141"])).toEqual(["1573", "1574", "1575"]);
    expect(ids(options.categories["142"])).toEqual(["1573"]);
    expect(options.categories["139"]).toBeUndefined();
  });

  it("puts series first, whatever their case", () => {
    // ctpb lists "4ème série" in lower case, after its age groups in this example.
    const categories = [
      { id: "1", name: "M12 - Poussins - Umetxoak" },
      { id: "2", name: "1ère Série - 1.Maila" },
      { id: "3", name: "4ème série - 4.Maila" },
    ];
    const pairs = categories.map((c) => ({ specialtyId: "115", categoryId: c.id }));
    const built = buildFilterOptions(pairs, [{ id: "115", name: "Trinquet" }], categories);
    expect(ids(built.categories["115"])).toEqual(["2", "3", "1"]);
  });

  it("skips specialties and categories the API does not list", () => {
    const built = buildFilterOptions(
      [{ specialtyId: "999", categoryId: "1573" }],
      SPECIALTIES,
      CATEGORIES,
    );
    expect(built).toEqual({ specialties: [], categories: {} });
  });
});

describe("resolveSelection", () => {
  it("keeps the requested pair, even without results", () => {
    expect(resolveSelection(options, { specialtyId: "136", categoryId: "1575" })).toEqual({
      specialtyId: "136",
      categoryId: "1575",
    });
  });

  it("defaults to the first specialty and its first category", () => {
    expect(resolveSelection(options, {})).toEqual({ specialtyId: "136", categoryId: "1573" });
  });

  it("restores the last pair viewed", () => {
    const last = { specialtyId: "141", categoryId: "1575" };
    expect(resolveSelection(options, {}, last)).toEqual(last);
  });

  it("ignores a last specialty that no longer has results", () => {
    const last = { specialtyId: "139", categoryId: "1573" };
    expect(resolveSelection(options, {}, last)).toEqual({ specialtyId: "136", categoryId: "1573" });
  });

  it("completes a requested specialty with the last category when it has one", () => {
    const last = { specialtyId: "136", categoryId: "1574" };
    expect(resolveSelection(options, { specialtyId: "141" }, last)).toEqual({
      specialtyId: "141",
      categoryId: "1574",
    });
  });

  it("completes a requested specialty with its first category otherwise", () => {
    const last = { specialtyId: "141", categoryId: "1575" };
    expect(resolveSelection(options, { specialtyId: "142" }, last)).toEqual({
      specialtyId: "142",
      categoryId: "1573",
    });
  });

  it("returns null when nothing can be picked", () => {
    expect(resolveSelection({ specialties: [], categories: {} }, {})).toBeNull();
    expect(resolveSelection(options, { specialtyId: "139" })).toBeNull();
  });
});

describe("withSelected", () => {
  it("returns the options when they hold the selection", () => {
    expect(ids(withSelected(CATEGORIES.slice(0, 2), "1574", CATEGORIES))).toEqual(["1573", "1574"]);
    expect(ids(withSelected(CATEGORIES.slice(0, 2), undefined, CATEGORIES))).toEqual([
      "1573",
      "1574",
    ]);
  });

  it("appends a selection without results", () => {
    expect(withSelected(CATEGORIES.slice(0, 2), "1576", CATEGORIES).at(-1)).toEqual({
      id: "1576",
      name: "Sénior",
    });
  });

  it("names an unknown selection by its id", () => {
    expect(withSelected([], "42", CATEGORIES)).toEqual([{ id: "42", name: "42" }]);
    expect(withSelected([], "42", undefined)).toEqual([{ id: "42", name: "42" }]);
  });
});
