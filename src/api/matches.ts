import type { Result } from "@/types/competition";
import { graphqlRequest } from "./client";

const RESULT_SUMMARY_FIELDS = `
  id
  category
  dateMatch
  phase
  scoreA
  scoreB
  clubA { id name }
  clubB { id name }
  specialty { id name }
  competition { id name year level }
  clubALineup {
    player1 { name }
    player2 { name }
  }
  clubBLineup {
    player1 { name }
    player2 { name }
  }
`;

const RESULT_DETAIL_FIELDS = `
  ${RESULT_SUMMARY_FIELDS}
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
    $category: String
    $phase: String
  ) {
    results(
      competitionId: $competitionId
      specialtyId: $specialtyId
      category: $category
      phase: $phase
    ) {
      ${RESULT_SUMMARY_FIELDS}
    }
  }
`;

const GET_RESULT = `
  query GetResult($id: ID!) {
    result(id: $id) {
      ${RESULT_DETAIL_FIELDS}
    }
  }
`;

interface ListResultsParams {
  competitionId?: string;
  specialtyId?: string;
  category?: string;
  phase?: string;
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
