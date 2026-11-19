import type { PlayerRanking, TeamRanking } from "@/types/competition";
import { graphqlRequest } from "./client";

// Frontis clamps `limit` to 1..500. One page of 500 covers a player's whole
// history, and keeps a common surname from dropping players (the default is 100).
const PLAYER_RANKINGS_BY_LICENCE = `
  query PlayerRankingsByLicence($licence: String!) {
    playerRankings(licence: $licence, limit: 500) {
      id
      rank
      phase
      final
      teamNumber
      competition { id name }
      specialty { id name }
      category { id name }
      club { id name }
      players { licence name }
    }
  }
`;

const PLAYER_RANKINGS_BY_NAME = `
  query PlayerRankingsByName($name: String!) {
    playerRankings(name: $name, limit: 500) {
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

export const playersApi = {
  /** Every ranking of one player, most recent season first. */
  rankingsByLicence: (licence: string): Promise<PlayerRanking[]> =>
    graphqlRequest<{ playerRankings: PlayerRanking[] }, { licence: string }>(
      PLAYER_RANKINGS_BY_LICENCE,
      { licence },
    ).then((d) => d.playerRankings),

  /**
   * Team rankings with a player whose name matches, most recent season first.
   * The team's other players don't have to match.
   */
  rankingsByName: (name: string): Promise<TeamRanking[]> =>
    graphqlRequest<{ playerRankings: TeamRanking[] }, { name: string }>(
      PLAYER_RANKINGS_BY_NAME,
      { name },
    ).then((d) => d.playerRankings),
};
