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
import { AdminConfirmModal } from '@/components/admin/AdminConfirmModal';

interface OrdersAdminClientProps {
  orders: Order[];
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; dot: string }
> = {
  new: { label: 'New', color: 'bg-amber-100 text-amber-900 border-amber-300', dot: 'bg-amber-500' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-900 border-blue-300', dot: 'bg-blue-500' },
  shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-900 border-purple-300', dot: 'bg-purple-500' },
  delivered: { label: 'Delivered', color: 'bg-emerald-100 text-emerald-900 border-emerald-300', dot: 'bg-emerald-500' },
  cancelled: { label: 'Cancelled', color: 'bg-rose-100 text-rose-900 border-rose-300', dot: 'bg-rose-500' },
};

const ALL_STATUSES = ['new', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const;

export function OrdersAdminClient({ orders }: OrdersAdminClientProps) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [, startTransition] = useTransition();

  const handleStatusUpdate = async (id: string, status: string) => {
    const supabase = createClient();
    await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    startTransition(() => router.refresh());
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;
    setIsDeleting(true);
    try {
      const supabase = createClient();
      await supabase.from('orders').delete().eq('id', orderToDelete.id);
      setOrderToDelete(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
      startTransition(() => router.refresh());
    }
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black flex items-center gap-3">
            <ShoppingBag className="w-7 h-7 text-amber-600" />
            WhatsApp Orders
          </h1>
          <p className="text-sm text-slate-600 mt-1">
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
                ? 'bg-amber-500 text-black border-amber-500 font-bold shadow-sm'
                : 'bg-white text-slate-700 hover:text-black hover:bg-slate-50 border-slate-200'
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
                  className="flex items-center gap-3 sm:gap-4 px-4 py-3.5 sm:px-5 sm:py-4 cursor-pointer select-none hover:bg-slate-50/70 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                >
                  {/* Status dot */}
                  <div className={cn('w-2.5 h-2.5 rounded-full shrink-0', cfg.dot)} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                      <span className="font-bold text-black text-sm truncate">{order.name}</span>
                      <span className={cn('px-2.5 py-0.5 rounded-md text-[11px] font-bold border', cfg.color)}>
                        {cfg.label}
                      </span>
                      {order.status === 'new' && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-900 border border-amber-400/40 px-2 py-0.5 rounded-full font-bold animate-pulse">
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

                  <div className="shrink-0 flex items-center gap-2 sm:gap-3">
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
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 border-t border-slate-100 bg-slate-50/60 pt-4 sm:pt-5 space-y-4 sm:space-y-5">
                    {/* Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-xs">
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

                    {/* Status Actions + Reply */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-1 w-full sm:w-auto">
                          Update Status:
                        </span>
                        {ALL_STATUSES.map((s) => (
                          <button
                            key={s}
                            onClick={() => handleStatusUpdate(order.id, s)}
                            disabled={order.status === s}
                            className={cn(
                              'px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shadow-xs cursor-pointer',
                              order.status === s
                                ? cn(STATUS_CONFIG[s].color, 'cursor-default ring-1 ring-black/5 font-bold')
                                : 'bg-white text-slate-700 hover:text-black hover:bg-slate-100 border-slate-200'
                            )}
                          >
                            {STATUS_CONFIG[s].label}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t border-slate-200/60 sm:border-t-0">
                        <a
                          href={waReplyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer text-center"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Reply on WhatsApp</span>
                        </a>
                        <button
                          onClick={() => setOrderToDelete(order)}
                          className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer shrink-0"
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

      {/* Delete Confirmation Modal */}
      <AdminConfirmModal
        isOpen={Boolean(orderToDelete)}
        onClose={() => setOrderToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Order Record"
        description={
          orderToDelete
            ? `Are you sure you want to permanently delete the order for "${orderToDelete.name}" (${orderToDelete.product_name})? This action cannot be undone.`
            : 'Are you sure you want to permanently delete this order record?'
        }
        confirmText="Delete Order"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
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
        <p className="text-[11px] font-semibold uppercase tracking-wider text-black">{label}</p>
      </div>
      <p className="text-sm font-semibold text-black pl-5 leading-relaxed">{children}</p>
    </div>
  );
}
