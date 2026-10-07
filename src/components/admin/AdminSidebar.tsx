'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  LayoutDashboard,
  Building2,
  Image as ImageIcon,
  Layers,
  Package,
  Tag,
  Shirt,
  Gauge,
  Mail,
  ShoppingBag,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  exact?: boolean;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Main',
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    title: 'Sales & Inquiries',
    items: [
      { label: 'Orders', href: '/admin/orders', icon: ShoppingBag, badge: 'Live' },
      { label: 'Enquiries', href: '/admin/enquiries', icon: Mail },
    ],
  },
  {
    title: 'Catalog Management',
    items: [
      { label: 'Products', href: '/admin/products', icon: Package },
      { label: 'Categories', href: '/admin/categories', icon: Layers },
      { label: 'Brands', href: '/admin/brands', icon: Tag },
    ],
  },
  {
    title: 'Customization & Tech',
    items: [
      { label: 'Fabrics & Tech', href: '/admin/fabrics', icon: Gauge },
      { label: 'Highlights', href: '/admin/highlights', icon: Gauge },
    ],
  },
  {
    title: 'Store Settings',
    items: [
      { label: 'Hero Banners', href: '/admin/hero', icon: ImageIcon },
      { label: 'Company Details', href: '/admin/company', icon: Building2 },
      { label: 'Why Choose Us', href: '/admin/why-choose-us', icon: ShieldCheck },
    ],
  },
];

import { AdminConfirmModal } from '@/components/admin/AdminConfirmModal';

interface AdminSidebarProps {
  userEmail?: string;
}

interface SidebarContentProps {
  pathname: string;
  userEmail?: string;
  onItemClick?: () => void;
  onLogoutRequest: () => void;
  loggingOut: boolean;
}

function SidebarContent({
  pathname,
  userEmail,
  onItemClick,
  onLogoutRequest,
  loggingOut,
}: SidebarContentProps) {
  const isActive = (item: NavItem) => {
    const normPath = (pathname || '').replace(/\/$/, '') || '/';
    const normHref = item.href.replace(/\/$/, '') || '/';
    if (item.exact) return normPath === normHref;
    return normPath === normHref || normPath.startsWith(normHref + '/');
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#0F172A] via-[#131E35] to-[#0A1020] text-white border-r border-slate-800 shadow-2xl">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80">
        <Link href="/admin" prefetch={true} className="flex flex-col group">
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold uppercase tracking-tight text-white group-hover:text-amber-400 transition-colors">
              DFD Sports
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              PRO
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">Admin Management</p>
        </Link>
      </div>

      {/* Navigation with Section Headings */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto custom-scrollbar">
        {navSections.map((section, sIdx) => (
          <div key={section.title} className="space-y-1">
            {/* Section Heading */}
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-400/80 flex items-center justify-between">
              <span>{section.title}</span>
              {sIdx === 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </div>

            {/* Section Items */}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    onClick={onItemClick}
                    className={cn(
                      'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all relative',
                      active
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-4 h-4 shrink-0 transition-transform group-hover:scale-110',
                        active ? 'text-slate-950' : 'text-slate-400 group-hover:text-amber-400'
                      )}
                    />
                    <span className="truncate">{item.label}</span>

                    {item.badge && !active && (
                      <span className="ml-auto px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        {item.badge}
                      </span>
                    )}

                    {active && (
                      <ChevronRight className="w-3.5 h-3.5 ml-auto text-slate-950 shrink-0" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Section */}
      <div className="p-3 border-t border-slate-800/80 space-y-2 bg-[#0a0f1d]/60">
        <Link
          href="/"
          target="_blank"
          prefetch={false}
          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 transition-all border border-slate-800"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            <span>View Public Store</span>
          </span>
          <ChevronRight className="w-3 h-3 text-slate-500" />
        </Link>

        {/* User Card */}
        <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] text-slate-400 font-medium">Logged in</p>
            <p className="text-xs text-slate-200 font-bold truncate">
              {userEmail || 'Administrator'}
            </p>
          </div>
          <button
            type="button"
            onClick={onLogoutRequest}
            disabled={loggingOut}
            title="Sign Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-400/10 transition-colors shrink-0 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminSidebar({ userEmail }: AdminSidebarProps) {
  const pathname = usePathname() || '';
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    setShowLogoutConfirm(false);
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 fixed inset-y-0 left-0 z-30 overflow-hidden">
        <SidebarContent
          pathname={pathname}
          userEmail={userEmail}
          onLogoutRequest={() => setShowLogoutConfirm(true)}
          loggingOut={loggingOut}
        />
      </aside>

      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0F172A] border-b border-slate-800 sticky top-0 z-40">
        <Link href="/admin" prefetch={true} className="flex items-center gap-2">
          <span className="text-base font-extrabold uppercase text-white tracking-tight">DFD Sports</span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            PRO
          </span>
        </Link>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
          aria-label="Toggle admin menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm animate-in fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-72 h-full overflow-y-auto z-50 animate-in slide-in-from-left">
            <SidebarContent
              pathname={pathname}
              userEmail={userEmail}
              onItemClick={() => setMobileOpen(false)}
              onLogoutRequest={() => {
                setMobileOpen(false);
                setShowLogoutConfirm(true);
              }}
              loggingOut={loggingOut}
            />
          </aside>
        </div>
      )}

      {/* Sign Out Confirmation Modal */}
      <AdminConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Sign Out of Admin Portal"
        message="Are you sure you want to end your current session? You will need to log in again to access store management."
        confirmText="Sign Out"
        cancelText="Stay Logged In"
        variant="warning"
        icon="logout"
        isLoading={loggingOut}
      />
    </>
  );
}

