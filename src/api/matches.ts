import type { Result } from "@/types/competition";
import { graphqlRequest } from "./client";

// A lineup player's `number` is the licence, at times followed by a second code
// ("097866 - 01-641-015"): the ranking matches teams to their matches by it.
const RESULT_FIELDS = `
  id
  category { id name }
  dateMatch
  phase
  scores
  clubA { id name }
  clubB { id name }
  specialty { id name }
  competition { id name }
  clubALineup {
    player1 { name number }
    player2 { name number }
  }
  clubBLineup {
    player1 { name number }
    player2 { name number }
  }
`;

const LIST_RESULTS = `
  query ListResults(
    $competitionId: ID
    $specialtyId: ID
    $categoryId: ID
    $clubId: ID
    $phase: String
    $limit: Int
    $offset: Int
  ) {
    results(
      competitionId: $competitionId
      specialtyId: $specialtyId
      categoryId: $categoryId
      clubId: $clubId
      phase: $phase
      limit: $limit
      offset: $offset
    ) {
      ${RESULT_FIELDS}
    }
  }
`;

const GET_RESULT = `
  query GetResult($id: ID!) {
    result(id: $id) {
      ${RESULT_FIELDS}
    }
  }
`;

interface ListResultsParams {
  competitionId?: string;
  specialtyId?: string;
  categoryId?: string;
  /** The matches either side of which is a team of this club. */
  clubId?: string;
  phase?: string;
  /** Frontis returns 100 results unless told otherwise, and 500 at most. */
  limit?: number;
  /** The results to skip, to read past `limit`. */
  offset?: number;
}

/** The most results Frontis returns in one request. */
export const RESULTS_PAGE_SIZE = 500;

export const matchesApi = {
  list: (params?: ListResultsParams): Promise<Result[]> =>
    graphqlRequest<{ results: Result[] }, ListResultsParams>(
      LIST_RESULTS,
      params,
    ).then((d) => d.results),

  /** Every result that matches, a page of 500 at a time until a page comes back short. */
  listAll: async (params: Omit<ListResultsParams, "limit" | "offset">): Promise<Result[]> => {
    const all: Result[] = [];
    for (let offset = 0;; offset += RESULTS_PAGE_SIZE) {
      const page = await matchesApi.list({ ...params, limit: RESULTS_PAGE_SIZE, offset });
      all.push(...page);
      if (page.length < RESULTS_PAGE_SIZE) return all;
    }
  },

  get: (id: string): Promise<Result> =>
    graphqlRequest<{ result: Result }, { id: string }>(GET_RESULT, { id }).then(
      (d) => d.result,
    ),
};
