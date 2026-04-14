import { graphqlRequest } from "./client";

const LIST_CATEGORIES = `
  query ListCategories {
    categories {
      id
      name
    }
  }
`;

export interface Category {
  id: string;
  name: string;
}

export const categoriesApi = {
  list: (): Promise<Category[]> =>
    graphqlRequest<{ categories: Category[] }>(LIST_CATEGORIES).then((d) => d.categories),
};
