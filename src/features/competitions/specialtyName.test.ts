import { type CourtKey, type DisciplineKey, splitSpecialtyName } from "./specialtyName";

type Fixture = [id: string, marked: string, disciplineKey: DisciplineKey];

// Every specialty of Frontis on 2026-11-21: `{ specialties { id name } }` with each league code in
// X-Pilotariak-League (ccapb is served under lcapb). Ids repeat across leagues. The brackets mark
// the discipline; the name is the text without them.
const SPECIALTIES: Record<string, Fixture[]> = {
  lcapb: [
    ["136", "Mur à Gauche / [P.G. Creuse] Masculin Individuel", "pgCreuse"],
    ["137", "Mur à Gauche / [P.G. Pleine] Feminine", "pgPleine"],
    ["138", "Mur à Gauche / [P.G. Pleine] Masculin", "pgPleine"],
    ["139", "Place Libre / [Grand Chistera]", "grandChistera"],
    ["140", "Place Libre / [P.G Pleine] Feminine", "pgPleine"],
    ["141", "Place Libre / [P.G. Pleine] Masculin", "pgPleine"],
    ["142", "Trinquet / [P.G. Creuse] Feminine", "pgCreuse"],
    ["143", "Trinquet / [P.G. Creuse] Masculin", "pgCreuse"],
    ["144", "Trinquet / [P.G. Creuse] Masculin Brassage Jeunes", "pgCreuse"],
    ["145", "Trinquet / [P.G. Pleine] Feminine", "pgPleine"],
    ["146", "Trinquet / [P.G. Pleine] Masculin", "pgPleine"],
  ],
  ctpb: [
    ["111", "Mur à Gauche / [Cesta Punta]", "cestaPunta"],
    ["112", "Mur à Gauche / [Cesta Punta] - Groupe B", "cestaPunta"],
    ["113", "Mur à Gauche / [Chistera Joko Garbi]", "jokoGarbi"],
    ["114", "Mur à Gauche / [Main nue] Tête à Tête - Groupe A", "mainNue"],
    ["115", "Mur à Gauche / [Main nue] Tête à Tête - Groupe B", "mainNue"],
    ["116", "Mur à Gauche / [Main nue] Tête à Tête - Groupe C", "mainNue"],
    ["117", "Trinquet / [Main Nue] - Groupe A", "mainNue"],
    ["118", "Trinquet / [Main Nue] - Groupe B", "mainNue"],
    ["119", "Trinquet / [Main Nue] - Groupe C", "mainNue"],
    ["120", "Trinquet / [Pasaka]", "pasaka"],
    ["121", "Trinquet / [PG Pleine] Féminine", "pgPleine"],
    ["122", "Trinquet / [PG Pleine] Féminine - Groupe B", "pgPleine"],
    ["123", "Trinquet / [P.G Pleine] Masculin", "pgPleine"],
    ["124", "Trinquet / [Xare]", "xare"],
    ["125", "Trinquet / [Xare] - Groupe B", "xare"],
    ["128", "Mur à Gauche / [Chistera Joko Garbi] - Groupe A", "jokoGarbi"],
    ["129", "Mur à Gauche / [Chistera Joko Garbi] - Rassemblements M12 Poussins", "jokoGarbi"],
    ["130", "Mur à Gauche / [Joko Garbi] - Groupe B", "jokoGarbi"],
    ["137", "Trinquet / [Main Nue] Tête à Tête", "mainNue"],
    ["138", "Trinquet / [Main Nue] Tête à tête - Groupe B", "mainNue"],
    ["140", "Trinquet / [P.G. Creuse] Féminine", "pgCreuse"],
    ["141", "Trinquet / [P.G Creuse] Masculin", "pgCreuse"],
  ],
  lidfpb: [
    ["1", "Place Libre / [Grand Chistera]", "grandChistera"],
    ["2", "Place Libre / [P.G Pleine] Masculin", "pgPleine"],
    ["3", "Trinquet / [P.G Creuse] Masculin", "pgCreuse"],
    ["4", "Trinquet / [P.G Pleine] Masculin", "pgPleine"],
    ["5", "Trinquet / [Xare]", "xare"],
  ],
};

const COURT_KEYS: Record<string, CourtKey> = {
  "Mur à Gauche": "murAGauche",
  "Place Libre": "placeLibre",
  Trinquet: "trinquet",
};

const ROWS = Object.entries(SPECIALTIES).flatMap(([league, fixtures]) =>
  fixtures.map(([id, marked, disciplineKey]) => {
    const [, court, discipline, rest] = /^(.+) \/ \[(.+)\] ?(.*)$/.exec(marked) ?? [];
    return {
      league,
      id,
      name: marked.replace(/[[\]]/g, ""),
      expected: {
        court,
        courtKey: COURT_KEYS[court],
        label: marked.slice(marked.indexOf(" / ") + 3).replace(/[[\]]/g, ""),
        discipline,
        disciplineKey,
        rest,
      },
    };
  })
);

describe("splitSpecialtyName", () => {
  it("covers the 38 specialties, 8 disciplines and 3 courts of lcapb, ctpb and lidfpb", () => {
    expect([SPECIALTIES.lcapb.length, SPECIALTIES.ctpb.length, SPECIALTIES.lidfpb.length])
      .toEqual([11, 22, 5]);
    expect(new Set(ROWS.map((row) => row.expected.disciplineKey)).size).toBe(8);
    expect(new Set(ROWS.map((row) => row.expected.courtKey)).size).toBe(3);
  });

  it.each(ROWS)("$league $id: $name", ({ name, expected }) => {
    expect(splitSpecialtyName(name)).toEqual(expected);
  });

  it.each(ROWS)("$league $id keeps every character of $name", ({ name }) => {
    const split = splitSpecialtyName(name);
    expect(`${split?.court} / ${split?.label}`).toBe(name);
    expect(split?.label.startsWith(split.discipline)).toBe(true);
    expect(split?.label.endsWith(split.rest)).toBe(true);
  });

  it("keeps an unknown court, without a key", () => {
    expect(splitSpecialtyName("Fronton / Main nue - Groupe A")).toEqual({
      court: "Fronton",
      courtKey: undefined,
      label: "Main nue - Groupe A",
      discipline: "Main nue",
      disciplineKey: "mainNue",
      rest: "- Groupe A",
    });
  });

  it("needs the whole discipline word", () => {
    expect(splitSpecialtyName("Trinquet / Xarea")).toBeNull();
    expect(splitSpecialtyName("Trinquet / PGPleine Masculin")).toBeNull();
  });

  it.each([
    ["no separator", "Place libre"],
    ["a bare id, as withSelected names an unknown specialty", "136"],
    ["an empty name", ""],
    ["a slash without spaces", "Trinquet/Xare"],
    ["an unknown discipline", "Trinquet / Fronton Masculin"],
    ["an empty court", " / Xare"],
    ["an empty discipline", "Trinquet / "],
  ])("leaves a name whole: %s", (_case, name) => {
    expect(splitSpecialtyName(name)).toBeNull();
  });
});
