'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Enquiry } from '@/types/database';
import { Mail, MessageCircle, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { AdminConfirmModal } from '@/components/admin/AdminConfirmModal';
import { AdminHeader } from '@/components/admin/AdminHeader';

interface EnquiriesAdminClientProps {
  enquiries: Enquiry[];
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; dot: string }
> = {
  new: { label: 'New', color: 'bg-amber-100 text-amber-900 border-amber-300', dot: 'bg-amber-500' },
  contacted: { label: 'Contacted', color: 'bg-blue-100 text-blue-900 border-blue-300', dot: 'bg-blue-500' },
  completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-900 border-emerald-300', dot: 'bg-emerald-500' },
  archived: { label: 'Archived', color: 'bg-slate-100 text-slate-700 border-slate-300', dot: 'bg-slate-400' },
};

const ALL_STATUSES = ['new', 'contacted', 'completed', 'archived'] as const;

export function EnquiriesAdminClient({ enquiries }: EnquiriesAdminClientProps) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [enquiryToDelete, setEnquiryToDelete] = useState<Enquiry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleStatusUpdate = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const supabase = createClient();
      await supabase
        .from('enquiries')
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
    if (!enquiryToDelete) return;
    setIsDeleting(true);
    try {
      const supabase = createClient();
      await supabase.from('enquiries').delete().eq('id', enquiryToDelete.id);
      setEnquiryToDelete(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
      startTransition(() => router.refresh());
    }
  };

  const filtered = filterStatus === 'all' ? enquiries : enquiries.filter((e) => e.status === filterStatus);

  const counts = {
    all: enquiries.length,
    new: enquiries.filter((e) => e.status === 'new').length,
    contacted: enquiries.filter((e) => e.status === 'contacted').length,
    completed: enquiries.filter((e) => e.status === 'completed').length,
    archived: enquiries.filter((e) => e.status === 'archived').length,
  };

  return (
    <div className="space-y-6">
      {/* Common Reusable Admin Header with Shadow */}
      <AdminHeader
        title="Customer Enquiries"
        icon={Mail}
        description={`${enquiries.length} total website inquiries • ${counts.new} pending actions`}
      />

      {/* Box Type Status KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {[
          { key: 'all', label: 'All Enquiries', count: counts.all, dot: 'bg-slate-400' },
          { key: 'new', label: 'New', count: counts.new, dot: 'bg-red-500', badge: counts.new > 0 ? `${counts.new} Action` : undefined },
          { key: 'contacted', label: 'Contacted', count: counts.contacted, dot: 'bg-blue-500' },
          { key: 'completed', label: 'Completed', count: counts.completed, dot: 'bg-emerald-500' },
          { key: 'archived', label: 'Archived', count: counts.archived, dot: 'bg-slate-400' },
        ].map((card) => {
          const isSelected = filterStatus === card.key;
          return (
            <button
              key={card.key}
              type="button"
              onClick={() => setFilterStatus(card.key)}
              className={cn(
                'p-3.5 sm:p-4 rounded-xl text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between group border-0',
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

      {filtered.length === 0 ? (
        <div className="rounded-xl bg-white p-16 text-center shadow-sm border-0">
          <Mail className="w-14 h-14 text-black/20 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-black mb-1">
            No {filterStatus !== 'all' ? STATUS_CONFIG[filterStatus]?.label : ''} Enquiries Found
          </h3>
          <p className="text-sm text-black/60 max-w-md mx-auto">
            Customer questions submitted from contact forms will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((enq) => {
            const isExpanded = expandedId === enq.id;
            const cfg = STATUS_CONFIG[enq.status] ?? STATUS_CONFIG.new;
            const waUrl = generateWhatsAppLink({
              phoneNumber: enq.phone,
              customMessage: `Hi ${enq.name}, this is DFD Sports. Following up on your enquiry about ${enq.product_name || enq.enquiry_type}. How can we help you?`,
            });

            return (
              <div
                key={enq.id}
                className="rounded-xl bg-white shadow-xs overflow-hidden border-0"
              >
                {/* Row Header */}
                <div
                  className="flex items-center gap-3 sm:gap-4 px-4 py-3.5 sm:px-5 sm:py-4 cursor-pointer select-none hover:bg-slate-50/70 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : enq.id)}
                >
                  {/* Status dot */}
                  <div className={cn('w-2.5 h-2.5 rounded-full shrink-0', cfg.dot)} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                      <span className="font-bold text-black text-sm truncate">{enq.name}</span>
                      <span className={cn('px-2.5 py-0.5 rounded-xl text-[11px] font-bold border-0', cfg.color)}>
                        {cfg.label}
                      </span>
                      {enq.enquiry_type && (
                        <span className="text-xs text-black/60 font-medium capitalize bg-slate-100 px-2 py-0.5 rounded-xl">
                          {enq.enquiry_type.replace('_', ' ')}
                        </span>
                      )}
                      {enq.status === 'new' && (
                        <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-xl font-bold animate-pulse">
                          ACTION NEEDED
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-black/60 mt-0.5 truncate">
                      <span className="font-mono text-black">{enq.phone}</span>
                      {enq.email && <span className="text-black/40"> • {enq.email}</span>}
                      {enq.product_name && <span className="text-black/60"> • {enq.product_name}</span>}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-2.5 sm:gap-3">
                    {/* Status Update Dropdown at End */}
                    <div
                      className="relative inline-flex items-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <select
                        value={enq.status}
                        disabled={updatingId === enq.id}
                        onChange={(e) => handleStatusUpdate(enq.id, e.target.value)}
                        className={cn(
                          'appearance-none text-xs font-bold pl-3 pr-7 py-1.5 rounded-xl border-0 bg-slate-100 hover:bg-slate-200 text-black cursor-pointer transition-all shadow-2xs focus:outline-none focus:ring-2 focus:ring-red-500/20',
                          updatingId === enq.id && 'opacity-60 cursor-not-allowed'
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
                      {new Date(enq.created_at).toLocaleDateString('en-IN', {
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
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 bg-slate-50/60 pt-4 sm:pt-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm bg-white p-3.5 sm:p-4 rounded-xl shadow-xs border-0">
                      {enq.email && (
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-black mb-0.5">Email Address</p>
                          <p className="text-black font-medium">{enq.email}</p>
                        </div>
                      )}
                      {enq.product_name && (
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-black mb-0.5">Product / Service</p>
                          <p className="text-black font-medium">{enq.product_name}</p>
                        </div>
                      )}
                      {enq.quantity && (
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-black mb-0.5">Quantity</p>
                          <p className="text-black font-medium">{enq.quantity}</p>
                        </div>
                      )}
                      {enq.size_or_requirement && (
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-black mb-0.5">Requirement Details</p>
                          <p className="text-black font-medium">{enq.size_or_requirement}</p>
                        </div>
                      )}
                      {enq.customization_details && (
                        <div className="sm:col-span-2">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-black mb-0.5">Customization Requirements</p>
                          <p className="text-black font-medium">{enq.customization_details}</p>
                        </div>
                      )}
                      {enq.message && (
                        <div className="sm:col-span-2">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-black mb-0.5">Customer Message</p>
                          <p className="text-black font-medium whitespace-pre-line leading-relaxed">{enq.message}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-black/60">
                          Update Status:
                        </span>
                        <div className="relative inline-flex items-center">
                          <select
                            value={enq.status}
                            disabled={updatingId === enq.id}
                            onChange={(e) => handleStatusUpdate(enq.id, e.target.value)}
                            className={cn(
                              'appearance-none text-xs font-bold pl-3 pr-7 py-1.5 rounded-xl border-0 cursor-pointer transition-all bg-slate-100 hover:bg-slate-200 text-black shadow-2xs focus:outline-none focus:ring-2 focus:ring-red-500/30',
                              updatingId === enq.id && 'opacity-60 cursor-not-allowed'
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
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer text-center"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Reply on WhatsApp</span>
                        </a>
                        <button
                          onClick={() => setEnquiryToDelete(enq)}
                          className="p-2.5 rounded-xl text-black/40 hover:text-red-600 hover:bg-red-50 bg-slate-100 transition-colors cursor-pointer shrink-0 border-0"
                          title="Delete enquiry"
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
        isOpen={Boolean(enquiryToDelete)}
        onClose={() => setEnquiryToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Enquiry"
        description={
          enquiryToDelete
            ? `Are you sure you want to permanently delete the enquiry from "${enquiryToDelete.name}" (${enquiryToDelete.phone || enquiryToDelete.email || 'customer'})? This action cannot be undone.`
            : 'Are you sure you want to delete this enquiry?'
        }
        confirmText="Delete Enquiry"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
