import { Product } from '@/types/database';

/**
 * Extracts numeric price from a product.
 * Handles product.price as well as specifications keys (Price, MRP, Rate, Cost, etc.)
 */
export function extractProductPrice(product: Product): number | null {
  if (!product) return null;

  // 1. Direct price attribute if present
  if (typeof (product as any).price === 'number' && !isNaN((product as any).price)) {
    return (product as any).price;
  }
  if (typeof (product as any).price === 'string') {
    const cleanStr = (product as any).price.replace(/[^\d.]/g, '');
    const parsed = parseFloat(cleanStr);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }

  // 2. Specifications search
  if (product.specifications && typeof product.specifications === 'object') {
    for (const [key, val] of Object.entries(product.specifications)) {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes('price') ||
        lowerKey.includes('mrp') ||
        lowerKey.includes('rate') ||
        lowerKey.includes('cost') ||
        lowerKey.includes('₹') ||
        lowerKey.includes('inr')
      ) {
        if (typeof val === 'number' && !isNaN(val)) return val;
        if (typeof val === 'string') {
          const cleanStr = val.replace(/[^\d.]/g, '');
          const num = parseFloat(cleanStr);
          if (!isNaN(num) && num > 0) return num;
        }
      }
    }
  }

  return null;
}

/**
 * Computes min and max prices from a list of products.
 * If no products have prices, returns default fallback range.
 */
export function getProductPriceBounds(products: Product[]): { min: number; max: number; hasPrices: boolean } {
  const prices: number[] = [];

  for (const p of products) {
    const price = extractProductPrice(p);
    if (price !== null && !isNaN(price)) {
      prices.push(price);
    }
  }

  if (prices.length === 0) {
    return { min: 0, max: 10000, hasPrices: false };
  }

  let min = Math.min(...prices);
  let max = Math.max(...prices);

  // Round min down to nearest 50/100 and max up
  min = Math.floor(min / 100) * 100;
  max = Math.ceil(max / 100) * 100;

  if (min === max) {
    max = min + 1000;
  }

  return { min, max, hasPrices: true };
}

export interface FilterState {
  categories: string[]; // category slugs or IDs
  brands: string[];     // brand slugs or IDs
  minPrice?: number;
  maxPrice?: number;
  searchQuery?: string;
  sortBy?: string;
}

/**
 * Filters and sorts products based on category, brand, price range, and search query.
 */
export function filterAndSortProducts(
  products: Product[],
  filters: FilterState,
  priceBounds?: { min: number; max: number; hasPrices: boolean }
): Product[] {
  const { categories, brands, minPrice, maxPrice, searchQuery, sortBy } = filters;

  const filtered = products.filter((product) => {
    // 1. Category Filter (OR among selected categories)
    if (categories && categories.length > 0) {
      const matchCategory =
        (product.category?.slug && categories.includes(product.category.slug)) ||
        (product.category_id && categories.includes(product.category_id)) ||
        (product.category?.name && categories.includes(product.category.name));
      if (!matchCategory) return false;
    }

    // 2. Brand Filter (OR among selected brands)
    if (brands && brands.length > 0) {
      const matchBrand =
        (product.brand?.slug && brands.includes(product.brand.slug)) ||
        (product.brand_id && brands.includes(product.brand_id)) ||
        (product.brand?.name && brands.includes(product.brand.name));
      if (!matchBrand) return false;
    }

    // 3. Price Filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      const price = extractProductPrice(product);
      // If product has a price, check bounds
      if (price !== null) {
        if (minPrice !== undefined && price < minPrice) return false;
        if (maxPrice !== undefined && price > maxPrice) return false;
      } else if (priceBounds?.hasPrices) {
        // If system has prices but this item has no price, and price range is explicitly narrowed
        if (
          (minPrice !== undefined && minPrice > (priceBounds?.min ?? 0)) ||
          (maxPrice !== undefined && maxPrice < (priceBounds?.max ?? Infinity))
        ) {
          // If range is narrowed from default, exclude unpriced item
          return false;
        }
      }
    }

    // 4. Search Filter
    if (searchQuery && searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = product.name?.toLowerCase().includes(q);
      const shortDescMatch = product.short_description?.toLowerCase().includes(q);
      const longDescMatch = product.long_description?.toLowerCase().includes(q);
      const catMatch = product.category?.name?.toLowerCase().includes(q);
      const brandMatch = product.brand?.name?.toLowerCase().includes(q);
      const featuresMatch = product.features?.some((f) => f.toLowerCase().includes(q));

      if (!nameMatch && !shortDescMatch && !longDescMatch && !catMatch && !brandMatch && !featuresMatch) {
        return false;
      }
    }

    return true;
  });

  // Sorting
  if (!sortBy || sortBy === 'featured') {
    return filtered.sort((a, b) => {
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      return (a.display_order ?? 0) - (b.display_order ?? 0);
    });
  }

  if (sortBy === 'price-low') {
    return filtered.sort((a, b) => {
      const pA = extractProductPrice(a) ?? Infinity;
      const pB = extractProductPrice(b) ?? Infinity;
      return pA - pB;
    });
  }

  if (sortBy === 'price-high') {
    return filtered.sort((a, b) => {
      const pA = extractProductPrice(a) ?? -Infinity;
      const pB = extractProductPrice(b) ?? -Infinity;
      return pB - pA;
    });
  }

  if (sortBy === 'name-asc') {
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  if (sortBy === 'name-desc') {
    return filtered.sort((a, b) => b.name.localeCompare(a.name));
  }

  if (sortBy === 'newest') {
    return filtered.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    });
  }

  return filtered;
}
