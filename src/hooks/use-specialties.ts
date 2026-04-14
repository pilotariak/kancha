import { useQuery } from "@tanstack/react-query";

import { specialtiesApi } from "@/api/specialties";

export function useSpecialties() {
  return useQuery({
    queryKey: ["specialties"],
    queryFn: specialtiesApi.list,
  });
}
