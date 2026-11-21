import type { ComponentType } from "react";

import type { CourtKey, DisciplineKey } from "@/features/competitions/specialtyName";

import { CestaPunta } from "./CestaPunta";
import { GrandChistera } from "./GrandChistera";
import { JokoGarbi } from "./JokoGarbi";
import { MainNue } from "./MainNue";
import { MurAGauche } from "./MurAGauche";
import { PaletaGomme } from "./PaletaGomme";
import { Pasaka } from "./Pasaka";
import type { PictogramProps } from "./Pictogram";
import { PlaceLibre } from "./PlaceLibre";
import { Trinquet } from "./Trinquet";
import { Xare } from "./Xare";

export type { PictogramProps } from "./Pictogram";

/**
 * The pictogram of each discipline and court, one component per drawing. Screens look them up
 * here, so a drawing can be replaced, by an illustrator's set for instance, without touching them.
 */
export const PICTOGRAMS: Record<DisciplineKey | CourtKey, ComponentType<PictogramProps>> = {
  mainNue: MainNue,
  pgPleine: PaletaGomme,
  pgCreuse: PaletaGomme,
  xare: Xare,
  pasaka: Pasaka,
  jokoGarbi: JokoGarbi,
  grandChistera: GrandChistera,
  cestaPunta: CestaPunta,
  placeLibre: PlaceLibre,
  murAGauche: MurAGauche,
  trinquet: Trinquet,
};
