import { useQuery } from "@tanstack/react-query";

import { matchesApi } from "@/api/matches";

/**
 * Every result of one specialty and category. Asks for the 500 Frontis allows:
 * the largest pair holds 473 results (ctpb, 2025/2026), the default 100 would
 * cut it short.
 */
export function useResultsByCompetition(
  competitionId: string,
  specialtyId?: string,
  categoryId?: string,
) {
  return useQuery({
    queryKey: ["results", { competitionId, specialtyId, categoryId }],
    queryFn: () => matchesApi.list({ competitionId, specialtyId, categoryId, limit: 500 }),
    enabled: !!competitionId && !!specialtyId && !!categoryId,
  });
}
