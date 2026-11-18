import type { TeamRanking } from "@/types/competition";
import { graphqlRequest } from "./client";

const LIST_RANKINGS = `
  query ListRankings($competitionId: ID!, $specialtyId: ID!, $categoryId: ID!) {
    rankings(competitionId: $competitionId, specialtyId: $specialtyId, categoryId: $categoryId) {
      id
      rank
      phase
      final
      teamNumber
      club { id name }
      players { licence name }
    }
  }
`;

interface ListRankingsParams {
  competitionId: string;
  specialtyId: string;
  categoryId: string;
}

export const rankingsApi = {
  list: (params: ListRankingsParams): Promise<TeamRanking[]> =>
    graphqlRequest<{ rankings: TeamRanking[] }, ListRankingsParams>(LIST_RANKINGS, params).then(
      (d) => d.rankings,
    ),
};
