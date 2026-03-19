import { tournamentsApi } from "@/api/tournaments";
import { useQuery } from "@tanstack/react-query";

export const tournamentKeys = {
  all: ["competitions"] as const,
  list: () => [...tournamentKeys.all, "list"] as const,
  detail: (id: string) => [...tournamentKeys.all, "detail", id] as const,
};

export function useTournaments() {
  return useQuery({
    queryKey: tournamentKeys.list(),
    queryFn: () => tournamentsApi.list(),
  });
}

export function useTournament(id: string) {
  return useQuery({
    queryKey: tournamentKeys.detail(id),
    queryFn: () => tournamentsApi.get(id),
    enabled: !!id,
  });
}
