'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { CompanySettings } from '@/types/database';
import { createClient } from '@/lib/supabase/client';
import {
  Menu,
  X,
  Search,
  Heart,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Tag,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  company?: CompanySettings | null;
}

export interface CartItem {
  id: string;
  name: string;
  slug: string;
  price?: number;
  quantity: number;
  image?: string;
  size?: string;
}

export interface WishlistItem {
  id: string;
  name: string;
  slug: string;
  price?: number;
  image?: string;
  category?: string;
}

interface SearchProductResult {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  category?: { name: string } | null;
}

export function Header({ company }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchProductResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const pathname = usePathname();
  const router = useRouter();

  // Dynamic navbar transparency on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navigation Links
  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Collections', href: '/collections' },
    { label: 'Equipment', href: '/collections?type=equipment' },
    { label: 'Custom Jerseys', href: '/custom-jerseys' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  const brandName = company?.company_name || 'DFD SPORTS';
  const fullName = company?.full_name || 'DESTINATION FOR DREAMS';

  // Load from localStorage on mount (no mock data)
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('dfd_cart');
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
      const storedWishlist = localStorage.getItem('dfd_wishlist');
      if (storedWishlist) {
        setWishlistItems(JSON.parse(storedWishlist));
      }
    } catch {
      // Ignore JSON parse errors
    }
  }, []);

  // Sync to localStorage
  const updateCart = (items: CartItem[]) => {
    setCartItems(items);
    try {
      localStorage.setItem('dfd_cart', JSON.stringify(items));
    } catch {
      // Ignore storage errors
    }
  };

  const updateWishlist = (items: WishlistItem[]) => {
    setWishlistItems(items);
    try {
      localStorage.setItem('dfd_wishlist', JSON.stringify(items));
    } catch {
      // Ignore storage errors
    }
  };

  // Total cart quantities
  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);
  const totalWishlistCount = wishlistItems.length;

  // Search input focus & reset
  useEffect(() => {
    if (searchOpen) {
      const t = setTimeout(() => searchInputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    } else {
      setSearchQuery('');
      setSearchResults([]);
      setSearchLoading(false);
    }
  }, [searchOpen]);

  // Lock body scroll when drawers or search modal are open
  useEffect(() => {
    if (cartOpen || wishlistOpen || searchOpen || mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [cartOpen, wishlistOpen, searchOpen, mobileMenuOpen]);

  // Dynamic search against real database products (no mock data)
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length === 0) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('products')
          .select('id, name, slug, image_url, category:categories(name)')
          .ilike('name', `%${q}%`)
          .eq('is_active', true)
          .limit(6);

        if (!cancelled && !error && data) {
          setSearchResults(data as SearchProductResult[]);
        } else if (!cancelled) {
          setSearchResults([]);
        }
      } catch {
        if (!cancelled) setSearchResults([]);
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // Cart operations
  const updateQuantity = (id: string, delta: number) => {
    const updated = cartItems
      .map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter(Boolean) as CartItem[];
    updateCart(updated);
  };

  const removeCartItem = (id: string) => {
    updateCart(cartItems.filter((item) => item.id !== id));
  };

  // Wishlist operations
  const removeWishlistItem = (id: string) => {
    updateWishlist(wishlistItems.filter((item) => item.id !== id));
  };

  const moveToCart = (item: WishlistItem) => {
    removeWishlistItem(item.id);
    const existing = cartItems.find((p) => p.slug === item.slug);
    let nextCart: CartItem[];
    if (existing) {
      nextCart = cartItems.map((p) =>
        p.slug === item.slug ? { ...p, quantity: p.quantity + 1 } : p
      );
    } else {
      nextCart = [
        ...cartItems,
        {
          id: `c-${Date.now()}`,
          name: item.name,
          slug: item.slug,
          price: item.price,
          quantity: 1,
          image: item.image,
        },
      ];
    }
    updateCart(nextCart);
    setWishlistOpen(false);
    setCartOpen(true);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setSearchOpen(false);
    router.push(`/collections?q=${encodeURIComponent(q)}`);
  };

  return (
    <>
      {/* ===================== MAIN HEADER ===================== */}
      <header
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-300',
          pathname === '/' && '-mb-20',
          isScrolled || mobileMenuOpen
            ? 'bg-[#080A0F]/85 shadow-lg shadow-black/40'
            : 'bg-transparent '
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group shrink-0">
                <div className="relative w-25 h-25">
                  <Image
                    src="/logo.png"
                    alt={brandName}
                    fill
                    className="object-contain"
                  />
                </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-7">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={cn(
                      'text-sm font-medium tracking-wide transition-colors relative py-1',
                      isActive ? 'text-white' : 'text-gray-300 hover:text-white'
                    )}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#F5A623] rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Header Action Icons (Search, Wishlist, Add to Cart) */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Icon Button */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Search Catalog"
                className="relative p-2.5 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Search Products"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist Icon Button */}
              <button
                type="button"
                onClick={() => setWishlistOpen(true)}
                aria-label="View Wishlist"
                className="relative p-2.5 rounded-full text-gray-300 hover:text-[#F5A623] hover:bg-white/10 transition-colors"
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {totalWishlistCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-black bg-[#F5A623] rounded-full shadow-md">
                    {totalWishlistCount}
                  </span>
                )}
              </button>

              {/* Add To Cart / Cart Button */}
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                aria-label="View Cart"
                className="relative flex items-center gap-2 py-2 px-3 sm:px-4 rounded-full bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] hover:from-[#2563EB] hover:to-[#3B82F6] text-white shadow-lg shadow-blue-900/30 transition-all hover:scale-105"
                title="Shopping Cart"
              >
                <div className="relative">
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  {totalCartCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 flex items-center justify-center min-w-[16px] h-[16px] px-0.5 text-[9px] font-black text-black bg-[#F5A623] rounded-full">
                      {totalCartCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">
                  Cart
                </span>
              </button>

              {/* Mobile Menu Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-full text-gray-300 hover:text-white hover:bg-white/10 focus:outline-none lg:hidden ml-1"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0B0E14] px-4 pt-3 pb-6 shadow-2xl transition-all border-b border-white/10">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'px-3 py-2.5 rounded-lg text-base font-medium tracking-wide transition-colors',
                      isActive
                        ? 'bg-white/10 text-[#F5A623] font-semibold'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs text-gray-400 hover:bg-white/5 hover:text-gray-200 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-[#F5A623]" />
                  <span>Admin CMS Portal</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ===================== CART DRAWER (RIGHT SIDE) ===================== */}
      <div
        className={cn(
          'fixed inset-0 z-[80] transition-[opacity,visibility] duration-300',
          cartOpen ? 'visible opacity-100' : 'pointer-events-none invisible opacity-0'
        )}
        aria-hidden={!cartOpen}
      >
        {/* Backdrop blur overlay */}
        <div
          onClick={() => setCartOpen(false)}
          className="absolute inset-0 bg-[#080A0F]/70 backdrop-blur-md transition-opacity"
        />

        {/* Sliding Panel */}
        <div
          className={cn(
            'absolute inset-y-0 right-0 w-full max-w-md bg-[#0B0E14] border-l border-white/10 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out',
            cartOpen ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-[#0D111A]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 text-[#2563EB]">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-wide">Your Cart</h2>
                <p className="text-xs text-gray-400">
                  {totalCartCount} {totalCartCount === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setCartOpen(false)}
              className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 divide-y divide-white/5">
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div key={item.id} className="pt-4 first:pt-0 flex gap-4">
                  {/* Thumbnail */}
                  <div className="relative w-16 h-16 rounded-xl bg-white/5 border border-white/10 overflow-hidden shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <Tag className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={() => setCartOpen(false)}
                      className="text-sm font-semibold text-white hover:text-[#F5A623] transition-colors line-clamp-2"
                    >
                      {item.name}
                    </Link>
                    {item.size && (
                      <span className="inline-block mt-1 text-[11px] font-medium text-gray-400 bg-white/5 px-2 py-0.5 rounded">
                        Size: {item.size}
                      </span>
                    )}

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center border border-white/15 rounded-lg bg-white/5">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 text-gray-400 hover:text-white transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-semibold text-white">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 text-gray-400 hover:text-white transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        {item.price != null && (
                          <span className="text-sm font-bold text-[#F5A623]">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeCartItem(item.id)}
                          className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-gray-500 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">Your cart is empty</h3>
                <p className="text-xs text-gray-400 max-w-xs mb-6">
                  Explore genuine tournament equipment, jerseys, and custom sports gear.
                </p>
                <Link
                  href="/collections"
                  onClick={() => setCartOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#F5A623] hover:bg-[#e09418] text-black font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Explore Collections
                </Link>
              </div>
            )}
          </div>

          {/* Cart Footer */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-white/10 bg-[#0D111A] space-y-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span className="font-semibold text-white">
                    ₹{cartSubtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Shipping & Taxes</span>
                  <span className="text-xs text-green-400 font-medium">Calculated at checkout</span>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between text-base font-bold text-white">
                  <span>Estimated Total</span>
                  <span className="text-[#F5A623]">₹{cartSubtotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <Link
                href="/collections"
                onClick={() => setCartOpen(false)}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#F5A623] hover:opacity-95 text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-blue-900/30 transition-all hover:scale-[1.02]"
              >
                <span>Proceed To Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ===================== WISHLIST DRAWER (RIGHT SIDE) ===================== */}
      <div
        className={cn(
          'fixed inset-0 z-[80] transition-[opacity,visibility] duration-300',
          wishlistOpen ? 'visible opacity-100' : 'pointer-events-none invisible opacity-0'
        )}
        aria-hidden={!wishlistOpen}
      >
        {/* Backdrop blur overlay */}
        <div
          onClick={() => setWishlistOpen(false)}
          className="absolute inset-0 bg-[#080A0F]/70 backdrop-blur-md transition-opacity"
        />

        {/* Sliding Panel */}
        <div
          className={cn(
            'absolute inset-y-0 right-0 w-full max-w-md bg-[#0B0E14] border-l border-white/10 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out',
            wishlistOpen ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-[#0D111A]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-[#F5A623]">
                <Heart className="w-5 h-5 fill-[#F5A623]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-wide">Your Wishlist</h2>
                <p className="text-xs text-gray-400">
                  {totalWishlistCount} {totalWishlistCount === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setWishlistOpen(false)}
              className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close wishlist"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Wishlist Item List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 divide-y divide-white/5">
            {wishlistItems.length > 0 ? (
              wishlistItems.map((item) => (
                <div key={item.id} className="pt-4 first:pt-0 flex gap-4">
                  {/* Thumbnail */}
                  <div className="relative w-16 h-16 rounded-xl bg-white/5 border border-white/10 overflow-hidden shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <Tag className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={() => setWishlistOpen(false)}
                      className="text-sm font-semibold text-white hover:text-[#F5A623] transition-colors line-clamp-2"
                    >
                      {item.name}
                    </Link>
                    {item.category && (
                      <span className="inline-block mt-1 text-[11px] font-medium text-gray-400">
                        {item.category}
                      </span>
                    )}

                    <div className="mt-3 flex items-center justify-between">
                      {item.price != null && (
                        <span className="text-sm font-bold text-[#F5A623]">
                          ₹{item.price.toLocaleString('en-IN')}
                        </span>
                      )}

                      <div className="flex items-center gap-2 ml-auto">
                        <button
                          type="button"
                          onClick={() => moveToCart(item)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white text-xs font-semibold tracking-wider transition-colors flex items-center gap-1.5"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Move to Cart</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => removeWishlistItem(item.id)}
                          className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
                          aria-label="Remove from wishlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-gray-500 mb-4">
                  <Heart className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">Your wishlist is empty</h3>
                <p className="text-xs text-gray-400 max-w-xs mb-6">
                  Save your favorite gear and sports equipment to view or purchase later.
                </p>
                <Link
                  href="/collections"
                  onClick={() => setWishlistOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Browse Products
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===================== CENTERED SEARCH MODAL ===================== */}
      <div
        className={cn(
          'fixed inset-0 z-[90] flex items-center justify-center px-4 transition-[opacity,visibility] duration-300',
          searchOpen ? 'visible opacity-100' : 'pointer-events-none invisible opacity-0'
        )}
        aria-hidden={!searchOpen}
      >
        {/* Blurred background overlay */}
        <div
          onClick={() => setSearchOpen(false)}
          className="absolute inset-0 bg-[#080A0F]/80 backdrop-blur-2xl transition-opacity"
        />

        {/* Centered Modal Container */}
        <div
          role="dialog"
          aria-label="Search catalog"
          className={cn(
            'relative w-full max-w-2xl transition-all duration-300 ease-out transform',
            searchOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'
          )}
        >
          {/* Glowing Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-3.5 rounded-2xl border border-white/20 bg-[#0E121B]/95 px-5 py-4 shadow-2xl shadow-black/80 backdrop-blur-xl"
          >
            {searchLoading ? (
              <Loader2 className="h-5 w-5 shrink-0 animate-spin text-[#F5A623]" />
            ) : (
              <Search className="h-5 w-5 shrink-0 text-[#F5A623]" />
            )}
            <input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search jerseys, equipment, collections…"
              className="w-full bg-transparent text-base sm:text-lg text-white placeholder:text-gray-400 focus:outline-none"
              autoComplete="off"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 rounded-full text-gray-400 hover:text-white"
                aria-label="Clear input"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              aria-label="Close search"
              className="rounded-full p-2 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </form>

          {/* Suggestions Dropdown (ONLY shown when typing search query) */}
          {searchQuery.trim().length > 0 && (
            <div className="mt-3 overflow-hidden rounded-2xl border border-white/15 bg-[#0B0E14]/95 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
              {searchLoading ? (
                <div className="px-5 py-8 flex items-center justify-center gap-2 text-gray-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-[#F5A623]" />
                  <span>Searching products…</span>
                </div>
              ) : searchResults.length > 0 ? (
                <>
                  <div className="px-5 pt-4 pb-2 flex items-center justify-between border-b border-white/5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Suggested Products ({searchResults.length})
                    </p>
                  </div>

                  <ul className="max-h-[50vh] overflow-y-auto divide-y divide-white/5">
                    {searchResults.map((p) => (
                      <li key={p.id}>
                        <Link
                          href={`/products/${p.slug}`}
                          onClick={() => setSearchOpen(false)}
                          className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-white/5 group"
                        >
                          <div className="relative h-12 w-12 rounded-xl bg-white/5 border border-white/10 overflow-hidden shrink-0">
                            {p.image_url ? (
                              <Image
                                src={p.image_url}
                                alt={p.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-500">
                                <Tag className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-white group-hover:text-[#F5A623] transition-colors truncate">
                              {p.name}
                            </p>
                            {p.category?.name && (
                              <span className="text-xs text-gray-400">{p.category.name}</span>
                            )}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={`/collections?q=${encodeURIComponent(searchQuery.trim())}`}
                    onClick={() => setSearchOpen(false)}
                    className="block border-t border-white/10 px-5 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    View all matching results for &ldquo;{searchQuery.trim()}&rdquo; →
                  </Link>
                </>
              ) : (
                <div className="px-5 py-8 text-center text-gray-400 text-sm">
                  No products found matching &ldquo;{searchQuery.trim()}&rdquo;.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}