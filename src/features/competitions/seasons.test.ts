import type { Competition } from "@/types/competition";

import {
  formatSeason,
  groupBySeason,
  keepSeasonTogether,
  parseSeason,
  seasonTileName,
  splitPreviousSeasons,
  toSeasonBlocks,
  VISIBLE_PREVIOUS_SEASONS,
} from "./seasons";

// Names come from Frontis (competitions query, 2026-11-20). Enabled lcapb competitions
// hold one per season; its Jeunes and Corpo championships, disabled today, share a season.
const competition = (id: string, name: string): Competition => ({ id, name, enabled: true });

const ids = (items: { competition: Competition }[]) => items.map((i) => i.competition.id);

describe("parseSeason", () => {
  it.each([
    ["Championnat CCAPB 2025-2026", 2025, "Championnat CCAPB"],
    ["Championnat 2018-2019 CCAPB", 2018, "Championnat CCAPB"],
    ["LCAPB 2013-2014 Championnat Hiver", 2013, "LCAPB Championnat Hiver"],
    ["Championnat d'Hiver 2025/2026", 2025, "Championnat d'Hiver"],
    ["Compétition 2021-2022(Ext)", 2021, "Compétition (Ext)"],
    ["Tournois Divers et  Mintegiak Hiver 2024-2025", 2024, "Tournois Divers et Mintegiak Hiver"],
  ])("reads the season of %p", (name, start, label) => {
    expect(parseSeason(name)).toEqual({ season: { start, end: start + 1 }, label });
  });

  it.each([
    "Tournois Divers et Mintegiak",
    "Championnat été 2025",
    "Championnat Hiver 2016",
    "Tournoi 2020-2022",
    "Ref 120250-2026",
  ])("finds no season in %p", (name) => {
    expect(parseSeason(name)).toBeNull();
  });

  it("keeps the whole name when nothing but the season is left", () => {
    expect(parseSeason("2025-2026")).toEqual({
      season: { start: 2025, end: 2026 },
      label: "2025-2026",
    });
  });
});

describe("formatSeason", () => {
  it("joins the two years with a hyphen", () => {
    expect(formatSeason({ start: 2025, end: 2026 })).toBe("2025-2026");
  });
});

describe("keepSeasonTogether", () => {
  it("puts a word joiner on each side of the separator", () => {
    expect(keepSeasonTogether("Compétition 2025-2026")).toBe("Compétition 2025\u2060-\u20602026");
    expect(keepSeasonTogether("Championnat d'Hiver 2025/2026"))
      .toBe("Championnat d'Hiver 2025\u2060/\u20602026");
  });

  it("leaves names without a season as they are", () => {
    expect(keepSeasonTogether("Championnat été 2025")).toBe("Championnat été 2025");
  });
});

describe("groupBySeason", () => {
  it("features the most recent season, whatever the API order", () => {
    // lidfpb lists "Compétition 2026-2027" last.
    const grouped = groupBySeason([
      competition("1", "Compétition 2025-2026"),
      competition("2", "Compétition 2024-2025"),
      competition("13", "Championnat 2017-2018"),
      competition("31", "Compétition 2026-2027"),
    ]);
    expect(grouped?.current.season).toEqual({ start: 2026, end: 2027 });
    expect(ids(grouped!.current.competitions)).toEqual(["31"]);
    expect(grouped?.previous.map((g) => g.season.start)).toEqual([2025, 2024, 2017]);
  });

  it("groups the competitions of a season, ordered by label", () => {
    const grouped = groupBySeason([
      competition("501", "Championnat Jeunes CCAPB 2025-2026"),
      competition("502", "Championnat CCAPB 2025-2026"),
      competition("503", "Championnat Corpo CCAPB 2025-2026"),
      competition("504", "Championnat Jeunes 2024-2025"),
      competition("505", "Championnat Corpo CCAPB 2024-2025"),
      competition("506", "Championnat CCAPB 2024-2025"),
    ]);
    expect(ids(grouped!.current.competitions)).toEqual(["502", "503", "501"]);
    expect(grouped!.current.competitions.map((c) => c.label)).toEqual([
      "Championnat CCAPB",
      "Championnat Corpo CCAPB",
      "Championnat Jeunes CCAPB",
    ]);
    expect(grouped!.previous).toHaveLength(1);
    expect(ids(grouped!.previous[0].competitions)).toEqual(["506", "505", "504"]);
  });

  it("keeps the API order of competitions with the same label", () => {
    const grouped = groupBySeason([
      competition("7", "Compétition 2021-2022"),
      competition("6", "Compétition 2021-2022"),
    ]);
    expect(ids(grouped!.current.competitions)).toEqual(["7", "6"]);
  });

  it("puts names without a season aside, in API order", () => {
    // ctpb: a season, a single year and no year at all.
    const grouped = groupBySeason([
      competition("134", "Tournois Divers et Mintegiak"),
      competition("137", "Championnat d'Hiver 2025/2026"),
      competition("136", "Championnat été 2026"),
    ]);
    expect(ids(grouped!.current.competitions)).toEqual(["137"]);
    expect(grouped!.previous).toEqual([]);
    expect(grouped!.others.map((c) => c.id)).toEqual(["134", "136"]);
  });

  it("returns null when no name holds a season", () => {
    expect(groupBySeason([competition("1", "Tournois Divers et Mintegiak")])).toBeNull();
    expect(groupBySeason([])).toBeNull();
  });
});

