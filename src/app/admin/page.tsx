import React from 'react';
import Link from 'next/link';
import { getCompanySettings } from '@/services/company';
import { getAllCategories } from '@/services/categories';
import { getAllProducts } from '@/services/products';
import { getAllBrands } from '@/services/brands';
import { getEnquiries } from '@/services/enquiries';
import { getAllTeamwear } from '@/services/teamwear';
import { getOrders } from '@/services/orders';
import {
  Package,
  Layers,
  Tag,
  Mail,
  Shirt,
  ShoppingBag,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  Phone,
} from 'lucide-react';

export const revalidate = 0; // Always fresh for admin

export default async function AdminDashboardPage() {
  const [company, categories, products, brands, enquiries, teamwear, orders] = await Promise.all([
    getCompanySettings(),
    getAllCategories(),
    getAllProducts(),
    getAllBrands(),
    getEnquiries(),
    getAllTeamwear(),
    getOrders(),
  ]);

  const newOrders = orders.filter((o) => o.status === 'new').length;
  const newEnquiries = enquiries.filter((e) => e.status === 'new').length;
  const activeProducts = products.filter((p) => p.is_active).length;
  const activeCategories = categories.filter((c) => c.is_active).length;
  const activeBrands = brands.filter((b) => b.is_active).length;

  const isCompanyConfigured = company?.company_name && company?.whatsapp_number;

  const stats = [
    {
      label: 'WhatsApp Orders',
      value: orders.length,
      sub: `${newOrders} action needed`,
      icon: ShoppingBag,
      href: '/admin/orders',
      iconBg: 'bg-amber-100 text-amber-700',
      border: newOrders > 0 ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200',
      highlight: newOrders > 0,
    },
    {
      label: 'Total Products',
      value: products.length,
      sub: `${activeProducts} active in store`,
      icon: Package,
      href: '/admin/products',
      iconBg: 'bg-blue-100 text-blue-700',
      border: 'border-slate-200',
    },
    {
      label: 'Categories',
      value: categories.length,
      sub: `${activeCategories} active`,
      icon: Layers,
      href: '/admin/categories',
      iconBg: 'bg-purple-100 text-purple-700',
      border: 'border-slate-200',
    },
    {
      label: 'Enquiries',
      value: enquiries.length,
      sub: `${newEnquiries} unread`,
      icon: Mail,
      href: '/admin/enquiries',
      iconBg: 'bg-emerald-100 text-emerald-700',
      border: 'border-slate-200',
    },
  ];

  const quickActions = [
    { label: 'View Orders', href: '/admin/orders', icon: ShoppingBag, color: 'text-amber-600 bg-amber-50' },
    { label: 'Add Product', href: '/admin/products/new', icon: Package, color: 'text-blue-600 bg-blue-50' },
    { label: 'Add Category', href: '/admin/categories/new', icon: Layers, color: 'text-purple-600 bg-purple-50' },
    { label: 'Add Hero Slide', href: '/admin/hero/new', icon: TrendingUp, color: 'text-rose-600 bg-rose-50' },
    { label: 'Add Brand', href: '/admin/brands/new', icon: Tag, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Add Teamwear', href: '/admin/teamwear/new', icon: Shirt, color: 'text-emerald-600 bg-emerald-50' },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Dashboard Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome to DFD Sports administration. Monitor orders, update catalogue, and track leads.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-sm transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Orders ({orders.length})</span>
          </Link>
        </div>
      </div>

      {/* Company Setup Warning */}
      {!isCompanyConfigured && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 flex items-start gap-4 shadow-sm">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-900">Company Details Not Configured</p>
            <p className="text-xs text-amber-700 mt-1 leading-relaxed">
              Your company name, WhatsApp number, and other business information needs to be set up
              before the store displays properly to visitors.
            </p>
          </div>
          <Link
            href="/admin/company"
            className="shrink-0 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors shadow-sm"
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
            className={`group rounded-2xl p-6 bg-white border ${stat.border} shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 relative overflow-hidden`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.iconBg} font-bold`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
              <p className="text-sm font-bold text-slate-700 mt-1">{stat.label}</p>
              <p className={`text-xs mt-0.5 font-medium ${stat.highlight ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
                {stat.sub}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3.5">
          Quick Actions & Management
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-center transition-all group shadow-sm hover:shadow hover:-translate-y-0.5"
            >
              <div className={`w-11 h-11 rounded-xl ${action.color} flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm`}>
                <action.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Grid of Recent Orders and Recent Enquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Recent WhatsApp Orders</h2>
                <p className="text-xs text-slate-500">{orders.length} total orders recorded</p>
              </div>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex-1 divide-y divide-slate-100">
            {orders.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No orders recorded yet. Orders placed on product pages will show here.
              </div>
            ) : (
              orders.slice(0, 5).map((ord) => (
                <div key={ord.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-900 truncate">{ord.name}</p>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        ord.status === 'new'
                          ? 'bg-amber-100 text-amber-800'
                          : ord.status === 'confirmed'
                          ? 'bg-blue-100 text-blue-800'
                          : ord.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {ord.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {ord.product_name} • Qty: {ord.quantity || 1}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-mono text-slate-600 flex items-center gap-1 justify-end">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {ord.phone}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {new Date(ord.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Enquiries Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Recent Customer Enquiries</h2>
                <p className="text-xs text-slate-500">{enquiries.length} total inquiries received</p>
              </div>
            </div>
            <Link
              href="/admin/enquiries"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex-1 divide-y divide-slate-100">
            {enquiries.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No customer inquiries yet.
              </div>
            ) : (
              enquiries.slice(0, 5).map((enq) => (
                <div key={enq.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-900 truncate">{enq.name}</p>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        enq.status === 'new'
                          ? 'bg-amber-100 text-amber-800'
                          : enq.status === 'contacted'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {enq.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 capitalize truncate mt-0.5">
                      {enq.enquiry_type.replace('_', ' ')}: {enq.message || 'No additional message'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-mono text-slate-600">{enq.phone}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {new Date(enq.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
