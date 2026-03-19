import { tournamentsApi } from "@/api/tournaments";
import { useQuery } from "@tanstack/react-query";

export const tournamentKeys = {
  all: ["competitions"] as const,
  list: (params?: { year?: number }) => [...tournamentKeys.all, "list", params] as const,
  detail: (id: string) => [...tournamentKeys.all, "detail", id] as const,
};

export function useTournaments(params?: { year?: number }) {
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
