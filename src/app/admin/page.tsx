import React from 'react';
import Link from 'next/link';
import { getCompanySettings } from '@/services/company';
import { getActiveCategories, getAllCategories } from '@/services/categories';
import { getAllProducts } from '@/services/products';
import { getAllBrands } from '@/services/brands';
import { getEnquiries } from '@/services/enquiries';
import { getAllTeamwear } from '@/services/teamwear';
import {
  Package,
  Layers,
  Tag,
  Mail,
  Shirt,
  Building2,
  ArrowRight,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

export const revalidate = 0; // Always fresh for admin

export default async function AdminDashboardPage() {
  const [company, categories, products, brands, enquiries, teamwear] = await Promise.all([
    getCompanySettings(),
    getAllCategories(),
    getAllProducts(),
    getAllBrands(),
    getEnquiries(),
    getAllTeamwear(),
  ]);

  const newEnquiries = enquiries.filter((e) => e.status === 'new').length;
  const activeProducts = products.filter((p) => p.is_active).length;
  const activeCategories = categories.filter((c) => c.is_active).length;
  const activeBrands = brands.filter((b) => b.is_active).length;

  const isCompanyConfigured = company?.company_name && company?.whatsapp_number;

  const stats = [
    {
      label: 'Total Products',
      value: products.length,
      sub: `${activeProducts} active`,
      icon: Package,
      href: '/admin/products',
      color: 'text-blue-400',
    },
    {
      label: 'Categories',
      value: categories.length,
      sub: `${activeCategories} active`,
      icon: Layers,
      href: '/admin/categories',
      color: 'text-purple-400',
    },
    {
      label: 'Brands',
      value: brands.length,
      sub: `${activeBrands} active`,
      icon: Tag,
      href: '/admin/brands',
      color: 'text-emerald-400',
    },
    {
      label: 'New Enquiries',
      value: newEnquiries,
      sub: `${enquiries.length} total`,
      icon: Mail,
      href: '/admin/enquiries',
      color: newEnquiries > 0 ? 'text-[#F5A623]' : 'text-gray-400',
      highlight: newEnquiries > 0,
    },
  ];

  const quickActions = [
    { label: 'Add Product', href: '/admin/products/new', icon: Package },
    { label: 'Add Category', href: '/admin/categories/new', icon: Layers },
    { label: 'Add Hero Slide', href: '/admin/hero/new', icon: TrendingUp },
    { label: 'Add Brand', href: '/admin/brands/new', icon: Tag },
    { label: 'Add Teamwear', href: '/admin/teamwear/new', icon: Shirt },
    { label: 'View Enquiries', href: '/admin/enquiries', icon: Mail },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-white">
          Dashboard Overview
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Manage DFD Sports content, products, teamwear, and customer enquiries.
        </p>
      </div>

      {/* Company Setup Warning */}
      {!isCompanyConfigured && (
        <div className="rounded-2xl bg-amber-950/30 border border-amber-700/40 p-5 flex items-start gap-4">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-300">Company Details Not Configured</p>
            <p className="text-xs text-amber-400/80 mt-1">
              Your company name, WhatsApp number, and other business information needs to be set up
              before the website displays correctly.
            </p>
          </div>
          <Link
            href="/admin/company"
            className="shrink-0 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-colors"
          >
            Set Up Now
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className={`group rounded-2xl p-6 flex flex-col justify-between shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl ${
              stat.highlight
                ? 'bg-[#F5A623]/10 border border-[#F5A623]/20'
                : 'bg-[#0E121B] border border-white/5'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-gray-300 transition-colors" />
            </div>
            <div>
              <p className="text-3xl font-black text-white">{stat.value}</p>
              <p className="text-sm font-semibold text-gray-300 mt-0.5">{stat.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-[#0E121B] hover:bg-[#141924] border border-white/5 text-center transition-all group hover:-translate-y-0.5"
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 group-hover:bg-[#F5A623]/10 flex items-center justify-center text-gray-400 group-hover:text-[#F5A623] transition-colors">
                <action.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-gray-300 group-hover:text-white transition-colors">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Enquiries Preview */}
      {enquiries.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Recent Enquiries
            </h2>
            <Link href="/admin/enquiries" className="text-xs text-[#F5A623] hover:text-white transition-colors flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="rounded-2xl bg-[#0E121B] overflow-hidden border border-white/5">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-500">Name</th>
                    <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-500">Phone</th>
                    <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-500">Type</th>
                    <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-500">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {enquiries.slice(0, 5).map((enq) => (
                    <tr key={enq.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-white">{enq.name}</td>
                      <td className="px-5 py-3.5 text-gray-400 font-mono text-xs">{enq.phone}</td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-white/5 text-[11px] font-semibold text-gray-300 capitalize">
                          {enq.enquiry_type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                          enq.status === 'new'
                            ? 'bg-[#F5A623]/15 text-[#F5A623]'
                            : enq.status === 'contacted'
                            ? 'bg-blue-900/30 text-blue-300'
                            : enq.status === 'completed'
                            ? 'bg-emerald-900/30 text-emerald-300'
                            : 'bg-white/5 text-gray-400'
                        }`}>
                          {enq.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs font-mono">
                        {new Date(enq.created_at).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