describe("toSeasonBlocks", () => {
  it("shares a grid between one-competition seasons and heads a season with several", () => {
    const grouped = groupBySeason([
      competition("500", "Championnat CCAPB 2026-2027"),
      competition("502", "Championnat CCAPB 2025-2026"),
      competition("506", "Championnat CCAPB 2024-2025"),
      competition("507", "Championnat CCAPB 2023-2024"),
      competition("508", "Championnat Jeunes CCAPB 2023-2024"),
      competition("510", "Championnat CCAPB 2022-2023"),
    ])!;
    const blocks = toSeasonBlocks(grouped.previous);
    expect(blocks.map((b) => b.kind)).toEqual(["seasons", "season", "seasons"]);
    expect(blocks[0].kind === "seasons" && blocks[0].groups.map((g) => g.season.start))
      .toEqual([2025, 2024]);
    expect(blocks[1].kind === "season" && ids(blocks[1].group.competitions))
      .toEqual(["507", "508"]);
  });

  it("returns no block without previous seasons", () => {
    expect(toSeasonBlocks([])).toEqual([]);
  });
});

describe("seasonTileName", () => {
  // Enabled competitions, Frontis 2026-11-22.
  const tileNames = (names: [string, string][]) => {
    const grouped = groupBySeason(names.map(([id, name]) => competition(id, name)))!;
    return grouped.previous.map(({ competitions: [{ label }] }) =>
      seasonTileName(label, grouped.current)
    );
  };

  it("shows the years only when the name is the featured competition's", () => {
    // lcapb: the season moves inside the name from 2018-2019 down.
    expect(tileNames([
      ["500", "Championnat CCAPB 2026-2027"],
      ["502", "Championnat CCAPB 2025-2026"],
      ["524", "Championnat 2018-2019 CCAPB"],
    ])).toEqual([undefined, undefined]);
  });

  it("keeps the names that differ", () => {
    // lidfpb: "Compétition 2026-2027" is disabled, so 2025-2026 is the current season.
    expect(tileNames([
      ["1", "Compétition 2025-2026"],
      ["2", "Compétition 2024-2025"],
      ["6", "Compétition 2021-2022(Ext)"],
      ["13", "Championnat 2017-2018"],
    ])).toEqual([undefined, "Compétition (Ext)", "Championnat"]);
    // lcapb, under "All seasons": its winter championships under the former league name.
    expect(tileNames([
      ["500", "Championnat CCAPB 2026-2027"],
      ["530", "Championnat Hiver 2015-2016 LCAPB"],
    ])).toEqual(["Championnat Hiver LCAPB"]);
  });

  it("compares with the featured competition only, in a season with several", () => {
    // ctpb, were its competitions enabled: "Championnat d'Hiver" sorts before "Tournoi PILOTARIAK".
    expect(tileNames([
      ["133", "Tournoi PILOTARIAK 2026/2027"],
      ["132", "Championnat d'Hiver 2026/2027"],
      ["141", "Championnat d'Hiver 2024/2025"],
      ["135", "Tournoi PILOTARIAK 2025/2026"],
    ])).toEqual(["Tournoi PILOTARIAK", undefined]);
  });
});

describe("splitPreviousSeasons", () => {
  const seasons = (count: number, perSeason = 1) =>
    groupBySeason(
      Array.from({ length: count + 1 }, (_, i) => 2026 - i).flatMap((start) =>
        Array.from(
          { length: perSeason },
          (_, n) => competition(`${start}-${n}`, `Championnat ${n} ${start}-${start + 1}`),
        )
      ),
    )!.previous;

  it("shows six seasons and hides the rest", () => {
    // lcapb: 13 seasons, from 2026-2027 down to 2014-2015.
    const { shown, hidden } = splitPreviousSeasons(seasons(12));
    expect(VISIBLE_PREVIOUS_SEASONS).toBe(6);
    expect(shown.map((g) => g.season.start)).toEqual([2025, 2024, 2023, 2022, 2021, 2020]);
    expect(hidden.map((g) => g.season.start)).toEqual([2019, 2018, 2017, 2016, 2015, 2014]);
  });

  it("counts seasons, not competitions", () => {
    const { shown, hidden } = splitPreviousSeasons(seasons(8, 3));
    expect(shown).toHaveLength(6);
    expect(shown.flatMap((g) => g.competitions)).toHaveLength(18);
    expect(hidden).toHaveLength(2);
  });

  it("hides nothing with six seasons or fewer", () => {
    expect(splitPreviousSeasons(seasons(6)).hidden).toEqual([]);
    expect(splitPreviousSeasons([]).shown).toEqual([]);
  });
});
