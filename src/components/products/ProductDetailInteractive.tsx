'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Product, CompanySettings } from '@/types/database';
import { extractProductPrice } from '@/lib/productFilters';
import { CartItem, WishlistItem } from '@/components/layout/Header';
import { WhatsAppOrderModal } from '@/components/ui/WhatsAppOrderModal';
import {
  Heart,
  ShoppingCart,
  Check,
  Tag,
  Plus,
  Minus,
  CheckCircle,
  MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { addToCart } from '@/lib/cart';

interface ProductDetailInteractiveProps {
  product: Product;
  company?: CompanySettings | null;
}

export function ProductDetailInteractive({ product, company }: ProductDetailInteractiveProps) {
  const allImages = [
    ...(product.image_url ? [product.image_url] : []),
    ...(product.images || []),
  ];

  const [activeImage, setActiveImage] = useState<string>(
    allImages.length > 0 ? allImages[0] : ''
  );
  const availableSizes = Array.isArray(product.sizes)
    ? product.sizes
    : typeof product.sizes === 'string'
    ? ((product.sizes as unknown) as string).split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const [selectedSize, setSelectedSize] = useState<string>(
    availableSizes.length > 0 ? availableSizes[0] : ''
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  const price = extractProductPrice(product);

  // Sync active image if product changes
  useEffect(() => {
    if (allImages.length > 0) {
      setActiveImage(allImages[0]);
    }
  }, [product.id]);

  // Sync wishlist status
  const syncWishlist = useCallback(() => {
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
    syncWishlist();
    const handleUpdate = () => syncWishlist();
    window.addEventListener('dfd_wishlist_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('dfd_wishlist_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [syncWishlist]);

  const handleToggleWishlist = () => {
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
          image: activeImage || product.image_url || undefined,
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

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAddToCart = () => {
    try {
      const sizeToSave = selectedSize || (availableSizes.length > 0 ? availableSizes[0] : undefined);

      addToCart(
        {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: price ?? undefined,
          quantity: quantity,
          image: activeImage || product.image_url || undefined,
          size: sizeToSave,
        },
        { openCart: true }
      );

      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    } catch (err) {
      console.warn('Failed to add to cart:', err);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-20">
        {/* Left Column: Full-Section Image Showcase */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          {/* Main Hero Image Taking Full Section Area */}
          <div className="relative aspect-square w-full bg-white rounded-2xl sm:rounded-3xl overflow-hidden bg-[#0A0D14] shadow-2xl group flex items-center justify-center">
            {activeImage ? (
              <Image
                src={activeImage}
                alt={product.name}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-contain "
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-600">
                <Tag className="w-16 h-16 mb-2" />
                <span className="text-xs uppercase tracking-widest font-bold">No Image Available</span>
              </div>
            )}

            {/* Brand Badge */}
            {product.brand?.name && (
              <div className="absolute top-4 left-4 sm:top-5 sm:left-5 z-10 bg-black/80 backdrop-blur-md px-3.5 py-1.5 rounded-lg text-xs font-bold text-gray-200 uppercase tracking-widest shadow-md">
                {product.brand.name}
              </div>
            )}

            {/* Wishlist Button */}
            <button
              type="button"
              onClick={handleToggleWishlist}
              title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              className={cn(
                'absolute top-4 right-4 sm:top-5 sm:right-5 z-20 w-10 h-10 rounded-full flex items-center justify-center shadow-lg backdrop-blur-md transition-all duration-200 cursor-pointer active:scale-90',
                isWishlisted
                  ? 'bg-rose-500/20 text-rose-500'
                  : 'bg-black/60 text-gray-300 hover:text-rose-500'
              )}
            >
              <Heart className={cn('w-5 h-5', isWishlisted ? 'fill-rose-500 text-rose-500' : '')} />
            </button>
          </div>

          {/* Thumbnail Gallery (if multiple images exist) */}
          {allImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
              {allImages.map((img, i) => {
                const isActive = activeImage === img;
                return (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={cn(
                      'relative w-20 h-20 rounded-xl overflow-hidden bg-[#0A0D14] p-1.5 shrink-0 transition-all cursor-pointer',
                      isActive
                        ? 'ring-2 ring-[#F5A623] scale-95'
                        : 'opacity-70 hover:opacity-100'
                    )}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} thumbnail ${i + 1}`}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Product Information & Action Suite */}
        <div className="lg:col-span-6 flex flex-col">
          {/* Category Tag */}
          {product.category && (
            <p className="text-xs uppercase tracking-[0.25em] font-bold text-[#F5A623] mb-2">
              {product.category.name}
            </p>
          )}

          {/* Product Title */}
          <h1 className="text-2xl sm:text-4xl font-semibold uppercase tracking-tight text-white mb-3">
            {product.name}
          </h1>

          {/* Price Display */}
          <div className="flex items-baseline gap-3 mb-5">
            {price !== null ? (
              <>
                <span className="text-2xl sm:text-3xl font-black text-white">
                  ₹{(price * quantity).toLocaleString('en-IN')}
                </span>
                {quantity > 1 && (
                  <span className="text-xs font-semibold text-gray-400">
                    (₹{price.toLocaleString('en-IN')} each)
                  </span>
                )}
              </>
            ) : (
              <span className="text-base font-semibold text-[#F5A623]">Price on Wholesale Inquiry</span>
            )}
          </div>

          {/* Short Description */}
          {product.short_description && (
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed mb-6 font-normal">
              {product.short_description}
            </p>
          )}

          {/* Available Sizes / Specs Chips */}
          {availableSizes.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
                  Select Size / Specification:
                </span>
                {selectedSize && (
                  <span className="text-xs text-[#F5A623]">Selected: {selectedSize}</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2.5">
                {availableSizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      type="button"
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        'px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer',
                        isSelected
                          ? 'bg-[#F5A623] text-black shadow-md shadow-[#F5A623]/20'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10'
                      )}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Highlights & Features */}
          {product.features && product.features.length > 0 && (
            <div className="mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-300 block mb-3">
                Highlights & Features:
              </span>
              <ul className="space-y-2">
                {product.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-300">
                    <CheckCircle className="w-4 h-4 text-[#F5A623] shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ================= ACTIONS ================= */}
          <div className="space-y-3 mb-8">
            {/* ROW 1: Quantity Stepper + Add to Cart */}
            <div className="flex items-center gap-3">
              {/* Quantity Stepper */}
              <div className="flex items-center justify-between rounded-xl bg-white/[0.05] hover:bg-white/[0.08] transition-colors h-12 px-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer active:scale-90"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setQuantity(isNaN(val) || val < 1 ? 1 : val);
                  }}
                  className="w-10 text-center bg-transparent text-white font-bold text-sm focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />

                <button
                  type="button"
                  onClick={() => handleQuantityChange(1)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer active:scale-90"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                className={cn(
                  'flex-1 h-12 px-6 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-lg transition-all duration-200 cursor-pointer active:scale-[0.98]',
                  isAdded
                    ? 'bg-emerald-600 text-white shadow-emerald-950/40'
                    : 'bg-gradient-to-r from-[#F5A623] via-[#FBBF24] to-[#F59E0B] hover:brightness-110 text-black shadow-[#F5A623]/25'
                )}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 text-black stroke-[2.5]" />
                    <span className='font-semibold'>Add to Cart</span>
                  </>
                )}
              </button>
            </div>

            {/* ROW 2: Order on WhatsApp Button */}
            <button
              type="button"
              onClick={() => setIsWhatsAppModalOpen(true)}
              className="w-full h-12 px-6 rounded-xl bg-gradient-to-r from-[#22C55E] to-[#16A34A] hover:from-[#25D366] hover:to-[#22C55E] text-white font-black uppercase tracking-wider text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-950/40 transition-all duration-200 active:scale-[0.98] cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 fill-white/20" />
              <span className='font-semibold'>Place Order on WhatsApp</span>
            </button>
          </div>
        </div>
      </div>

      {/* WhatsApp Order Modal */}
      <WhatsAppOrderModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        hideTrigger={true}
        whatsappNumber={company?.whatsapp_number}
        productName={product.name}
        productCategory={product.category?.name}
        productSizes={selectedSize ? [selectedSize] : product.sizes}
        initialQuantity={quantity.toString()}
      />
    </>
  );
}
