import { matchesApi } from "@/api/matches";
import { useQuery } from "@tanstack/react-query";

interface ResultListParams {
  competitionId?: string;
  specialtyId?: string;
  category?: string;
  phase?: string;
}

export const matchKeys = {
  all: ["results"] as const,
  list: (params?: ResultListParams) => [...matchKeys.all, "list", params] as const,
  detail: (id: string) => [...matchKeys.all, "detail", id] as const,
};

export function useMatches(params?: ResultListParams) {
  return useQuery({
    queryKey: matchKeys.list(params),
    queryFn: () => matchesApi.list(params),
  });
}

export function useMatch(id: string) {
  return useQuery({
    queryKey: matchKeys.detail(id),
    queryFn: () => matchesApi.get(id),
    enabled: !!id,
  });
}
