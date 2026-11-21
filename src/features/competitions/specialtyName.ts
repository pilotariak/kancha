export type CourtKey = "placeLibre" | "murAGauche" | "trinquet";

/** P.G. Pleine and P.G. Creuse are two disciplines played with one implement, the paleta gomme. */
export type DisciplineKey =
  | "mainNue"
  | "pgPleine"
  | "pgCreuse"
  | "xare"
  | "pasaka"
  | "jokoGarbi"
  | "grandChistera"
  | "cestaPunta";

/**
 * A specialty name split as Frontis writes it: "Mur à Gauche / P.G. Creuse Masculin Individuel".
 * Every part keeps Frontis's spelling, as they are proper names.
 */
export interface SpecialtyName {
  /** "Mur à Gauche". */
  court: string;
  /** Undefined for a court Kancha does not know: it then shows without a pictogram. */
  courtKey?: CourtKey;
  /** Everything after the court: "P.G. Creuse Masculin Individuel". */
  label: string;
  /** The start of `label`: "P.G. Creuse". */
  discipline: string;
  disciplineKey: DisciplineKey;
  /** The rest of `label`, may be empty: "Masculin Individuel", "- Groupe B". */
  rest: string;
}

const SEPARATOR = " / ";

// Each spelling seen in Frontis: "P.G. Pleine", "P.G Pleine", "PG Pleine"; "Main nue", "Main
// Nue"; "Chistera Joko Garbi", "Joko Garbi". A discipline ends at a space or at the end.
const DISCIPLINES: readonly [DisciplineKey, RegExp][] = [
  ["mainNue", /^main\s+nue(?=\s|$)/i],
  ["pgPleine", /^p\.?g\.?\s+pleine(?=\s|$)/i],
  ["pgCreuse", /^p\.?g\.?\s+creuse(?=\s|$)/i],
  ["xare", /^xare(?=\s|$)/i],
  ["pasaka", /^pasaka(?=\s|$)/i],
  ["jokoGarbi", /^(?:chistera\s+)?joko\s+garbi(?=\s|$)/i],
  ["grandChistera", /^grand\s+chistera(?=\s|$)/i],
  ["cestaPunta", /^cesta\s+punta(?=\s|$)/i],
];

const COURTS: Record<string, CourtKey> = {
  "place libre": "placeLibre",
  "mur a gauche": "murAGauche",
  trinquet: "trinquet",
};

const courtKeyOf = (court: string): CourtKey | undefined =>
  COURTS[
    court.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ")
  ];

/**
 * Splits a specialty name at its first " / ". Null when there is no " / " or the discipline is
 * unknown: the name then shows whole, as it did before the split.
 */
export function splitSpecialtyName(name: string): SpecialtyName | null {
  const at = name.indexOf(SEPARATOR);
  if (at <= 0) return null;
  const court = name.slice(0, at);
  const label = name.slice(at + SEPARATOR.length);
  for (const [disciplineKey, pattern] of DISCIPLINES) {
    const match = label.match(pattern);
    if (match) {
      const discipline = match[0];
      return {
        court,
        courtKey: courtKeyOf(court),
        label,
        discipline,
        disciplineKey,
        rest: label.slice(discipline.length).trim(),
      };
    }
  }
  return null;
}
