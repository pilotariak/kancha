import { specialtiesApi } from "@/api/specialties";
import { useQuery } from "@tanstack/react-query";

export const specialtyKeys = {
  all: ["specialties"] as const,
  list: () => [...specialtyKeys.all, "list"] as const,
};

export function useSpecialties() {
  return useQuery({
    queryKey: specialtyKeys.list(),
    queryFn: () => specialtiesApi.list(),
    staleTime: Infinity, // specialties rarely change
  });
}
