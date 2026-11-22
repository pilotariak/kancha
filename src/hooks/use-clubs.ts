import { useQuery } from "@tanstack/react-query";

import { clubsApi } from "@/api/clubs";

export function useClub(id: string) {
  return useQuery({
    queryKey: ["clubs", id],
    queryFn: () => clubsApi.get(id),
    enabled: !!id,
  });
}
