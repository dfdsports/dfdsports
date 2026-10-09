'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  ShieldCheck,
  Truck,
  Eye,
  EyeOff,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { PolicySection, PolicyType } from '@/types/database';
import { AdminModal } from '@/components/admin/AdminModal';
import { AdminConfirmModal } from '@/components/admin/AdminConfirmModal';
import { cn } from '@/lib/utils';

interface PoliciesAdminClientProps {
  initialPolicies: PolicySection[];
}

interface FormState {
  policy_type: PolicyType;
  heading: string;
  description: string;
  display_order: number;
  is_active: boolean;
}

const emptyForm = (type: PolicyType, nextOrder: number): FormState => ({
  policy_type: type,
  heading: '',
  description: '',
  display_order: nextOrder,
  is_active: true,
});

export function PoliciesAdminClient({ initialPolicies }: PoliciesAdminClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<PolicyType>('privacy_policy');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PolicySection | null>(null);
  const [itemToDelete, setItemToDelete] = useState<PolicySection | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filter policies by currently selected tab
  const filteredPolicies = initialPolicies
    .filter((p) => p.policy_type === activeTab)
    .sort((a, b) => a.display_order - b.display_order);

  const privacyCount = initialPolicies.filter((p) => p.policy_type === 'privacy_policy').length;
  const deliveryCount = initialPolicies.filter((p) => p.policy_type === 'delivery_policy').length;

  const [form, setForm] = useState<FormState>(emptyForm(activeTab, filteredPolicies.length + 1));

  const openCreate = () => {
    setEditingItem(null);
    setForm(emptyForm(activeTab, filteredPolicies.length + 1));
    setError('');
    setShowModal(true);
  };

  const openEdit = (item: PolicySection) => {
    setEditingItem(item);
    setForm({
      policy_type: item.policy_type,
      heading: item.heading,
      description: item.description,
      display_order: item.display_order,
      is_active: item.is_active,
    });
    setError('');
    setShowModal(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.heading.trim()) {
      setError('Heading is required.');
      return;
    }
    if (!form.description.trim()) {
      setError('Description is required.');
      return;
    }

    setError('');
    startTransition(async () => {
      try {
        if (editingItem) {
          const res = await fetch('/api/policies', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: editingItem.id, ...form }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to update policy section');
        } else {
          const res = await fetch('/api/policies', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to create policy section');
        }

        setSuccessMsg(editingItem ? 'Section updated successfully.' : 'Section created successfully.');
        setShowModal(false);
        router.refresh();
        setTimeout(() => setSuccessMsg(''), 3000);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Save failed');
      }
    });
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    setError('');
    try {
      const res = await fetch(`/api/policies?id=${encodeURIComponent(itemToDelete.id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');

      setItemToDelete(null);
      setSuccessMsg('Section deleted successfully.');
      router.refresh();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async (item: PolicySection) => {
    try {
      const res = await fetch('/api/policies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, is_active: !item.is_active }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to toggle status');
      }
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const inputCls =
    'w-full px-4 py-3 rounded-xl bg-white text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm border border-slate-300 transition-all shadow-xs font-medium';
  const labelCls = 'block text-xs font-semibold uppercase tracking-wider text-black mb-2';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">
            Legal & Store Policies
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage headings and descriptions for Privacy Policy and Delivery Policy. All content is stored in the database and updates the public site live.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Link
            href={activeTab === 'privacy_policy' ? '/privacy-policy' : '/delivery-policy'}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:text-black hover:bg-slate-50 font-semibold text-xs sm:text-sm transition-colors shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-500" />
            <span>View Public Page</span>
          </Link>

          <button
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-sm shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Section
          </button>
        </div>
      </div>

      {/* Success / Error Alerts */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-sm shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800 text-sm shadow-xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit border border-slate-200/80">
        <button
          onClick={() => setActiveTab('privacy_policy')}
          className={cn(
            'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer',
            activeTab === 'privacy_policy'
              ? 'bg-white text-black shadow-sm'
              : 'text-slate-600 hover:text-black'
          )}
        >
          <ShieldCheck className="w-4 h-4 text-amber-500" />
          <span>Privacy Policy</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {privacyCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('delivery_policy')}
          className={cn(
            'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer',
            activeTab === 'delivery_policy'
              ? 'bg-white text-black shadow-sm'
              : 'text-slate-600 hover:text-black'
          )}
        >
          <Truck className="w-4 h-4 text-amber-500" />
          <span>Delivery Policy</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {deliveryCount}
          </span>
        </button>
      </div>

      {/* Policy Sections List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-black">
              {activeTab === 'privacy_policy' ? 'Privacy Policy Sections' : 'Delivery Policy Sections'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Arranged by display order. You can add, edit, or delete clauses anytime.
            </p>
          </div>
        </div>

        {filteredPolicies.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-black">No sections added yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                No policy clauses have been added for {activeTab === 'privacy_policy' ? 'Privacy Policy' : 'Delivery Policy'}. Click &quot;Add Section&quot; to add your first heading and description.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={openCreate}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold transition-all active:scale-95 cursor-pointer"
              >
                Add First Section
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredPolicies.map((section, idx) => (
              <div
                key={section.id}
                className={cn(
                  'p-4 sm:p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 transition-colors',
                  !section.is_active ? 'bg-slate-50/70 opacity-70' : 'hover:bg-slate-50/50'
                )}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {/* Order Badge */}
                  <span className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {section.display_order || idx + 1}
                  </span>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                        {section.heading}
                      </h3>
                      {!section.is_active && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                          Hidden
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line line-clamp-3">
                      {section.description}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0 self-end md:self-start pt-2 md:pt-0">
                  <button
                    onClick={() => handleToggleActive(section)}
                    title={section.is_active ? 'Hide from public view' : 'Make active'}
                    className="p-2 rounded-lg text-slate-500 hover:text-black hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    {section.is_active ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                  </button>

                  <button
                    onClick={() => openEdit(section)}
                    title="Edit Clause"
                    className="p-2 rounded-lg text-slate-500 hover:text-black hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4 text-blue-600" />
                  </button>

                  <button
                    onClick={() => setItemToDelete(section)}
                    title="Delete Clause"
                    className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 text-rose-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Section Modal */}
      <AdminModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingItem ? 'Edit Policy Section' : 'Add Policy Section'}
        subtitle={
          editingItem
            ? `Updating section for ${form.policy_type === 'privacy_policy' ? 'Privacy Policy' : 'Delivery Policy'}`
            : `Add a heading and description to ${form.policy_type === 'privacy_policy' ? 'Privacy Policy' : 'Delivery Policy'}`
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Policy Type Selector */}
          <div>
            <label className={labelCls}>Policy Page *</label>
            <select
              name="policy_type"
              value={form.policy_type}
              onChange={handleChange}
              className={inputCls}
              required
            >
              <option value="privacy_policy">Privacy Policy (/privacy-policy)</option>
              <option value="delivery_policy">Delivery Policy (/delivery-policy)</option>
            </select>
          </div>

          {/* Heading */}
          <div>
            <label className={labelCls}>Heading *</label>
            <input
              type="text"
              name="heading"
              value={form.heading}
              onChange={handleChange}
              placeholder="e.g. Information We Collect or Delivery Timelines"
              className={inputCls}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>Description *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={6}
              placeholder="Write the description content here. Multi-line paragraphs and spacing are preserved."
              className={inputCls}
              required
            />
          </div>

          {/* Display Order & Active */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Display Order</label>
              <input
                type="number"
                name="display_order"
                value={form.display_order}
                onChange={handleChange}
                min={0}
                className={inputCls}
              />
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                  className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-400"
                />
                <span className="text-sm font-bold text-slate-800">
                  Visible on public website
                </span>
              </label>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2.5 rounded-xl text-slate-600 hover:text-black font-semibold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isPending ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Section'}</span>
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Delete Confirmation Modal */}
      <AdminConfirmModal
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Policy Section"
        message={`Are you sure you want to delete "${itemToDelete?.heading}"? This will permanently remove it from the ${itemToDelete?.policy_type === 'privacy_policy' ? 'Privacy Policy' : 'Delivery Policy'}.`}
        confirmText="Delete Section"
        cancelText="Cancel"
        variant="danger"
        icon="trash"
        isLoading={isDeleting}
      />
    </div>
  );
}
