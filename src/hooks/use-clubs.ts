import { clubsApi } from "@/api/clubs";
import { useQuery } from "@tanstack/react-query";

export const clubKeys = {
  all: ["clubs"] as const,
  list: () => [...clubKeys.all, "list"] as const,
  detail: (id: string) => [...clubKeys.all, "detail", id] as const,
};

export function useClubs() {
  return useQuery({
    queryKey: clubKeys.list(),
    queryFn: () => clubsApi.list(),
  });
}

export function useClub(id: string) {
  return useQuery({
    queryKey: clubKeys.detail(id),
    queryFn: () => clubsApi.get(id),
    enabled: !!id,
  });
}
