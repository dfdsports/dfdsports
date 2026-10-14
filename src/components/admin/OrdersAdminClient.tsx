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
import { AdminHeader } from '@/components/admin/AdminHeader';

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
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleStatusUpdate = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const supabase = createClient();
      await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      startTransition(() => router.refresh());
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
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
      {/* Common Reusable Admin Header with Shadow */}
      <AdminHeader
        title="WhatsApp Orders"
        icon={ShoppingBag}
        description={`${orders.length} total customer orders • ${counts.new} pending actions`}
      />

      {/* Box Type Status KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {[
          { key: 'all', label: 'All Orders', count: counts.all, dot: 'bg-slate-400' },
          { key: 'new', label: 'New', count: counts.new, dot: 'bg-red-500', badge: counts.new > 0 ? `${counts.new} Action` : undefined },
          { key: 'confirmed', label: 'Confirmed', count: counts.confirmed, dot: 'bg-blue-500' },
          { key: 'shipped', label: 'Shipped', count: counts.shipped, dot: 'bg-purple-500' },
          { key: 'delivered', label: 'Delivered', count: counts.delivered, dot: 'bg-emerald-500' },
          { key: 'cancelled', label: 'Cancelled', count: counts.cancelled, dot: 'bg-rose-500' },
        ].map((card) => {
          const isSelected = filterStatus === card.key;
          return (
            <button
              key={card.key}
              type="button"
              onClick={() => setFilterStatus(card.key)}
              className={cn(
                'p-3.5 sm:p-4 rounded-xl text-left transition-all cursor-pointer relative overflow-hidden flex flex-col shadow-md justify-between group border-0',
                isSelected
                  ? 'bg-red-600 text-white shadow-md -translate-y-0.5'
                  : 'bg-white text-black hover:shadow-xs'
              )}
            >
              <div className="flex items-center justify-between gap-1.5 mb-2">
                <span className={cn('text-[11px] sm:text-xs font-bold uppercase tracking-wider truncate', isSelected ? 'text-white/80' : 'text-black/60')}>
                  {card.label}
                </span>
                <span className={cn('w-2.5 h-2.5 rounded-full shrink-0', isSelected ? 'bg-white' : card.dot)} />
              </div>

              <div className="flex items-baseline justify-between mt-1">
                <span className={cn('text-2xl sm:text-3xl font-extrabold tracking-tight', isSelected ? 'text-white' : 'text-black')}>
                  {card.count}
                </span>
                {card.badge && (
                  <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-xl shrink-0', isSelected ? 'bg-white/20 text-white' : 'text-red-600 bg-red-50')}>
                    {card.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      {filtered.length === 0 ? (
        <div className="rounded-xl bg-white p-16 text-center shadow-sm border-0">
          <ShoppingBag className="w-14 h-14 text-black/20 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-black mb-1">
            No {filterStatus !== 'all' ? STATUS_CONFIG[filterStatus]?.label : ''} Orders Found
          </h3>
          <p className="text-sm text-black/60 max-w-md mx-auto">
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
                className="rounded-xl bg-white shadow-xs overflow-hidden border-0"
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
                      <span className={cn('px-2.5 py-0.5 rounded-xl text-[11px] font-bold border-0', cfg.color)}>
                        {cfg.label}
                      </span>
                      {order.status === 'new' && (
                        <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-xl font-bold animate-pulse">
                          ACTION NEEDED
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-black/60 mt-0.5 truncate">
                      <span className="font-medium text-black">{order.product_name}</span>
                      {order.category && <span className="text-black/40"> • {order.category}</span>}
                      {order.quantity && (
                        <span className="text-black/60"> • Qty: <strong className="text-black">{order.quantity}</strong></span>
                      )}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-2.5 sm:gap-3">
                    {/* Status Update Dropdown at End */}
                    <div
                      className="relative inline-flex items-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <select
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        className={cn(
                          'appearance-none text-xs font-bold pl-3 pr-7 py-1.5 rounded-xl border-0 bg-slate-100 hover:bg-slate-200 text-black cursor-pointer transition-all shadow-2xs focus:outline-none focus:ring-2 focus:ring-red-500/20',
                          updatingId === order.id && 'opacity-60 cursor-not-allowed'
                        )}
                        title="Update Status"
                      >
                        {ALL_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_CONFIG[s].label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 absolute right-2 pointer-events-none text-black/40" />
                    </div>

                    <span className="text-xs text-black/40 font-mono hidden sm:block">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center text-black/60">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 bg-slate-50/60 pt-4 sm:pt-5 space-y-4 sm:space-y-5">
                    {/* Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 bg-white p-3.5 sm:p-4 rounded-xl shadow-xs border-0">
                      <InfoRow icon={<Package className="w-4 h-4 text-black" />} label="Product Name">
                        {order.product_name}
                      </InfoRow>
                      {order.category && (
                        <InfoRow icon={<Tag className="w-4 h-4 text-black" />} label="Category">
                          {order.category}
                        </InfoRow>
                      )}
                      <InfoRow icon={<Hash className="w-4 h-4 text-black" />} label="Quantity Requested">
                        {order.quantity ?? '1'}
                      </InfoRow>
                      <InfoRow icon={<Phone className="w-4 h-4 text-black" />} label="Customer Phone">
                        <a href={`tel:${order.phone}`} className="text-red-600 hover:underline font-mono font-medium">
                          {order.phone}
                        </a>
                      </InfoRow>
                      <InfoRow icon={<MapPin className="w-4 h-4 text-black" />} label="Shipping Address" span>
                        {order.shipping_address}
                      </InfoRow>
                      <InfoRow icon={<Clock className="w-4 h-4 text-black/40" />} label="Order Timestamp" span>
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
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-black/60">
                          Update Status:
                        </span>
                        <div className="relative inline-flex items-center">
                          <select
                            value={order.status}
                            disabled={updatingId === order.id}
                            onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                            className={cn(
                              'appearance-none text-xs font-bold pl-3 pr-7 py-1.5 rounded-xl border-0 cursor-pointer transition-all bg-slate-100 hover:bg-slate-200 text-black shadow-2xs focus:outline-none focus:ring-2 focus:ring-red-500/30',
                              updatingId === order.id && 'opacity-60 cursor-not-allowed'
                            )}
                          >
                            {ALL_STATUSES.map((s) => (
                              <option key={s} value={s} className="bg-white text-black font-medium">
                                {STATUS_CONFIG[s].label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 absolute right-2 pointer-events-none text-black/40" />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 sm:pt-0 sm:border-t-0">
                        <a
                          href={waReplyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer text-center"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Reply on WhatsApp</span>
                        </a>
                        <button
                          onClick={() => setOrderToDelete(order)}
                          className="p-2.5 rounded-xl text-black/40 hover:text-red-600 hover:bg-red-50 bg-slate-100 transition-colors cursor-pointer shrink-0 border-0"
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
