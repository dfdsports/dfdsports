'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { CompanySettings, Category } from '@/types/database';
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
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { WhatsAppOrderModal } from '@/components/ui/WhatsAppOrderModal';
import {
  CartItem,
  getCartItems,
  saveCartItems,
  addToCart,
  updateCartItemQuantity,
  removeCartItem as removeCartItemFromLib,
  clearCart,
} from '@/lib/cart';

export type { CartItem };

interface HeaderProps {
  company?: CompanySettings | null;
  categories?: Category[];
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

export function Header({ company, categories }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

  const [categoriesList, setCategoriesList] = useState<Category[]>(categories || []);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchProductResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const pathname = usePathname();
  const router = useRouter();

  // Load active categories from Supabase if not provided as prop
  useEffect(() => {
    if (categories && categories.length > 0) {
      setCategoriesList(categories);
      return;
    }
    async function loadCategories() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });
        if (!error && data && data.length > 0) {
          setCategoriesList(data as Category[]);
        }
      } catch (err) {
        // Silently use fallbacks
      }
    }
    loadCategories();
  }, [categories]);

  // Dynamic navbar transparency on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const displayedCategories =
    categoriesList.length > 0
      ? categoriesList
      : ([
          { id: '1', name: 'Cricket', slug: 'cricket', is_active: true },
          { id: '2', name: 'Football', slug: 'football', is_active: true },
          { id: '3', name: 'Badminton', slug: 'badminton', is_active: true },
          { id: '4', name: 'Volleyball', slug: 'volleyball', is_active: true },
          { id: '5', name: 'Basketball', slug: 'basketball', is_active: true },
          { id: '6', name: 'Athletics & Track', slug: 'athletics-track', is_active: true },
        ] as Category[]);

  // Navigation Links
  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Categories', href: '/collections' },
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
        setCartItems(getCartItems());
        const storedWishlist = localStorage.getItem('dfd_wishlist');
        if (storedWishlist) {
          setWishlistItems(JSON.parse(storedWishlist));
        } else {
          setWishlistItems([]);
        }
      } catch {
        // Ignore errors
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
    saveCartItems(items);
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
    const updated = updateCartItemQuantity(id, { delta });
    setCartItems(updated);
  };

  const setQuantity = (id: string, qty: number) => {
    if (isNaN(qty) || qty <= 0) return;
    const updated = updateCartItemQuantity(id, { exact: Math.max(1, Math.min(999, qty)) });
    setCartItems(updated);
  };

  const removeCartItem = (id: string) => {
    const updated = removeCartItemFromLib(id);
    setCartItems(updated);
  };

  // Wishlist operations
  const removeWishlistItem = (id: string) => {
    updateWishlist(wishlistItems.filter((item) => item.id !== id));
  };

  const moveToCart = (item: WishlistItem) => {
    removeWishlistItem(item.id);
    const updated = addToCart(
      {
        id: item.id,
        name: item.name,
        slug: item.slug,
        price: item.price,
        quantity: 1,
        image: item.image,
      },
      { openCart: true }
    );
    setCartItems(updated);
    setWishlistOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setSearchOpen(false);
    router.push(`/collections?q=${encodeURIComponent(q)}`);
  };

  const isWhiteNav = isScrolled || pathname !== '/';

  return (
    <>
      {/* ===================== MAIN HEADER ===================== */}
      <header
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-300',
          pathname === '/' && '-mb-[76px]',
          isWhiteNav
            ? 'bg-[#080A0F]/95 backdrop-blur-md shadow-lg'
            : 'bg-transparent'
        )}
      >
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="relative flex items-center justify-between h-[76px]">
            {/* Left: Logo + Vertical Divider */}
            <div className="flex items-center gap-6 lg:gap-8 shrink-0">
              <Link href="/" className="flex items-center group shrink-0">
                <div className="relative w-28 h-10">
                  <Image
                    src="/logo.png"
                    alt={brandName}
                    fill
                    sizes="112px"
                    className="object-contain object-left transition-transform group-hover:scale-105"
                    priority
                  />
                </div>
              </Link>
              <div
                className="hidden sm:block h-8 w-[1px] bg-white/20 transition-colors"
              />
            </div>

            {/* Center: Desktop Navigation Links (Title Case, Mohave font) */}
            <nav className="hidden lg:flex items-center gap-7 xl:gap-9 absolute left-1/2 -translate-x-1/2">
              {/* Home */}
              <Link
                href="/"
                style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
                className={cn(
                  'text-[17px] font-medium tracking-wide transition-colors whitespace-nowrap',
                  pathname === '/'
                    ? 'text-white font-bold'
                    : 'text-neutral-300 hover:text-white'
                )}
              >
                Home
              </Link>

              {/* Categories Navlink with Hover Dropdown */}
              <div
                className="relative group py-6"
                onMouseEnter={() => setCategoriesDropdownOpen(true)}
                onMouseLeave={() => setCategoriesDropdownOpen(false)}
              >
                <Link
                  href="/collections"
                  style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
                  className={cn(
                    'inline-flex items-center gap-1.5 text-[17px] font-medium tracking-wide transition-colors whitespace-nowrap',
                    pathname.startsWith('/collections')
                      ? 'text-[#FF001E] font-bold'
                      : 'text-neutral-300 hover:text-white'
                  )}
                >
                  <span>Categories</span>
                  <ChevronDown
                    className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180 text-white/60 group-hover:text-white"
                  />
                </Link>

                {/* Dropdown Menu - Sleek Dark Theme */}
                <div
                  className={cn(
                    'absolute top-full left-1/2 -translate-x-1/2 w-64 pt-2 transition-all duration-200 z-50',
                    categoriesDropdownOpen
                      ? 'opacity-100 visible translate-y-0 pointer-events-auto'
                      : 'opacity-0 invisible -translate-y-2 pointer-events-none'
                  )}
                >
                  <div className="bg-[#0E121B] border border-white/15 shadow-2xl p-2 rounded-none text-white">
                    {/* Top Red Accent Line */}
                    <div className="h-[2px] w-full bg-[#FF001E] -mt-2 mb-2" />

                    <div className="py-1">
                      {displayedCategories.map((category) => (
                        <Link
                          key={category.id}
                          href={`/collections?category=${encodeURIComponent(category.slug)}`}
                          onClick={() => setCategoriesDropdownOpen(false)}
                          style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
                          className="flex items-center justify-between px-3.5 py-2.5 text-[15px] font-medium text-neutral-200 hover:text-[#FF001E] hover:bg-white/5 hover:pl-4 transition-all group/item uppercase tracking-wider"
                        >
                          <span>{category.name}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#FF001E] opacity-0 -translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all" />
                        </Link>
                      ))}
                    </div>

                    {/* View All Collections Footer Link */}
                    <div className="pt-2 mt-1 border-t border-white/10">
                      <Link
                        href="/collections"
                        onClick={() => setCategoriesDropdownOpen(false)}
                        style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
                        className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-widest text-[#FF001E] hover:bg-[#FF001E]/10 transition-colors"
                      >
                        <span>View All Collections</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Custom Jerseys */}
              <Link
                href="/custom-jerseys"
                style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
                className={cn(
                  'text-[17px] font-medium tracking-wide transition-colors whitespace-nowrap',
                  pathname === '/custom-jerseys'
                    ? 'text-[#FF001E] font-bold'
                    : 'text-neutral-300 hover:text-white'
                )}
              >
                Custom Jerseys
              </Link>

              {/* About */}
              <Link
                href="/about"
                style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
                className={cn(
                  'text-[17px] font-medium tracking-wide transition-colors whitespace-nowrap',
                  pathname === '/about'
                    ? 'text-[#FF001E] font-bold'
                    : 'text-neutral-300 hover:text-white'
                )}
              >
                About
              </Link>

              {/* Contact */}
              <Link
                href="/contact"
                style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
                className={cn(
                  'text-[17px] font-medium tracking-wide transition-colors whitespace-nowrap',
                  pathname === '/contact'
                    ? 'text-[#FF001E] font-bold'
                    : 'text-neutral-300 hover:text-white'
                )}
              >
                Contact
              </Link>
            </nav>

            {/* Right: Search Icon + Cart Icon */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Search Icon Button */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Search Catalog"
                className="p-2.5 rounded-none active:scale-95 transition-all cursor-pointer text-white/85 hover:text-white hover:bg-white/10"
                title="Search Products"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Cart Icon Button with Counter Badge */}
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                aria-label="View Cart"
                className="relative p-2.5 rounded-none active:scale-95 transition-all cursor-pointer text-white/85 hover:text-white hover:bg-white/10"
                title="Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {totalCartCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-[#FF001E] rounded-full shadow-md">
                    {totalCartCount}
                  </span>
                )}
              </button>

              {/* Mobile Navigation Menu Toggle */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2.5 rounded-none active:scale-95 transition-all cursor-pointer ml-1 text-white/85 hover:text-white hover:bg-white/10"
                aria-label="Open Navigation Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ===================== SIDE NAVIGATION DRAWER (DESKTOP & MOBILE) ===================== */}
      <div
        className={cn(
          'fixed inset-0 z-[85] transition-[opacity,visibility] duration-300',
          mobileMenuOpen ? 'visible opacity-100' : 'pointer-events-none invisible opacity-0'
        )}
        aria-hidden={!mobileMenuOpen}
      >
        {/* Backdrop overlay */}
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        />

        {/* Sliding Drawer from Right */}
        <div
          className={cn(
            'absolute inset-y-0 right-0 w-[300px] sm:w-[340px] max-w-[85vw] bg-[#080A0F] border-l border-white/10 shadow-2xl flex flex-col h-full overflow-hidden transition-transform duration-300 ease-in-out',
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          {/* Drawer Top Header */}
          <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 bg-[#080A0F] border-b border-white/10">
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
              className="p-2 rounded-none text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links List (Scrollable) */}
          <nav className="flex-1 min-h-0 overflow-y-auto p-4 space-y-1 overscroll-contain">
            {navLinks.map((link) => {
              if (link.label === 'Categories') {
                const isActive = pathname.startsWith('/collections');
                return (
                  <div key={link.label} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Link
                        href="/collections"
                        onClick={() => setMobileMenuOpen(false)}
                        style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
                        className={cn(
                          'flex-1 flex items-center justify-between px-4 py-3 rounded-none text-base font-semibold tracking-wider transition-all uppercase',
                          isActive
                            ? 'bg-[#FF001E]/10 text-[#FF001E] font-bold border-l-2 border-[#FF001E]'
                            : 'text-neutral-200 hover:bg-white/5 hover:text-white'
                        )}
                      >
                        <span>Categories</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
                        className="p-3 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                        aria-label="Toggle categories list"
                      >
                        <ChevronDown
                          className={cn(
                            'w-4 h-4 transition-transform duration-200',
                            mobileCategoriesOpen && 'rotate-180 text-[#FF001E]'
                          )}
                        />
                      </button>
                    </div>

                    {mobileCategoriesOpen && (
                      <div className="pl-4 pr-2 py-1 space-y-1 border-l-2 border-white/10 ml-4">
                        {displayedCategories.map((cat) => (
                          <Link
                            key={cat.id}
                            href={`/collections?category=${encodeURIComponent(cat.slug)}`}
                            onClick={() => setMobileMenuOpen(false)}
                            style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
                            className="block px-3 py-2 text-sm font-medium text-neutral-300 hover:text-[#FF001E] hover:bg-white/5 rounded-none transition-all uppercase tracking-wide"
                          >
                            {cat.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
                  className={cn(
                    'flex items-center justify-between px-4 py-3 rounded-none text-base font-semibold tracking-wider transition-all uppercase',
                    isActive
                      ? 'bg-[#FF001E]/10 text-[#FF001E] font-bold border-l-2 border-[#FF001E]'
                      : 'text-neutral-200 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <span>{link.label}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FF001E]" />}
                </Link>
              );
            })}

            <div className="pt-3 my-2 space-y-1.5 border-t border-white/10">
              {/* Cart in Drawer */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setCartOpen(true);
                }}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-none text-sm font-semibold tracking-wide text-neutral-200 hover:bg-white/5 hover:text-white transition-all group"
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-4 h-4 text-[#FF001E] group-hover:scale-110 transition-transform" />
                  <span>My Cart</span>
                </div>
                {totalCartCount > 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#FF001E] text-white">
                    {totalCartCount}
                  </span>
                ) : (
                  <span className="text-xs text-neutral-400 font-mono">0</span>
                )}
              </button>

              {/* Wishlist in Drawer */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setWishlistOpen(true);
                }}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-none text-sm font-semibold tracking-wide text-neutral-200 hover:bg-white/5 hover:text-white transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-4 h-4 text-[#FF001E] group-hover:scale-110 transition-transform" />
                  <span>My Wishlist</span>
                </div>
                {totalWishlistCount > 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#FF001E] text-white">
                    {totalWishlistCount}
                  </span>
                ) : (
                  <span className="text-xs text-neutral-400 font-mono">0</span>
                )}
              </button>
            </div>
          </nav>

          {/* Full-size Bottom on Menubar (Always Visible / Sticky Bottom) */}
          <div className="flex-shrink-0 p-4 bg-[#080A0F] border-t border-white/10">
            {/* WhatsApp Enquiry Button */}
            <a
              href={`https://wa.me/${(company?.whatsapp_number || '919876543210').replace(/\D/g, '')}?text=${encodeURIComponent('Hi DFD Sports, I would like to inquire about your products.')}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3.5 px-4 rounded-none bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Enquiry</span>
            </a>
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
          className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        />

        {/* Sliding Panel */}
        <div
          className={cn(
            'absolute inset-y-0 right-0 w-full max-w-md bg-[#080A0F] border-l border-white/10 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out',
            cartOpen ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 bg-[#121622] border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-none bg-neutral-800 text-[#FF001E]">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-wider uppercase" style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}>
                  Your Cart
                </h2>
                <p className="text-xs text-neutral-400 font-medium">
                  {totalCartCount} {totalCartCount === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setCartOpen(false)}
              className="p-2 rounded-none text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-3 bg-[#080A0F]">
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-none bg-[#0E121B] border border-white/10 flex gap-3.5 shadow-sm hover:border-white/20 transition-all text-white"
                >
                  {/* Thumbnail */}
                  <div className="relative w-16 h-16 bg-neutral-900 border border-white/10 overflow-hidden shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain p-1"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400">
                        <Tag className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={() => setCartOpen(false)}
                      style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
                      className="text-sm font-bold text-white hover:text-[#FF001E] transition-colors line-clamp-2 uppercase tracking-wide"
                    >
                      {item.name}
                    </Link>

                    {item.size ? (
                      <p className="mt-1 text-xs text-neutral-400 flex items-center gap-1.5">
                        <span>Size:</span>
                        <span className="font-bold text-white px-1.5 py-0.5 rounded-none bg-white/10 border border-white/15 uppercase text-[11px]">
                          {item.size}
                        </span>
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-neutral-400 flex items-center gap-1.5">
                        <span>Size:</span>
                        <span className="font-medium text-neutral-300 px-1.5 py-0.5 rounded-none bg-white/10 border border-white/15 uppercase text-[11px]">
                          Standard
                        </span>
                      </p>
                    )}

                    <div className="mt-2.5 flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center rounded-none bg-white/5 border border-white/15">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 text-neutral-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          max="999"
                          value={item.quantity}
                          onChange={(e) => setQuantity(item.id, parseInt(e.target.value) || 1)}
                          className="w-10 text-center bg-transparent text-xs font-bold text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          aria-label="Quantity"
                        />
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 text-neutral-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Price & Remove */}
                      <div className="flex items-center gap-3">
                        {item.price != null && (
                          <div className="text-right">
                            <span className="text-sm font-bold text-white" style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}>
                              ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                            </span>
                            {item.quantity > 1 && (
                              <span className="block text-[10px] text-neutral-400 font-medium">
                                (₹{item.price.toLocaleString('en-IN')} ea)
                              </span>
                            )}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeCartItem(item.id)}
                          className="p-1 text-neutral-400 hover:text-[#FF001E] hover:bg-white/10 rounded-none transition-colors cursor-pointer"
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
              <div className="py-16 flex flex-col items-center justify-center text-center bg-[#0E121B] border border-white/10 p-8">
                <div className="w-16 h-16 rounded-none bg-neutral-900 flex items-center justify-center text-neutral-400 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-white mb-1 uppercase tracking-wider" style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}>
                  Your cart is empty
                </h3>
                <p className="text-xs text-neutral-400 max-w-xs mb-6">
                  Explore tournament equipment, jerseys, and custom sports gear.
                </p>
                <Link
                  href="/collections"
                  onClick={() => setCartOpen(false)}
                  style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
                  className="px-6 py-2.5 rounded-none bg-[#FF001E] hover:bg-[#d6001a] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md"
                >
                  Explore Collections
                </Link>
              </div>
            )}
          </div>

          {/* Cart Footer */}
          {cartItems.length > 0 && (
            <div className="p-5 sm:p-6 bg-[#0E121B] border-t border-white/10 space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-neutral-400 uppercase tracking-wider text-xs">Subtotal</span>
                  <span className="font-bold text-lg text-white" style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}>
                    ₹{cartSubtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400">Shipping, taxes and custom print details finalized via WhatsApp checkout.</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCartOpen(false);
                  setCheckoutModalOpen(true);
                }}
                style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
                className="w-full py-3.5 px-4 rounded-none bg-[#FF001E] hover:bg-[#d6001a] text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 active:scale-[0.99] transition-all cursor-pointer"
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
          className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        />

        {/* Sliding Panel */}
        <div
          className={cn(
            'absolute inset-y-0 right-0 w-full max-w-md bg-[#080A0F] border-l border-white/10 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out',
            wishlistOpen ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 bg-[#121622] border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-none bg-amber-500/10 text-[#F5A623]">
                <Heart className="w-5 h-5 fill-[#F5A623]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-wider uppercase" style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}>
                  Your Wishlist
                </h2>
                <p className="text-xs text-neutral-400 font-medium">
                  {totalWishlistCount} {totalWishlistCount === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setWishlistOpen(false)}
              className="p-2 rounded-none text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close wishlist"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Wishlist Item List */}
          <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-3 bg-[#080A0F]">
            {wishlistItems.length > 0 ? (
              wishlistItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-none bg-[#0E121B] border border-white/10 flex gap-3.5 shadow-sm hover:border-white/20 transition-all text-white"
                >
                  {/* Thumbnail */}
                  <div className="relative w-16 h-16 bg-neutral-900 border border-white/10 overflow-hidden shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain p-1"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400">
                        <Tag className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={() => setWishlistOpen(false)}
                      style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
                      className="text-sm font-bold text-white hover:text-[#F5A623] transition-colors line-clamp-2 uppercase tracking-wide"
                    >
                      {item.name}
                    </Link>
                    {item.category && (
                      <span className="inline-block mt-1 text-[11px] font-medium text-neutral-400">
                        {item.category}
                      </span>
                    )}

                    <div className="mt-3 flex items-center justify-between">
                      {item.price != null && (
                        <span className="text-sm font-bold text-white" style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}>
                          ₹{item.price.toLocaleString('en-IN')}
                        </span>
                      )}

                      <div className="flex items-center gap-2 ml-auto">
                        <button
                          type="button"
                          onClick={() => moveToCart(item)}
                          style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
                          className="px-3 py-1.5 rounded-none bg-[#FF001E] hover:bg-[#d6001a] text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-sm"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Move to Cart</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => removeWishlistItem(item.id)}
                          className="p-1.5 text-neutral-400 hover:text-[#FF001E] hover:bg-white/10 rounded-none transition-colors"
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
              <div className="py-16 flex flex-col items-center justify-center text-center bg-[#0E121B] border border-white/10 p-8">
                <div className="w-16 h-16 rounded-none bg-neutral-900 flex items-center justify-center text-neutral-400 mb-4">
                  <Heart className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-white mb-1 uppercase tracking-wider" style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}>
                  Your wishlist is empty
                </h3>
                <p className="text-xs text-neutral-400 max-w-xs mb-6">
                  Save your favorite gear and sports equipment to view or purchase later.
                </p>
                <Link
                  href="/collections"
                  onClick={() => setWishlistOpen(false)}
                  style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
                  className="px-5 py-2.5 rounded-none bg-[#FF001E] hover:bg-[#d6001a] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md"
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
          className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        />

        {/* Search Dialog Container - Sharp Corners (Border Radius None) */}
        <div
          role="dialog"
          aria-label="Search catalog"
          className={cn(
            'relative w-full max-w-2xl bg-[#0E121B] border border-white/15 rounded-none shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ease-out transform text-white',
            searchOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-2 opacity-0'
          )}
        >
          {/* Main Search Input Form Header - Dark BG, Border Radius None */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-2.5 sm:gap-3 px-4 sm:px-6 py-3.5 sm:py-4 bg-[#0E121B] border-b border-white/10 rounded-none shrink-0"
          >
            {searchLoading ? (
              <Loader2 className="h-5 w-5 shrink-0 animate-spin text-[#FF001E]" />
            ) : (
              <Search className="h-5 w-5 shrink-0 text-[#FF001E]" />
            )}
            <input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search footballs, custom jerseys, cricket, equipment…"
              className="w-full bg-transparent text-sm sm:text-base font-semibold text-white placeholder:text-neutral-500 focus:outline-none rounded-none"
              autoComplete="off"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  searchInputRef.current?.focus();
                }}
                className="text-xs text-neutral-300 hover:text-white px-2.5 py-1 rounded-none bg-white/10 hover:bg-white/20 transition-colors shrink-0 cursor-pointer font-medium"
                aria-label="Clear query"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSearchOpen(false);
              }}
              className="p-1.5 sm:p-2 rounded-none text-neutral-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
              aria-label="Close search"
              title="Close search"
            >
              <X className="w-5 h-5" />
            </button>
          </form>

          {/* Search Content Body (Only displays when user types a query) */}
          {searchQuery.trim().length > 0 && (
            <div className="max-h-[60vh] overflow-y-auto overscroll-contain bg-[#0E121B] animate-in fade-in duration-200">
              {searchLoading ? (
                <div className="px-5 py-12 flex flex-col items-center justify-center gap-3 text-neutral-400 text-sm bg-[#0E121B]">
                  <Loader2 className="w-7 h-7 animate-spin text-[#FF001E]" />
                  <span>Searching catalog products…</span>
                </div>
              ) : searchResults.length > 0 ? (
                <>
                  <div className="px-5 py-2.5 flex items-center justify-between bg-white/5 border-b border-white/10">
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-400" style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}>
                      Matching Products ({searchResults.length})
                    </p>
                  </div>

                  <ul className="divide-y divide-white/10">
                    {searchResults.map((p, idx) => {
                      const isSelected = selectedIndex === idx;
                      return (
                        <li key={p.id}>
                          <Link
                            href={`/products/${p.slug}`}
                            onClick={() => setSearchOpen(false)}
                            className={cn(
                              'flex items-center gap-3.5 px-4 sm:px-5 py-3.5 transition-colors group',
                              isSelected ? 'bg-white/10' : 'hover:bg-white/5'
                            )}
                          >
                            <div className="relative h-13 w-13 sm:h-14 sm:w-14 rounded-none bg-neutral-900 overflow-hidden shrink-0 border border-white/10">
                              {p.image_url ? (
                                <Image
                                  src={p.image_url}
                                  alt={p.name}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                  <Tag className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold text-white group-hover:text-[#FF001E] transition-colors truncate" style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}>
                                {p.name}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                {p.category?.name && (
                                  <span className="text-[10px] font-semibold text-neutral-300 bg-white/10 border border-white/15 px-2 py-0.5 rounded-none inline-block uppercase">
                                    {p.category.name}
                                  </span>
                                )}
                                {p.price != null && (
                                  <span className="text-xs font-bold text-[#FF001E]" style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}>
                                    ₹{p.price.toLocaleString('en-IN')}
                                  </span>
                                )}
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-[#FF001E] group-hover:translate-x-1 transition-all shrink-0" />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </>
              ) : (
                <div className="px-5 py-12 text-center bg-[#0E121B]">
                  <div className="w-12 h-12 rounded-none bg-white/5 flex items-center justify-center text-neutral-400 mx-auto mb-3">
                    <Search className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-bold text-white mb-1" style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}>
                    No products found for &ldquo;{searchQuery.trim()}&rdquo;
                  </p>
                  <p className="text-xs text-neutral-400 max-w-xs mx-auto mb-4 leading-relaxed">
                    Try searching with keywords like football, jersey, nivia, cricket or badminton.
                  </p>
                  <Link
                    href="/collections"
                    onClick={() => setSearchOpen(false)}
                    style={{ fontFamily: "var(--font-mohave), 'Mohave', sans-serif" }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-none bg-[#FF001E] hover:bg-[#d6001a] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
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