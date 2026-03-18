import type { Club } from "@/types/competition";
import { graphqlRequest } from "./client";

const LIST_CLUBS = `
  query ListClubs {
    clubs {
      id
      name
    }
  }
`;

const GET_CLUB = `
  query GetClub($id: ID!) {
    club(id: $id) {
      id
      name
    }
  }
`;

export const clubsApi = {
  list: (): Promise<Club[]> => graphqlRequest<{ clubs: Club[] }>(LIST_CLUBS).then((d) => d.clubs),

  get: (id: string): Promise<Club> =>
    graphqlRequest<{ club: Club }, { id: string }>(GET_CLUB, { id }).then((d) => d.club),
};
