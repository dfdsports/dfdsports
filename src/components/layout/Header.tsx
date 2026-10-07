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
  MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { WhatsAppOrderModal } from '@/components/ui/WhatsAppOrderModal';

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

import { extractProductPrice } from '@/lib/productFilters';

interface SearchProductResult {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  specifications?: Record<string, string> | null;
  price?: number | null;
  category?: { name: string } | null;
}

export function Header({ company }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchProductResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
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

  // Load from localStorage on mount & listen to real-time events from ProductCards
  useEffect(() => {
    const syncStorage = () => {
      try {
        const storedCart = localStorage.getItem('dfd_cart');
        if (storedCart) {
          setCartItems(JSON.parse(storedCart));
        } else {
          setCartItems([]);
        }
        const storedWishlist = localStorage.getItem('dfd_wishlist');
        if (storedWishlist) {
          setWishlistItems(JSON.parse(storedWishlist));
        } else {
          setWishlistItems([]);
        }
      } catch {
        // Ignore JSON parse errors
      }
    };

    syncStorage();

    const handleOpenCart = () => setCartOpen(true);
    const handleOpenWishlist = () => setWishlistOpen(true);

    window.addEventListener('dfd_cart_updated', syncStorage);
    window.addEventListener('dfd_wishlist_updated', syncStorage);
    window.addEventListener('dfd_open_cart', handleOpenCart);
    window.addEventListener('dfd_open_wishlist', handleOpenWishlist);
    window.addEventListener('storage', syncStorage);

    return () => {
      window.removeEventListener('dfd_cart_updated', syncStorage);
      window.removeEventListener('dfd_wishlist_updated', syncStorage);
      window.removeEventListener('dfd_open_cart', handleOpenCart);
      window.removeEventListener('dfd_open_wishlist', handleOpenWishlist);
      window.removeEventListener('storage', syncStorage);
    };
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
      setSelectedIndex(-1);
      const t = setTimeout(() => searchInputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    } else {
      setSearchQuery('');
      setSearchResults([]);
      setSelectedIndex(-1);
      setSearchLoading(false);
    }
  }, [searchOpen]);

  // Keyboard navigation & shortcuts (⌘K / Ctrl+K / Arrows / Enter / Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
      } else if (searchOpen && searchResults.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
        } else if (e.key === 'Enter' && selectedIndex >= 0 && searchResults[selectedIndex]) {
          e.preventDefault();
          const target = searchResults[selectedIndex];
          setSearchOpen(false);
          router.push(`/products/${target.slug}`);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, searchResults, selectedIndex, router]);

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
      setSelectedIndex(-1);
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
          .select('id, name, slug, image_url, specifications, category:categories(name)')
          .ilike('name', `%${q}%`)
          .eq('is_active', true)
          .limit(4);

        if (!cancelled && !error && data) {
          const parsed = data.map((item: any) => ({
            ...item,
            price: extractProductPrice(item as any),
          }));
          setSearchResults(parsed as SearchProductResult[]);
          setSelectedIndex(-1);
        } else if (!cancelled) {
          setSearchResults([]);
          setSelectedIndex(-1);
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
            ? 'bg-black shadow-lg shadow-black/40'
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
              {/* Desktop Search Trigger Pill (Modern Luxury Glass Pill) */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Search Catalog"
                className="hidden xl:flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] hover:border-amber-500/40 text-gray-300 hover:text-white transition-all text-xs group shadow-inner"
                title="Search Products"
              >
                <Search className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="text-gray-400 group-hover:text-gray-200">Search sports gear, jerseys...</span>
              </button>

              {/* Mobile & Tablet Search Icon Button */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Search Catalog"
                className="xl:hidden relative p-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 border border-white/5 active:scale-95 transition-all"
                title="Search Products"
              >
                <Search className="w-5 h-5 text-amber-400" />
              </button>

              {/* Wishlist Icon Button - Hidden on mobile, accessible in mobile menu */}
              <button
                type="button"
                onClick={() => setWishlistOpen(true)}
                aria-label="View Wishlist"
                className="hidden sm:flex relative p-2.5 rounded-xl text-gray-300 hover:text-[#F5A623] hover:bg-white/10 transition-colors"
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
                className="relative p-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalCartCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-black bg-[#F5A623] rounded-full shadow-md">
                    {totalCartCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 focus:outline-none lg:hidden ml-1"
                aria-label="Open Navigation Menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ===================== MOBILE NAVIGATION DRAWER (RIGHT SIDE) ===================== */}
      <div
        className={cn(
          'lg:hidden fixed inset-0 z-[85] transition-[opacity,visibility] duration-300',
          mobileMenuOpen ? 'visible opacity-100' : 'pointer-events-none invisible opacity-0'
        )}
        aria-hidden={!mobileMenuOpen}
      >
        {/* Backdrop overlay */}
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="absolute inset-0 bg-[#080A0F]/75 backdrop-blur-md transition-opacity"
        />

        {/* Sliding Drawer from Right */}
        <div
          className={cn(
            'absolute inset-y-0 right-0 w-[300px] sm:w-[340px] max-w-[85vw] bg-[#0B0E14] border-l border-white/10 shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-in-out',
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          {/* Drawer Top Header */}
          <div>
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#0D111A]">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="relative w-28 h-10 block">
                <Image
                  src="/logo.png"
                  alt={brandName}
                  fill
                  sizes="120px"
                  className="object-contain object-left"
                />
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Search inside Drawer */}
            <div className="p-3 border-b border-white/5 bg-[#090C12]">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSearchOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-400 hover:text-white transition-all"
              >
                <Search className="w-4 h-4 text-[#F5A623]" />
                <span>Search gear, jerseys...</span>
              </button>
            </div>

            {/* Navigation Links List */}
            <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-320px)]">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all',
                      isActive
                        ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/5 text-[#F5A623] border border-amber-500/20 font-bold'
                        : 'text-gray-200 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <span>{link.label}</span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#F5A623]" />}
                  </Link>
                );
              })}

              <div className="pt-2 border-t border-white/10 my-2 space-y-1">
                {/* Wishlist on Menubar */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setWishlistOpen(true);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold tracking-wide text-gray-200 hover:bg-white/5 hover:text-white transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Heart className="w-4 h-4 text-[#F5A623] group-hover:scale-110 transition-transform" />
                    <span>My Wishlist</span>
                  </div>
                  {totalWishlistCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#F5A623] text-black">
                      {totalWishlistCount}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500 font-mono">0</span>
                  )}
                </button>
              </div>
            </nav>
          </div>

          {/* Full-size Bottom on Menubar */}
          <div className="p-4 border-t border-white/10 bg-[#0D111A] space-y-2.5">
            {/* Full-width WhatsApp Enquiry Button */}
            {company?.whatsapp_number && (
              <a
                href={`https://wa.me/${company.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent('Hi DFD Sports, I would like to inquire about your products.')}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Enquire on WhatsApp</span>
              </a>
            )}

            {/* Full-width Explore Collections Button */}
            <Link
              href="/collections"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] hover:from-[#2563EB] hover:to-[#3B82F6] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-950/40 transition-all active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Explore All Products</span>
            </Link>

            {/* Contact Footer Details */}
            {company?.phone && (
              <div className="pt-1 text-center">
                <p className="text-[11px] text-gray-400">
                  Customer Support: <a href={`tel:${company.phone}`} className="text-[#F5A623] hover:underline font-mono font-medium">{company.phone}</a>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

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

              <button
                type="button"
                onClick={() => {
                  setCartOpen(false);
                  setCheckoutModalOpen(true);
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#F5A623] hover:opacity-95 text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-blue-900/30 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span>Proceed To Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
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

      {/* ===================== ULTRA-MODERN SPOTLIGHT SEARCH (MOBILE RESPONSIVE & DESKTOP) ===================== */}
      <div
        className={cn(
          'fixed inset-0 z-[90] flex items-start justify-center pt-10 sm:pt-14 px-3.5 sm:px-4 transition-[opacity,visibility] duration-300',
          searchOpen ? 'visible opacity-100' : 'pointer-events-none invisible opacity-0'
        )}
        aria-hidden={!searchOpen}
      >
        {/* Blurred background overlay */}
        <div
          onClick={() => setSearchOpen(false)}
          className="absolute inset-0 bg-[#06080E]/85 backdrop-blur-2xl transition-opacity"
        />

        {/* Search Dialog Container */}
        <div
          role="dialog"
          aria-label="Search catalog"
          className={cn(
            'relative w-full max-w-2xl bg-[#0B0F19] border border-white/15 rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/90 backdrop-blur-2xl overflow-hidden flex flex-col transition-all duration-300 ease-out transform',
            searchOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-2 opacity-0'
          )}
        >
          {/* Main Search Input Form Header */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-white/10 bg-[#0E1322] shrink-0"
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
              placeholder="Search footballs, custom jerseys, cricket, equipment…"
              className="w-full bg-transparent text-sm sm:text-base font-semibold text-white placeholder:text-gray-500 focus:outline-none"
              autoComplete="off"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  searchInputRef.current?.focus();
                }}
                className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                aria-label="Clear input"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </form>

          {/* Search Content Body (Only displays when user types a query) */}
          {searchQuery.trim().length > 0 && (
            <div className="max-h-[60vh] overflow-y-auto overscroll-contain animate-in fade-in duration-200">
              {searchLoading ? (
                <div className="px-5 py-12 flex flex-col items-center justify-center gap-3 text-gray-400 text-sm">
                  <Loader2 className="w-7 h-7 animate-spin text-[#F5A623]" />
                  <span>Searching catalog products…</span>
                </div>
              ) : searchResults.length > 0 ? (
                <>
                  <div className="px-5 py-2.5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Matching Products ({searchResults.length})
                    </p>
                    <span className="text-[11px] text-[#F5A623] font-medium hidden sm:inline">Use ↑ ↓ and Enter</span>
                  </div>

                  <ul className="divide-y divide-white/5">
                    {searchResults.map((p, idx) => {
                      const isSelected = selectedIndex === idx;
                      return (
                        <li key={p.id}>
                          <Link
                            href={`/products/${p.slug}`}
                            onClick={() => setSearchOpen(false)}
                            className={cn(
                              'flex items-center gap-3.5 px-4 sm:px-5 py-3.5 transition-colors group',
                              isSelected ? 'bg-amber-500/15 border-l-2 border-amber-400' : 'hover:bg-white/5'
                            )}
                          >
                            <div className="relative h-13 w-13 sm:h-14 sm:w-14 rounded-xl bg-white/5 border border-white/10 overflow-hidden shrink-0">
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
                              <p className="text-sm font-bold text-white group-hover:text-[#F5A623] transition-colors truncate">
                                {p.name}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                {p.category?.name && (
                                  <span className="text-[10px] font-medium text-gray-300 bg-white/5 px-2 py-0.5 rounded-md inline-block">
                                    {p.category.name}
                                  </span>
                                )}
                                {p.price != null && (
                                  <span className="text-xs font-bold text-amber-400">
                                    ₹{p.price.toLocaleString('en-IN')}
                                  </span>
                                )}
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-[#F5A623] group-hover:translate-x-1 transition-all shrink-0" />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </>
              ) : (
                <div className="px-5 py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-500 mx-auto mb-3">
                    <Search className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-bold text-white mb-1">
                    No products found for &ldquo;{searchQuery.trim()}&rdquo;
                  </p>
                  <p className="text-xs text-gray-400 max-w-xs mx-auto mb-4 leading-relaxed">
                    Try searching with keywords like football, jersey, nivia, cricket or badminton.
                  </p>
                  <Link
                    href="/collections"
                    onClick={() => setSearchOpen(false)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs font-bold uppercase tracking-wider transition-all"
                  >
                    <span>Browse All Collections</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ===================== CART CHECKOUT / ENQUIRY MODAL ===================== */}
      <WhatsAppOrderModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        hideTrigger
        whatsappNumber={company?.whatsapp_number}
        productName={
          cartItems.length === 1
            ? cartItems[0].name
            : cartItems.length > 1
            ? `${cartItems[0].name} + ${cartItems.length - 1} more`
            : 'Cart Order'
        }
        productCategory={
          cartSubtotal > 0
            ? `Total: ₹${cartSubtotal.toLocaleString('en-IN')} • ${totalCartCount} items`
            : `${totalCartCount} items`
        }
        initialQuantity={String(totalCartCount || 1)}
        showQuantity={false}
        cartItems={cartItems}
        cartSubtotal={cartSubtotal}
        onSuccess={() => {
          try {
            localStorage.removeItem('dfd_cart');
            window.dispatchEvent(new CustomEvent('dfd_cart_updated'));
          } catch {
            // Ignore
          }
        }}
      />
    </>
  );
}