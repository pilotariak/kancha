import type { Category, Specialty, SpecialtyCategory } from "@/types/competition";

export interface FilterOptions {
  /** Specialties with results, in API order. */
  specialties: Specialty[];
  /** Categories with results, by specialty id: series first, then the others, each in API order. */
  categories: Record<string, Category[]>;
}

const isSeries = (category: Category) => /série/i.test(category.name);

const pairKey = ({ specialtyId, categoryId }: SpecialtyCategory) => `${specialtyId}/${categoryId}`;

/**
 * Keeps the specialties and categories that hold results in the competition.
 * Frontis lists every specialty and category of the league, most of them empty
 * for a given competition.
 */
export function buildFilterOptions(
  pairs: readonly SpecialtyCategory[],
  specialties: readonly Specialty[],
  categories: readonly Category[],
): FilterOptions {
  const withResults = new Set(pairs.map(pairKey));
  const ordered = [...categories.filter(isSeries), ...categories.filter((c) => !isSeries(c))];
  const options: FilterOptions = { specialties: [], categories: {} };
  for (const specialty of specialties) {
    const available = ordered.filter((c) =>
      withResults.has(pairKey({ specialtyId: specialty.id, categoryId: c.id }))
    );
    if (available.length > 0) {
      options.specialties.push(specialty);
      options.categories[specialty.id] = available;
    }
  }
  return options;
}

/**
 * The pair to show: the params given win, even without results (a deep link
 * then shows the empty state). A missing specialty comes from the last pair
 * viewed when it still has results, otherwise the first specialty. A missing
 * category is the last one viewed when the specialty has it, otherwise its
 * first. Null when the competition has no results to pick from.
 */
export function resolveSelection(
  options: FilterOptions,
  requested: Partial<SpecialtyCategory>,
  last?: SpecialtyCategory | null,
): SpecialtyCategory | null {
  const lastSpecialty = last && options.categories[last.specialtyId] ? last.specialtyId : undefined;
  const specialtyId = requested.specialtyId || lastSpecialty || options.specialties[0]?.id;
  if (!specialtyId) return null;
  if (requested.categoryId) return { specialtyId, categoryId: requested.categoryId };

  const available = options.categories[specialtyId] ?? [];
  const categoryId = available.find((c) => c.id === last?.categoryId)?.id ?? available[0]?.id;
  return categoryId ? { specialtyId, categoryId } : null;
}

/**
 * Appends the selected item when the options lack it, so a pair without
 * results still names its specialty and category. Falls back to the id when
 * the item is unknown.
 */
export function withSelected<T extends { id: string; name: string }>(
  options: readonly T[],
  selectedId: string | undefined,
  all: readonly T[] | undefined,
): { id: string; name: string }[] {
  if (!selectedId || options.some((o) => o.id === selectedId)) return [...options];
  const selected = all?.find((o) => o.id === selectedId) ?? { id: selectedId, name: selectedId };
  return [...options, selected];
}
