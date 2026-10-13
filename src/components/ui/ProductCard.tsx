'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product, CompanySettings } from '@/types/database';
import { extractProductPrice } from '@/lib/productFilters';
import { CartItem, WishlistItem } from '@/components/layout/Header';
import { addToCart } from '@/lib/cart';
import { Heart, ShoppingCart, Check, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ProductCardProps {
  product: Product;
  company?: CompanySettings | null;
  className?: string;
  priority?: boolean;
}

export function ProductCard({
  product,
  className,
  priority = false,
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [product.image_url]);

  const price = extractProductPrice(product);

  // Sync wishlist status from localStorage
  const syncWishlistStatus = useCallback(() => {
    try {
      const stored = localStorage.getItem('dfd_wishlist');
      if (stored) {
        const items: WishlistItem[] = JSON.parse(stored);
        setIsWishlisted(items.some((item) => item.id === product.id));
      } else {
        setIsWishlisted(false);
      }
    } catch {
      setIsWishlisted(false);
    }
  }, [product.id]);

  useEffect(() => {
    syncWishlistStatus();

    const handleWishlistUpdate = () => syncWishlistStatus();
    window.addEventListener('dfd_wishlist_updated', handleWishlistUpdate);
    window.addEventListener('storage', handleWishlistUpdate);

    return () => {
      window.removeEventListener('dfd_wishlist_updated', handleWishlistUpdate);
      window.removeEventListener('storage', handleWishlistUpdate);
    };
  }, [syncWishlistStatus]);

  // Wishlist toggle handler
  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const stored = localStorage.getItem('dfd_wishlist');
      let items: WishlistItem[] = stored ? JSON.parse(stored) : [];

      if (items.some((item) => item.id === product.id)) {
        items = items.filter((item) => item.id !== product.id);
        setIsWishlisted(false);
      } else {
        items.push({
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: price ?? undefined,
          image: product.image_url ?? undefined,
          category: product.category?.name,
        });
        setIsWishlisted(true);
      }

      localStorage.setItem('dfd_wishlist', JSON.stringify(items));
      window.dispatchEvent(new CustomEvent('dfd_wishlist_updated'));
    } catch (err) {
      console.warn('Failed to update wishlist:', err);
    }
  };

  // Add to Cart handler
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const availableSizes = Array.isArray(product.sizes)
        ? product.sizes
        : typeof product.sizes === 'string'
        ? ((product.sizes as unknown) as string).split(',').map((s) => s.trim()).filter(Boolean)
        : [];
      const defaultSize = availableSizes.length > 0 ? availableSizes[0] : undefined;

      addToCart(
        {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: price ?? undefined,
          quantity: 1,
          image: product.image_url ?? undefined,
          size: defaultSize,
        },
        { openCart: true }
      );

      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 1600);
    } catch (err) {
      console.warn('Failed to add to cart:', err);
    }
  };

  return (
    <div
      className={cn(
        'group relative rounded-none bg-white border border-neutral-200 hover:border-neutral-400 hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden',
        className
      )}
    >
      {/* Top Image Section: Image fills full of card */}
      <div className="relative aspect-[3/4] w-full bg-neutral-100 flex items-center justify-center overflow-hidden">
        {/* Brand Tag (Top Left) */}
        {product.brand?.name && (
          <span className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-none bg-neutral-950/85 backdrop-blur-xs text-[9px] sm:text-[10px] font-bold text-white uppercase tracking-wider shadow-xs">
            {product.brand.name}
          </span>
        )}

        {/* Wishlist Button (Top Right) */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={cn(
            'absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-none flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-90',
            isWishlisted
              ? 'text-rose-500 scale-105'
              : 'text-neutral-600 hover:text-rose-500 hover:scale-110 drop-shadow-xs'
          )}
        >
          <Heart
            className={cn(
              'w-4 h-4 transition-transform',
              isWishlisted ? 'fill-rose-500 text-rose-500 scale-110' : ''
            )}
          />
        </button>

        {/* Product Image Link - Fills full card */}
        <Link
          href={`/products/${product.slug}`}
          className="relative w-full h-full block"
          tabIndex={-1}
        >
          {product.image_url && !imageError ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              priority={priority}
              quality={95}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover object-center"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400">
              <Tag className="w-8 h-8 mb-1" />
              <span className="text-[10px] uppercase font-bold tracking-wider">No Image</span>
            </div>
          )}
        </Link>

        {/* Mobile View: Add to Cart icon on image bottom right side */}
        <button
          type="button"
          onClick={handleAddToCart}
          title={isAdded ? 'Added to cart' : 'Add to cart'}
          aria-label={isAdded ? 'Added to cart' : 'Add to cart'}
          className={cn(
            'sm:hidden absolute bottom-2.5 right-2.5 z-20 w-8 h-8 rounded-none flex items-center justify-center shadow-md transition-all duration-200 cursor-pointer active:scale-90',
            isAdded
              ? 'bg-emerald-600 text-white shadow-emerald-600/30'
              : 'bg-[#FF001E] text-white hover:bg-[#d6001a] shadow-md'
          )}
        >
          {isAdded ? (
            <Check className="w-4 h-4 text-white" />
          ) : (
            <ShoppingCart className="w-4 h-4 text-white" />
          )}
        </button>

        {/* Desktop Hover Action: Add to Cart button slides up smoothly */}
        <div className="hidden sm:block absolute inset-x-3 bottom-3 z-20 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto">
          <button
            type="button"
            onClick={handleAddToCart}
            className={cn(
              'w-full py-2.5 px-3 rounded-none font-bold text-xs uppercase tracking-[0.12em] flex items-center justify-center gap-1.5 shadow-md transition-all duration-200 cursor-pointer active:scale-95',
              isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-[#FF001E] hover:bg-[#d6001a] text-white'
            )}
            style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Added to Cart!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bottom Content Body: Name outside the image at bottom */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between bg-white border-t border-neutral-100">
        <div>
          {/* Category Tag */}
          {product.category?.name && (
            <p
              className="text-[10px] sm:text-[11px] font-semibold text-[#E8192C] uppercase tracking-wider truncate mb-1"
              style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
            >
              {product.category.name}
            </p>
          )}

          {/* Product Name: Outside the image at bottom */}
          <Link href={`/products/${product.slug}`} className="block">
            <h3
              className="text-xs sm:text-sm md:text-[15px] font-bold text-neutral-950 group-hover:text-[#FF001E] transition-colors truncate uppercase leading-snug"
              style={{ fontFamily: "var(--font-mohave), 'Mohave', var(--font-barlow), sans-serif" }}
              title={product.name}
            >
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price */}
        {price !== null && (
          <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between gap-2">
            <div>
              <span className="text-xs sm:text-sm font-black text-neutral-950">
                ₹{price.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
