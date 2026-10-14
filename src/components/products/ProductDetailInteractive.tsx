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
  const uniqueImages = React.useMemo(() => {
    const list = [
      ...(product.image_url ? [product.image_url] : []),
      ...(product.images || []),
    ].filter(Boolean);
    return Array.from(new Set(list));
  }, [product.image_url, product.images]);

  const [activeImage, setActiveImage] = useState<string>(
    uniqueImages.length > 0 ? uniqueImages[0] : ''
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
    if (uniqueImages.length > 0) {
      setActiveImage(uniqueImages[0]);
    }
  }, [product.id, uniqueImages]);

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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-6 sm:mb-8 lg:mb-16">
        {/* Left Column: Image Showcase with Large Image + Side/Bottom Thumbnails */}
        <div className="lg:col-span-6 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3.5 sm:gap-4 w-full">
            {/* 1. Main Large Hero Image - Height and Width change together at 1:1 square ratio */}
            <div className="relative w-full max-w-[380px] sm:max-w-[460px] lg:max-w-[500px] xl:max-w-[520px] aspect-square rounded-none overflow-hidden bg-neutral-100 shadow-sm group shrink-0">
              {activeImage ? (
                <Image
                  src={activeImage}
                  alt={product.name}
                  fill
                  priority
                  quality={95}
                  sizes="(min-width: 1024px) 520px, 380px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400">
                  <Tag className="w-16 h-16 mb-2" />
                  <span className="text-xs uppercase tracking-widest font-bold">No Image Available</span>
                </div>
              )}

              {/* Brand Badge */}
              {product.brand?.name && (
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 bg-neutral-950/85 backdrop-blur-md px-3 py-1 rounded-none text-xs font-bold text-white uppercase tracking-widest shadow-sm">
                  {product.brand.name}
                </div>
              )}


            </div>

            {/* 2. Small Thumbnail Images: Mobile Bottom Center / Desktop Right-Side Down-by-Down */}
            {uniqueImages.length > 0 && (
              <div className="w-full sm:w-auto flex flex-row justify-center sm:flex-col sm:justify-start items-center sm:items-start gap-2.5 sm:gap-3 shrink-0 sm:self-start">
                {uniqueImages.map((img, idx) => {
                  const isActive = activeImage === img;
                  return (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      title={`View image ${idx + 1}`}
                      aria-label={`View image ${idx + 1}`}
                      className={cn(
                        'relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 aspect-square rounded-none overflow-hidden bg-[#0E121B] border transition-all cursor-pointer group text-left p-1 shrink-0',
                        isActive
                          ? 'border-[#FF001E] ring-2 ring-[#FF001E]'
                          : 'border-white/10 opacity-75 hover:opacity-100 hover:border-white/30'
                      )}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} view ${idx + 1}`}
                        fill
                        sizes="(min-width: 1024px) 96px, (min-width: 640px) 80px, 64px"
                        className="object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Product Information & Action Suite */}
        <div className="lg:col-span-6 flex flex-col">
          {/* Category Tag */}
          {product.category && (
            <p
              className="text-xs uppercase tracking-[0.25em] font-semibold text-[#E8192C] mb-2"
              style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
            >
              {product.category.name}
            </p>
          )}

          {/* Product Title */}
          <h1
            className="text-2xl sm:text-4xl font-bold uppercase tracking-tight text-white mb-3"
            style={{ fontFamily: "var(--font-mohave), 'Mohave', var(--font-barlow), sans-serif" }}
          >
            {product.name}
          </h1>

          {/* Short Description */}
          {product.short_description && (
            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed mb-6 font-normal">
              {product.short_description}
            </p>
          )}

          {/* Available Sizes / Specs Chips */}
          {availableSizes.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2.5">
                <span
                  className="text-xs font-bold uppercase tracking-wider text-white"
                  style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
                >
                  Select Size / Specification:
                </span>
                {selectedSize && (
                  <span className="text-xs font-bold text-[#E8192C]">Selected: {selectedSize}</span>
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
                        'px-4 py-2.5 rounded-none text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border',
                        isSelected
                          ? 'bg-[#FF001E] border-[#FF001E] text-white shadow-md'
                          : 'border-white/15 bg-white/5 text-neutral-300 hover:bg-white/10 hover:text-white'
                      )}
                      style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
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
              <span
                className="text-xs font-bold uppercase tracking-wider text-white block mb-3"
                style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
              >
                Highlights & Features:
              </span>
              <ul className="space-y-2">
                {product.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-300">
                    <CheckCircle className="w-4 h-4 text-[#FF001E] shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ================= ACTIONS ================= */}
          <div className="space-y-3 mb-0 lg:mb-8">
            {/* ROW 1: Quantity Stepper + Add to Cart */}
            <div className="flex items-center gap-3">
              {/* Quantity Stepper */}
              <div className="flex items-center justify-between rounded-none border border-white/15 bg-[#0E121B] h-12 px-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="w-8 h-8 rounded-none flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer active:scale-90"
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
                  className="w-8 h-8 rounded-none flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer active:scale-90"
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
                  'flex-1 h-12 px-6 rounded-none font-bold text-xs sm:text-sm uppercase tracking-[0.14em] flex items-center justify-center gap-2.5 shadow-md transition-all duration-200 cursor-pointer active:scale-[0.98]',
                  isAdded
                    ? 'bg-emerald-600 text-white shadow-emerald-950/40'
                    : 'bg-[#FF001E] hover:bg-[#d6001a] text-white'
                )}
                style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 text-white stroke-[2.5]" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
            </div>

            {/* ROW 2: Order on WhatsApp Button */}
            <button
              type="button"
              onClick={() => setIsWhatsAppModalOpen(true)}
              className="w-full h-12 px-6 rounded-none bg-[#25D366] hover:bg-[#20ba59] text-white font-bold uppercase tracking-[0.12em] text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-md transition-all duration-200 active:scale-[0.98] cursor-pointer"
              style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
            >
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 fill-white/20" />
              <span>Place Order on WhatsApp</span>
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
