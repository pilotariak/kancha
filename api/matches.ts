import type { Match, MatchStatus } from "@/types/match";
import { apiClient } from "./client";

interface ListParams {
  tournamentId?: string;
  status?: MatchStatus;
  modality?: string;
}

export const matchesApi = {
  list: (params?: ListParams): Promise<Match[]> => {
    const search = new URLSearchParams();
    if (params?.tournamentId) search.set("tournamentId", params.tournamentId);
    if (params?.status) search.set("status", params.status);
    if (params?.modality) search.set("modality", params.modality);
    const query = search.toString();
    return apiClient.get(`/matches${query ? `?${query}` : ""}`);
  },
  get: (id: string): Promise<Match> => apiClient.get(`/matches/${id}`),
};
