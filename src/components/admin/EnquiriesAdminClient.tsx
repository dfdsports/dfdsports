'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Enquiry } from '@/types/database';
import { Mail, MessageCircle, Trash2, ChevronDown, ChevronUp, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateWhatsAppLink } from '@/lib/whatsapp';

interface EnquiriesAdminClientProps {
  enquiries: Enquiry[];
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-[#F5A623]/15 text-[#F5A623]',
  contacted: 'bg-blue-900/30 text-blue-300',
  completed: 'bg-emerald-900/30 text-emerald-300',
  archived: 'bg-white/5 text-gray-500',
};

export function EnquiriesAdminClient({ enquiries }: EnquiriesAdminClientProps) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isPending, startTransition] = useTransition();

  const handleStatusUpdate = async (id: string, status: string) => {
    const supabase = createClient();
    await supabase.from('enquiries').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this enquiry permanently?')) return;
    const supabase = createClient();
    await supabase.from('enquiries').delete().eq('id', id);
    router.refresh();
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
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-white">Customer Enquiries</h1>
        <p className="text-sm text-gray-400 mt-1">{enquiries.length} total enquiries from the website</p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {Object.entries(counts).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all',
              filterStatus === status
                ? 'bg-[#F5A623] text-[#080A0F]'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            )}
          >
            {status === 'all' ? 'All' : status} ({count})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-[#0E121B] border border-white/5 p-12 text-center">
          <Mail className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No {filterStatus !== 'all' ? filterStatus : ''} Enquiries</h3>
          <p className="text-sm text-gray-400">Enquiries submitted from the website will appear here.</p>
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
              <div key={enq.id} className={cn('rounded-2xl bg-[#0E121B] border transition-all', enq.status === 'new' ? 'border-[#F5A623]/20' : 'border-white/5')}>
                {/* Row Header */}
                <div
                  className="flex items-center gap-4 px-5 py-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : enq.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-bold text-white">{enq.name}</span>
                      <span className={cn('px-2 py-0.5 rounded-md text-[11px] font-bold', STATUS_COLORS[enq.status] || 'bg-white/5 text-gray-400')}>
                        {enq.status}
                      </span>
                      <span className="text-xs text-gray-500 font-mono capitalize">{enq.enquiry_type?.replace('_', ' ')}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 font-mono">{enq.phone}</p>
                  </div>
                  <div className="text-xs text-gray-500 font-mono hidden sm:block shrink-0">
                    {new Date(enq.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />}
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-white/5 pt-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      {enq.email && (
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-0.5">Email</p>
                          <p className="text-gray-300">{enq.email}</p>
                        </div>
                      )}
                      {enq.product_name && (
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-0.5">Product / Service</p>
                          <p className="text-gray-300">{enq.product_name}</p>
                        </div>
                      )}
                      {enq.quantity && (
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-0.5">Quantity</p>
                          <p className="text-gray-300">{enq.quantity}</p>
                        </div>
                      )}
                      {enq.size_or_requirement && (
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-0.5">Requirement</p>
                          <p className="text-gray-300">{enq.size_or_requirement}</p>
                        </div>
                      )}
                      {enq.customization_details && (
                        <div className="sm:col-span-2">
                          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-0.5">Customization Details</p>
                          <p className="text-gray-300">{enq.customization_details}</p>
                        </div>
                      )}
                      {enq.message && (
                        <div className="sm:col-span-2">
                          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-0.5">Message</p>
                          <p className="text-gray-300 whitespace-pre-line">{enq.message}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-white/5">
                      {/* Status Update Buttons */}
                      {(['new', 'contacted', 'completed', 'archived'] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => handleStatusUpdate(enq.id, s)}
                          disabled={enq.status === s}
                          className={cn(
                            'px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
                            enq.status === s
                              ? 'bg-[#F5A623]/20 text-[#F5A623] cursor-default'
                              : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
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
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] text-xs font-bold transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Reply on WhatsApp</span>
                        </a>
                        <button
                          onClick={() => handleDelete(enq.id)}
                          className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-950/20 transition-colors"
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
