import type { Match, MatchStatus } from "@/types/match";
import { apiClient } from "./client";

interface ListParams {
  tournamentId?: string;
  status?: MatchStatus;
  modality?: string;
  competitionId?: string;
  specialty?: string;
  category?: string;
  phase?: string;
  ville?: string;
  club?: string;
}

export const matchesApi = {
  list: (params?: ListParams): Promise<Match[]> => {
    const search = new URLSearchParams();
    if (params?.tournamentId) search.set("tournamentId", params.tournamentId);
    if (params?.status) search.set("status", params.status);
    if (params?.modality) search.set("modality", params.modality);
    if (params?.competitionId) search.set("competitionId", params.competitionId);
    if (params?.specialty) search.set("specialty", params.specialty);
    if (params?.category) search.set("category", params.category);
    if (params?.phase) search.set("phase", params.phase);
    if (params?.ville) search.set("ville", params.ville);
    if (params?.club) search.set("club", params.club);
    const query = search.toString();
    return apiClient.get(`/matches${query ? `?${query}` : ""}`);
  },
  get: (id: string): Promise<Match> => apiClient.get(`/matches/${id}`),
};
