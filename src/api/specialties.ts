import type { Specialty } from "@/types/competition";
import { graphqlRequest } from "./client";

const LIST_SPECIALTIES = `
  query ListSpecialties {
    specialties {
      id
      name
    }
  }
`;

export const specialtiesApi = {
  list: (): Promise<Specialty[]> =>
    graphqlRequest<{ specialties: Specialty[] }>(LIST_SPECIALTIES).then((d) => d.specialties),
};
