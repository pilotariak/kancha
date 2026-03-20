import { useQuery } from "@tanstack/react-query";

import { competitionsApi } from "@/api/competitions";

export function useCompetitions() {
  return useQuery({
    queryKey: ["competitions"],
    queryFn: () => competitionsApi.list(),
  });
}

export function useCompetition(id: string) {
  return useQuery({
    queryKey: ["competitions", id],
    queryFn: () => competitionsApi.get(id),
    enabled: !!id,
  });
}
