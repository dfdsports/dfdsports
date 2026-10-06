'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Order } from '@/services/orders';
import {
  ShoppingBag,
  Phone,
  MapPin,
  Package,
  Trash2,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Tag,
  Hash,
  Clock,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPhoneNumber } from '@/lib/whatsapp';

interface OrdersAdminClientProps {
  orders: Order[];
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; dot: string }
> = {
  new:       { label: 'New',       color: 'bg-amber-100 text-amber-900 border-amber-300',       dot: 'bg-amber-500' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-900 border-blue-300',          dot: 'bg-blue-500' },
  shipped:   { label: 'Shipped',   color: 'bg-purple-100 text-purple-900 border-purple-300',    dot: 'bg-purple-500' },
  delivered: { label: 'Delivered', color: 'bg-emerald-100 text-emerald-900 border-emerald-300', dot: 'bg-emerald-500' },
  cancelled: { label: 'Cancelled', color: 'bg-rose-100 text-rose-900 border-rose-300',          dot: 'bg-rose-500' },
};

const ALL_STATUSES = ['new', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const;

export function OrdersAdminClient({ orders }: OrdersAdminClientProps) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [, startTransition] = useTransition();

  const handleStatusUpdate = async (id: string, status: string) => {
    const supabase = createClient();
    await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    startTransition(() => router.refresh());
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this order record?')) return;
    const supabase = createClient();
    await supabase.from('orders').delete().eq('id', id);
    startTransition(() => router.refresh());
  };

  const filtered =
    filterStatus === 'all'
      ? orders
      : orders.filter((o) => o.status === filterStatus);

  const counts = {
    all: orders.length,
    new: orders.filter((o) => o.status === 'new').length,
    confirmed: orders.filter((o) => o.status === 'confirmed').length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <ShoppingBag className="w-7 h-7 text-amber-600" />
            WhatsApp Orders
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {orders.length} total customer orders • {counts.new} pending actions
          </p>
        </div>

        {/* Summary pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {ALL_STATUSES.map((s) => (
            <div
              key={s}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border shadow-xs',
                STATUS_CONFIG[s].color
              )}
            >
              <span className={cn('w-2 h-2 rounded-full', STATUS_CONFIG[s].dot)} />
              {STATUS_CONFIG[s].label}: {counts[s]}
            </div>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {(['all', ...ALL_STATUSES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border shadow-xs',
              filterStatus === s
                ? 'bg-amber-500 text-slate-950 border-amber-500 font-extrabold shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-slate-200'
            )}
          >
            {s === 'all' ? 'All Orders' : STATUS_CONFIG[s].label} ({s === 'all' ? counts.all : counts[s]})
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white border border-slate-200 p-16 text-center shadow-sm">
          <ShoppingBag className="w-14 h-14 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 mb-1">
            No {filterStatus !== 'all' ? STATUS_CONFIG[filterStatus]?.label : ''} Orders Found
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Orders placed via WhatsApp from the product pages will automatically show up here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const isExpanded = expandedId === order.id;
            const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.new;
            const phone = formatPhoneNumber(order.phone);
            const waReplyUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
              `Hi ${order.name}, this is DFD Sports. We have received your order for *${order.product_name}*. We will confirm the details shortly. Thank you!`
            )}`;

            return (
              <div
                key={order.id}
                className={cn(
                  'rounded-2xl bg-white border transition-all shadow-xs overflow-hidden',
                  order.status === 'new'
                    ? 'border-amber-400/80 ring-1 ring-amber-400/20'
                    : 'border-slate-200 hover:border-slate-300'
                )}
              >
                {/* Row Header */}
                <div
                  className="flex items-center gap-4 px-5 py-4 cursor-pointer select-none hover:bg-slate-50/70 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                >
                  {/* Status dot */}
                  <div className={cn('w-2.5 h-2.5 rounded-full shrink-0', cfg.dot)} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm truncate">{order.name}</span>
                      <span className={cn('px-2.5 py-0.5 rounded-md text-[11px] font-bold border', cfg.color)}>
                        {cfg.label}
                      </span>
                      {order.status === 'new' && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-900 border border-amber-400/40 px-2 py-0.5 rounded-full font-extrabold animate-pulse">
                          ACTION NEEDED
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      <span className="font-medium text-slate-700">{order.product_name}</span>
                      {order.category && <span className="text-slate-400"> • {order.category}</span>}
                      {order.quantity && (
                        <span className="text-slate-500"> • Qty: <strong className="text-slate-700">{order.quantity}</strong></span>
                      )}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-mono hidden sm:block">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-slate-100 bg-slate-50/60 pt-5 space-y-5">
                    {/* Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
                      <InfoRow icon={<Package className="w-4 h-4 text-amber-600" />} label="Product Name">
                        {order.product_name}
                      </InfoRow>
                      {order.category && (
                        <InfoRow icon={<Tag className="w-4 h-4 text-amber-600" />} label="Category">
                          {order.category}
                        </InfoRow>
                      )}
                      <InfoRow icon={<Hash className="w-4 h-4 text-amber-600" />} label="Quantity Requested">
                        {order.quantity ?? '1'}
                      </InfoRow>
                      <InfoRow icon={<Phone className="w-4 h-4 text-amber-600" />} label="Customer Phone">
                        <a href={`tel:${order.phone}`} className="text-blue-600 hover:underline font-mono font-medium">
                          {order.phone}
                        </a>
                      </InfoRow>
                      <InfoRow icon={<MapPin className="w-4 h-4 text-amber-600" />} label="Shipping Address" span>
                        {order.shipping_address}
                      </InfoRow>
                      <InfoRow icon={<Clock className="w-4 h-4 text-slate-400" />} label="Order Timestamp" span>
                        {new Date(order.created_at).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </InfoRow>
                    </div>

                    {/* Status Actions + Delete */}
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-1">
                        Update Status:
                      </span>
                      {ALL_STATUSES.map((s) => (
                        <button
                          key={s}
                          onClick={() => handleStatusUpdate(order.id, s)}
                          disabled={order.status === s}
                          className={cn(
                            'px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shadow-xs',
                            order.status === s
                              ? cn(STATUS_CONFIG[s].color, 'cursor-default ring-1 ring-black/5 font-extrabold')
                              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200'
                          )}
                        >
                          {STATUS_CONFIG[s].label}
                        </button>
                      ))}

                      <div className="ml-auto flex items-center gap-2">
                        <a
                          href={waReplyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Reply on WhatsApp
                        </a>
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
                          title="Delete order record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function InfoRow({
  icon,
  label,
  children,
  span,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  span?: boolean;
}) {
  return (
    <div className={span ? 'sm:col-span-2' : ''}>
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">{label}</p>
      </div>
      <p className="text-sm font-semibold text-slate-800 pl-5 leading-relaxed">{children}</p>
    </div>
  );
}
