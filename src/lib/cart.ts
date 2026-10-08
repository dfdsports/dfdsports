'use client';

export interface CartItem {
  id: string;
  name: string;
  slug: string;
  price?: number;
  quantity: number;
  image?: string;
  size?: string;
}

export const CART_STORAGE_KEY = 'dfd_cart';

/**
 * Generates a stable unique identifier for a product in the cart
 */
export function getCartItemId(productId: string, size?: string): string {
  const cleanId = productId.split('::')[0];
  const cleanSize = size?.trim();
  return cleanSize ? `${cleanId}::${cleanSize}` : cleanId;
}

/**
 * Checks if two cart items represent the same product variant
 */
export function isSameCartItem(
  item: CartItem,
  target: { id?: string; slug?: string; size?: string }
): boolean {
  const itemSize = (item.size || '').trim();
  const targetSize = (target.size || '').trim();

  // If both have sizes or both don't, check size match
  const sizeMatches = itemSize === targetSize;

  const rawItemId = (item.id || '').split('::')[0];
  const rawTargetId = (target.id || '').split('::')[0];

  const idMatches =
    (rawTargetId && (rawItemId === rawTargetId || item.id === target.id)) ||
    (target.slug && item.slug && item.slug === target.slug);

  return Boolean(idMatches && sizeMatches);
}

/**
 * Deduplicates and merges cart items by product ID & size
 */
export function deduplicateCartItems(items: CartItem[]): CartItem[] {
  if (!Array.isArray(items)) return [];

  const merged: CartItem[] = [];

  for (const item of items) {
    if (!item || !item.name) continue;

    const qty = Math.max(1, typeof item.quantity === 'number' && !isNaN(item.quantity) ? item.quantity : 1);
    const cleanSize = item.size?.trim() || undefined;
    const cleanId = getCartItemId(item.id || item.slug || String(Date.now()), cleanSize);

    const existingIndex = merged.findIndex((m) =>
      isSameCartItem(m, { id: cleanId, slug: item.slug, size: cleanSize })
    );

    if (existingIndex >= 0) {
      merged[existingIndex].quantity += qty;
      if (!merged[existingIndex].image && item.image) {
        merged[existingIndex].image = item.image;
      }
      if (merged[existingIndex].price == null && item.price != null) {
        merged[existingIndex].price = item.price;
      }
    } else {
      merged.push({
        ...item,
        id: cleanId,
        size: cleanSize,
        quantity: qty,
      });
    }
  }

  return merged;
}

/**
 * Gets the current cart items from localStorage (clean and deduplicated)
 */
export function getCartItems(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return deduplicateCartItems(parsed);
  } catch (err) {
    console.warn('Failed to parse cart from localStorage:', err);
    return [];
  }
}

/**
 * Saves cart items to localStorage and dispatches sync event
 */
export function saveCartItems(items: CartItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    const cleaned = deduplicateCartItems(items);
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cleaned));
    window.dispatchEvent(new CustomEvent('dfd_cart_updated'));
  } catch (err) {
    console.warn('Failed to save cart to localStorage:', err);
  }
}

/**
 * Adds an item to the cart with specified quantity, merging duplicates
 */
export function addToCart(
  item: {
    id: string;
    name: string;
    slug: string;
    price?: number;
    quantity?: number;
    image?: string;
    size?: string;
  },
  options: { openCart?: boolean } = { openCart: true }
): CartItem[] {
  const currentItems = getCartItems();
  const quantityToAdd = Math.max(1, item.quantity || 1);
  const cleanSize = item.size?.trim() || undefined;
  const targetId = getCartItemId(item.id, cleanSize);

  const existingIndex = currentItems.findIndex((ci) =>
    isSameCartItem(ci, { id: targetId, slug: item.slug, size: cleanSize })
  );

  if (existingIndex >= 0) {
    currentItems[existingIndex].quantity += quantityToAdd;
    if (item.image) currentItems[existingIndex].image = item.image;
    if (item.price != null) currentItems[existingIndex].price = item.price;
  } else {
    currentItems.push({
      id: targetId,
      name: item.name,
      slug: item.slug,
      price: item.price,
      quantity: quantityToAdd,
      image: item.image,
      size: cleanSize,
    });
  }

  saveCartItems(currentItems);

  if (options.openCart) {
    window.dispatchEvent(new CustomEvent('dfd_open_cart'));
  }

  return currentItems;
}

/**
 * Updates item quantity or removes item if quantity reaches 0
 */
export function updateCartItemQuantity(id: string, deltaOrExact: { delta?: number; exact?: number }): CartItem[] {
  const currentItems = getCartItems();
  const updated = currentItems
    .map((item) => {
      if (item.id === id) {
        let newQty = item.quantity;
        if (deltaOrExact.exact !== undefined) {
          newQty = deltaOrExact.exact;
        } else if (deltaOrExact.delta !== undefined) {
          newQty += deltaOrExact.delta;
        }
        return newQty > 0 ? { ...item, quantity: Math.min(999, newQty) } : null;
      }
      return item;
    })
    .filter(Boolean) as CartItem[];

  saveCartItems(updated);
  return updated;
}

/**
 * Removes an item from the cart
 */
export function removeCartItem(id: string): CartItem[] {
  const currentItems = getCartItems();
  const updated = currentItems.filter((item) => item.id !== id);
  saveCartItems(updated);
  return updated;
}

/**
 * Clears the entire cart
 */
export function clearCart(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('dfd_cart_updated'));
  } catch (err) {
    console.warn('Failed to clear cart:', err);
  }
}
