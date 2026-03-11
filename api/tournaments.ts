import type { Tournament, TournamentStatus } from "@/types/tournament";
import { apiClient } from "./client";

interface ListParams {
  status?: TournamentStatus;
  modality?: string;
}

export const tournamentsApi = {
  list: (params?: ListParams): Promise<Tournament[]> => {
    const search = new URLSearchParams();
    if (params?.status) search.set("status", params.status);
    if (params?.modality) search.set("modality", params.modality);
    const query = search.toString();
    return apiClient.get(`/tournaments${query ? `?${query}` : ""}`);
  },
  get: (id: string): Promise<Tournament> => apiClient.get(`/tournaments/${id}`),
};
