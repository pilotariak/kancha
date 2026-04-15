import type { Competition } from "@/types/competition";
import { graphqlRequest } from "./client";

const COMPETITION_FIELDS = `
  id
  name
`;

const LIST_COMPETITIONS = `
  query ListCompetitions {
    competitions {
      ${COMPETITION_FIELDS}
    }
  }
`;

const GET_COMPETITION = `
  query GetCompetition($id: ID!) {
    competition(id: $id) {
      ${COMPETITION_FIELDS}
    }
  }
`;

export const competitionsApi = {
  list: (): Promise<Competition[]> =>
    graphqlRequest<{ competitions: Competition[] }>(LIST_COMPETITIONS).then(
      (d) => d.competitions,
    ),

  get: (id: string): Promise<Competition> =>
    graphqlRequest<{ competition: Competition }, { id: string }>(GET_COMPETITION, { id }).then(
      (d) => d.competition,
    ),
};
