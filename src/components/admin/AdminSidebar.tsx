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
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Company Details', href: '/admin/company', icon: Building2 },
  { label: 'Hero Banners', href: '/admin/hero', icon: ImageIcon },
  { label: 'Categories', href: '/admin/categories', icon: Layers },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Brands', href: '/admin/brands', icon: Tag },
  { label: 'Custom Teamwear', href: '/admin/teamwear', icon: Shirt },
  { label: 'Fabrics', href: '/admin/fabrics', icon: Gauge },
  { label: 'Highlights', href: '/admin/highlights', icon: Gauge },
  { label: 'Why Choose Us', href: '/admin/why-choose-us', icon: ShieldCheck },
  { label: 'Enquiries', href: '/admin/enquiries', icon: Mail },
];

interface AdminSidebarProps {
  userEmail?: string;
}

export function AdminSidebar({ userEmail }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  const isActive = (item: { href: string; exact?: boolean }) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1E3A8A] to-[#F5A623] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-tight text-white">DFD Sports</p>
            <p className="text-[10px] text-gray-400 font-medium">Admin Portal</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                active
                  ? 'bg-[#F5A623]/10 text-[#F5A623] font-semibold'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              <item.icon className={cn('w-4 h-4 shrink-0', active ? 'text-[#F5A623]' : 'text-gray-500')} />
              <span>{item.label}</span>
              {active && <ChevronRight className="w-3 h-3 ml-auto text-[#F5A623]" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer: User info and logout */}
      <div className="p-4 border-t border-white/5 space-y-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
        >
          <ChevronRight className="w-3.5 h-3.5 rotate-180" />
          <span>View Public Website</span>
        </Link>

        <div className="px-3 py-3 rounded-xl bg-white/5">
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-0.5">
            Logged in as
          </p>
          <p className="text-xs text-white font-semibold truncate">{userEmail || 'Admin'}</p>
        </div>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <LogOut className="w-4 h-4 text-gray-500" />
          <span>{loggingOut ? 'Signing out...' : 'Sign Out'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-[#0B0E16] h-screen sticky top-0 overflow-hidden">
        <SidebarContent />
      </aside>

      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0B0E16] border-b border-white/5 sticky top-0 z-50">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#1E3A8A] to-[#F5A623] flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-black uppercase text-white">DFD Admin</span>
        </Link>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-gray-400 hover:text-white"
          aria-label="Toggle admin menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-72 bg-[#0B0E16] h-full overflow-y-auto z-50">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
