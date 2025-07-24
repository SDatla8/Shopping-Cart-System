import { useQuery } from "@tanstack/react-query";
import { Product, ProductFilter } from "@shared/schema";

export function useProducts(filters?: ProductFilter) {
  const queryParams = new URLSearchParams();
  
  if (filters?.stores?.length) {
    filters.stores.forEach(store => queryParams.append('stores', store));
  }
  if (filters?.categories?.length) {
    filters.categories.forEach(category => queryParams.append('categories', category));
  }
  if (filters?.minPrice) {
    queryParams.append('minPrice', filters.minPrice.toString());
  }
  if (filters?.maxPrice) {
    queryParams.append('maxPrice', filters.maxPrice.toString());
  }
  if (filters?.minRating) {
    queryParams.append('minRating', filters.minRating.toString());
  }
  if (filters?.sortBy) {
    queryParams.append('sortBy', filters.sortBy);
  }

  const queryString = queryParams.toString();
  const url = queryString ? `/api/products?${queryString}` : '/api/products';

  return useQuery<Product[]>({
    queryKey: ["/api/products", filters],
    queryFn: async () => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    },
  });
}
