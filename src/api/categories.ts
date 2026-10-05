import { graphqlRequest } from "./client";

const LIST_CATEGORIES = `
  query ListCategories {
    categories {
      id
      name
      enabled
    }
  }
`;

export interface Category {
  id: string;
  name: string;
  enabled?: boolean;
}

export const categoriesApi = {
  list: (): Promise<Category[]> =>
    graphqlRequest<{ categories: Category[] }>(LIST_CATEGORIES).then(
      (d) => d.categories.filter((c) => c.enabled !== false),
    ),
};
