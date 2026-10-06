'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Enquiry } from '@/types/database';
import { Mail, MessageCircle, Trash2, ChevronDown, ChevronUp, Phone, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateWhatsAppLink } from '@/lib/whatsapp';

interface EnquiriesAdminClientProps {
  enquiries: Enquiry[];
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-amber-100 text-amber-900 border-amber-300',
  contacted: 'bg-blue-100 text-blue-900 border-blue-300',
  completed: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  archived: 'bg-slate-100 text-slate-700 border-slate-300',
};

export function EnquiriesAdminClient({ enquiries }: EnquiriesAdminClientProps) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [, startTransition] = useTransition();

  const handleStatusUpdate = async (id: string, status: string) => {
    const supabase = createClient();
    await supabase.from('enquiries').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    startTransition(() => router.refresh());
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this enquiry permanently?')) return;
    const supabase = createClient();
    await supabase.from('enquiries').delete().eq('id', id);
    startTransition(() => router.refresh());
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <Mail className="w-7 h-7 text-emerald-600" />
            Customer Enquiries
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {enquiries.length} total website inquiries • {counts.new} new
          </p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {Object.entries(counts).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border shadow-xs',
              filterStatus === status
                ? 'bg-amber-500 text-slate-950 border-amber-500 font-extrabold shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-slate-200'
            )}
          >
            {status === 'all' ? 'All Enquiries' : status} ({count})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white border border-slate-200 p-16 text-center shadow-sm">
          <Mail className="w-14 h-14 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 mb-1">
            No {filterStatus !== 'all' ? filterStatus : ''} Enquiries Found
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Customer questions submitted from contact forms will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((enq) => {
            const isExpanded = expandedId === enq.id;
            const waUrl = generateWhatsAppLink({
              phoneNumber: enq.phone,
              customMessage: `Hi ${enq.name}, this is DFD Sports. Following up on your enquiry about ${enq.product_name || enq.enquiry_type}. How can we help you?`,
            });

            return (
              <div
                key={enq.id}
                className={cn(
                  'rounded-2xl bg-white border transition-all shadow-xs overflow-hidden',
                  enq.status === 'new'
                    ? 'border-amber-400/80 ring-1 ring-amber-400/20'
                    : 'border-slate-200 hover:border-slate-300'
                )}
              >
                {/* Row Header */}
                <div
                  className="flex items-center gap-4 px-5 py-4 cursor-pointer select-none hover:bg-slate-50/70 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : enq.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm">{enq.name}</span>
                      <span className={cn('px-2.5 py-0.5 rounded-md text-[11px] font-bold border uppercase', STATUS_COLORS[enq.status] || 'bg-slate-100 text-slate-700 border-slate-200')}>
                        {enq.status}
                      </span>
                      <span className="text-xs text-slate-500 font-medium capitalize bg-slate-100 px-2 py-0.5 rounded-md">
                        {enq.enquiry_type?.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 font-mono">{enq.phone}</p>
                  </div>
                  <div className="text-xs text-slate-400 font-mono hidden sm:block shrink-0">
                    {new Date(enq.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-slate-100 bg-slate-50/60 pt-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
                      {enq.email && (
                        <div>
                          <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-0.5">Email Address</p>
                          <p className="text-slate-800 font-medium">{enq.email}</p>
                        </div>
                      )}
                      {enq.product_name && (
                        <div>
                          <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-0.5">Product / Service</p>
                          <p className="text-slate-800 font-medium">{enq.product_name}</p>
                        </div>
                      )}
                      {enq.quantity && (
                        <div>
                          <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-0.5">Quantity</p>
                          <p className="text-slate-800 font-medium">{enq.quantity}</p>
                        </div>
                      )}
                      {enq.size_or_requirement && (
                        <div>
                          <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-0.5">Requirement Details</p>
                          <p className="text-slate-800 font-medium">{enq.size_or_requirement}</p>
                        </div>
                      )}
                      {enq.customization_details && (
                        <div className="sm:col-span-2">
                          <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-0.5">Customization Requirements</p>
                          <p className="text-slate-800 font-medium">{enq.customization_details}</p>
                        </div>
                      )}
                      {enq.message && (
                        <div className="sm:col-span-2">
                          <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-0.5">Customer Message</p>
                          <p className="text-slate-800 font-medium whitespace-pre-line leading-relaxed">{enq.message}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-1">
                        Mark status:
                      </span>
                      {(['new', 'contacted', 'completed', 'archived'] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => handleStatusUpdate(enq.id, s)}
                          disabled={enq.status === s}
                          className={cn(
                            'px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shadow-xs',
                            enq.status === s
                              ? cn(STATUS_COLORS[s], 'cursor-default ring-1 ring-black/5 font-extrabold')
                              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200'
                          )}
                        >
                          Mark {s}
                        </button>
                      ))}

                      <div className="ml-auto flex items-center gap-2">
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Reply on WhatsApp</span>
                        </a>
                        <button
                          onClick={() => handleDelete(enq.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
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
    </div>
  );
}
