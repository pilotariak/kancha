import { tournamentsApi } from "@/api/tournaments";
import type { TournamentStatus } from "@/types/tournament";
import { useQuery } from "@tanstack/react-query";

export const tournamentKeys = {
  all: ["tournaments"] as const,
  list: (params?: { status?: TournamentStatus }) =>
    [...tournamentKeys.all, "list", params] as const,
  detail: (id: string) => [...tournamentKeys.all, "detail", id] as const,
};

export function useTournaments(params?: { status?: TournamentStatus }) {
  return useQuery({
    queryKey: tournamentKeys.list(params),
    queryFn: () => tournamentsApi.list(params),
  });
}

export function useTournament(id: string) {
  return useQuery({
    queryKey: tournamentKeys.detail(id),
    queryFn: () => tournamentsApi.get(id),
    enabled: !!id,
  });
}
