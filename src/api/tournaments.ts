import type { Competition } from "@/types/competition";
import { graphqlRequest } from "./client";

const COMPETITION_FIELDS = `
  id
  year
  name
  level
`;

const LIST_COMPETITIONS = `
  query ListCompetitions($year: Int) {
    competitions(year: $year) {
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

export const tournamentsApi = {
  list: (params?: { year?: number }): Promise<Competition[]> =>
    graphqlRequest<{ competitions: Competition[] }, { year?: number }>(
      LIST_COMPETITIONS,
      params?.year !== undefined ? { year: params.year } : undefined,
    ).then((d) => d.competitions),

  get: (id: string): Promise<Competition> =>
    graphqlRequest<{ competition: Competition }, { id: string }>(GET_COMPETITION, { id }).then(
      (d) => d.competition,
    ),
};
