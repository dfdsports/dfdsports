'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { CompanySettings } from '@/types/database';

interface CompanyFormProps {
  initialData: CompanySettings | null;
}

export function CompanyForm({ initialData }: CompanyFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const [form, setForm] = useState({
    company_name: initialData?.company_name || '',
    full_name: initialData?.full_name || '',
    tagline: initialData?.tagline || '',
    short_description: initialData?.short_description || '',
    about_description: initialData?.about_description || '',
    phone: initialData?.phone || '',
    whatsapp_number: initialData?.whatsapp_number || '',
    email: initialData?.email || '',
    address: initialData?.address || '',
    google_maps_url: initialData?.google_maps_url || '',
    instagram_url: initialData?.instagram_url || '',
    facebook_url: initialData?.facebook_url || '',
    youtube_url: initialData?.youtube_url || '',
    twitter_url: initialData?.twitter_url || '',
    business_hours: initialData?.business_hours || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('idle');
    setErrorMsg('');

    startTransition(async () => {
      try {
        const supabase = createClient();

        if (initialData?.id) {
          // Update existing record
          const { error } = await supabase
            .from('company_settings')
            .update({ ...form, updated_at: new Date().toISOString() })
            .eq('id', initialData.id);

          if (error) throw error;
        } else {
          // Insert first record
          const { error } = await supabase.from('company_settings').insert([form]);
          if (error) throw error;
        }

        setSaveStatus('success');
        router.refresh();
        setTimeout(() => setSaveStatus('idle'), 3000);
      } catch (err: any) {
        setSaveStatus('error');
        setErrorMsg(err?.message || 'Failed to save company details');
      }
    });
  };

  const inputCls =
    'w-full px-4 py-3 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm border border-slate-200 transition-all shadow-xs';

  const labelCls = 'block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2';

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl">
      {saveStatus === 'success' && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-sm shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Company details saved successfully!</span>
        </div>
      )}
      {saveStatus === 'error' && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800 text-sm shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Basic Info */}
      <section className="rounded-2xl bg-white border border-slate-200 p-6 space-y-5 shadow-sm">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-100">Brand Identity</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelCls}>Company Short Name</label>
            <input name="company_name" value={form.company_name} onChange={handleChange} className={inputCls} placeholder="DFD SPORTS" required />
          </div>
          <div>
            <label className={labelCls}>Full Name</label>
            <input name="full_name" value={form.full_name} onChange={handleChange} className={inputCls} placeholder="Destination For Dreams" required />
          </div>
        </div>
        <div>
          <label className={labelCls}>Tagline</label>
          <input name="tagline" value={form.tagline} onChange={handleChange} className={inputCls} placeholder="Custom Teamwear & Premium Sports Equipment" />
        </div>
        <div>
          <label className={labelCls}>Short Description (used in Footer & Meta)</label>
          <textarea name="short_description" value={form.short_description} onChange={handleChange} rows={2} className={inputCls} placeholder="2–3 sentence overview of your business" />
        </div>
        <div>
          <label className={labelCls}>About Description (used on About page)</label>
          <textarea name="about_description" value={form.about_description} onChange={handleChange} rows={4} className={inputCls} placeholder="Full brand story and mission" />
        </div>
      </section>

      {/* Contact Details */}
      <section className="rounded-2xl bg-white border border-slate-200 p-6 space-y-5 shadow-sm">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-100">Contact Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelCls}>Phone Number</label>
            <input name="phone" value={form.phone} onChange={handleChange} className={inputCls} placeholder="+91 99999 99999" />
          </div>
          <div>
            <label className={labelCls}>WhatsApp Number <span className="text-amber-600">*</span></label>
            <input name="whatsapp_number" value={form.whatsapp_number} onChange={handleChange} className={inputCls} placeholder="919999999999 (without + sign, with country code)" />
            <p className="text-[11px] text-slate-400 mt-1">Format: 91XXXXXXXXXX (no +, no spaces). This number receives all WhatsApp orders & leads.</p>
          </div>
          <div>
            <label className={labelCls}>Email Address</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className={inputCls} placeholder="contact@dfdsports.com" />
          </div>
          <div>
            <label className={labelCls}>Business Hours</label>
            <input name="business_hours" value={form.business_hours} onChange={handleChange} className={inputCls} placeholder="Mon–Sat: 9:00 AM – 8:00 PM" />
          </div>
        </div>
        <div>
          <label className={labelCls}>Business Address</label>
          <textarea name="address" value={form.address} onChange={handleChange} rows={2} className={inputCls} placeholder="Full registered or operating address" />
        </div>
        <div>
          <label className={labelCls}>Google Maps URL</label>
          <input name="google_maps_url" value={form.google_maps_url} onChange={handleChange} className={inputCls} placeholder="https://maps.google.com/..." />
        </div>
      </section>

      {/* Social Media */}
      <section className="rounded-2xl bg-white border border-slate-200 p-6 space-y-5 shadow-sm">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 pb-2 border-b border-slate-100">Social Media Links</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelCls}>Instagram URL</label>
            <input name="instagram_url" value={form.instagram_url} onChange={handleChange} className={inputCls} placeholder="https://instagram.com/dfdsports" />
          </div>
          <div>
            <label className={labelCls}>Facebook URL</label>
            <input name="facebook_url" value={form.facebook_url} onChange={handleChange} className={inputCls} placeholder="https://facebook.com/dfdsports" />
          </div>
          <div>
            <label className={labelCls}>YouTube URL</label>
            <input name="youtube_url" value={form.youtube_url} onChange={handleChange} className={inputCls} placeholder="https://youtube.com/@dfdsports" />
          </div>
          <div>
            <label className={labelCls}>Twitter / X URL</label>
            <input name="twitter_url" value={form.twitter_url} onChange={handleChange} className={inputCls} placeholder="https://twitter.com/dfdsports" />
          </div>
        </div>
      </section>

      {/* Save Button */}
      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-sm shadow-sm transition-all active:scale-95 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isPending ? 'Saving...' : 'Save Company Details'}</span>
        </button>
      </div>
    </form>
  );
}
