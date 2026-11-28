import type { Competition, SpecialtyCategory } from "@/types/competition";
import { graphqlRequest } from "./client";

const COMPETITION_FIELDS = `
  id
  name
  enabled
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

// Frontis has no list of the specialties and categories played in a competition,
// so read them from its results: about 600 rows on lcapb, 6,000 on ctpb.
const LIST_RESULT_FILTERS = `
  query ListResultFilters($id: ID!) {
    competition(id: $id) {
      results {
        specialty { id }
        category { id }
      }
    }
  }
`;

interface ResultFiltersData {
  competition: {
    results: { specialty: { id: string }; category: { id: string } | null }[];
  } | null;
}

export const competitionsApi = {
  list: (): Promise<Competition[]> =>
    graphqlRequest<{ competitions: Competition[] }>(LIST_COMPETITIONS).then(
      (d) => d.competitions.filter((c) => c.enabled !== false),
    ),

  get: (id: string): Promise<Competition> =>
    graphqlRequest<{ competition: Competition }, { id: string }>(GET_COMPETITION, { id }).then(
      (d) => d.competition,
    ),

  /** The specialty and category pairs that hold results, once each. */
  resultFilters: (id: string): Promise<SpecialtyCategory[]> =>
    graphqlRequest<ResultFiltersData, { id: string }>(LIST_RESULT_FILTERS, { id }).then((d) => {
      const pairs = new Map<string, SpecialtyCategory>();
      for (const { specialty, category } of d.competition?.results ?? []) {
        // A result without a category cannot be picked from the category select.
        if (!category) continue;
        pairs.set(`${specialty.id}/${category.id}`, {
          specialtyId: specialty.id,
          categoryId: category.id,
        });
      }
      return [...pairs.values()];
    }),
};
