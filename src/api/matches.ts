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
    $phase: String
    $limit: Int
  ) {
    results(
      competitionId: $competitionId
      specialtyId: $specialtyId
      categoryId: $categoryId
      phase: $phase
      limit: $limit
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
  phase?: string;
  /** Frontis returns 100 results unless told otherwise, and 500 at most. */
  limit?: number;
}

export const matchesApi = {
  list: (params?: ListResultsParams): Promise<Result[]> =>
    graphqlRequest<{ results: Result[] }, ListResultsParams>(
      LIST_RESULTS,
      params,
    ).then((d) => d.results),

  get: (id: string): Promise<Result> =>
    graphqlRequest<{ result: Result }, { id: string }>(GET_RESULT, { id }).then(
      (d) => d.result,
    ),
};
