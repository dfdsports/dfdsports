'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, MessageCircle, User, Phone, MapPin, Loader2, CheckCircle2, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPhoneNumber } from '@/lib/whatsapp';

export interface CartItemSummary {
  id: string;
  name: string;
  slug?: string;
  price?: number;
  quantity: number;
  image?: string;
  size?: string;
}

export interface WhatsAppOrderModalProps {
  whatsappNumber?: string | null;
  productName: string;
  productCategory?: string | null;
  productSizes?: string[];
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  // Controlled modal props for reuse
  isOpen?: boolean;
  onClose?: () => void;
  hideTrigger?: boolean;
  cartItems?: CartItemSummary[];
  cartSubtotal?: number;
  initialQuantity?: string;
  showQuantity?: boolean;
  onSuccess?: () => void;
  specifications?: string[];
  customNotes?: string;
}

interface FormState {
  name: string;
  phone: string;
  expectedDate: string;
  address: string;
  quantity: string;
}

type FieldKey = keyof FormState;

export function WhatsAppOrderModal({
  whatsappNumber,
  productName,
  productCategory,
  productSizes,
  label = 'Order on WhatsApp',
  size = 'lg',
  className,
  isOpen,
  onClose,
  hideTrigger = false,
  cartItems,
  cartSubtotal,
  initialQuantity,
  showQuantity,
  onSuccess,
  specifications,
  customNotes,
}: WhatsAppOrderModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = isOpen !== undefined;
  const open = isControlled ? isOpen : internalOpen;


  const [form, setForm] = useState<FormState>({
    name: '',
    phone: '',
    expectedDate: '',
    address: '',
    quantity: initialQuantity || '1',
  });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && initialQuantity) {
      setForm((prev) => ({ ...prev, quantity: initialQuantity }));
    }
  }, [open, initialQuantity]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => firstInputRef.current?.focus(), 80);
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  function closeModal() {
    if (submitting) return;
    if (isControlled) {
      onClose?.();
    } else {
      setInternalOpen(false);
    }
    setErrors({});
    setDone(false);
  }

  function handleChange(field: FieldKey, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }));
  }

  function validate(): boolean {
    const e: Partial<FormState> = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.phone.trim()) {
      e.phone = 'Phone number is required';
    } else if (!/^\+?[0-9\s\-]{7,15}$/.test(form.phone.trim())) {
      e.phone = 'Enter a valid phone number';
    }
    if (!form.expectedDate) e.expectedDate = 'Expected delivery date is required';
    if (!form.address.trim()) e.address = 'Shipping address is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    // ── Build WhatsApp message ──────────────────────────────────────────────
    let waText = '';
    if (cartItems && cartItems.length > 0) {
      const lines = [
        `🛒 *NEW CART ORDER — DFD SPORTS*`,
        ``,
        `📦 *Order Details (${form.quantity.trim() || cartItems.length} items)*`,
      ];
      cartItems.forEach((item) => {
        const priceStr = item.price
          ? ` — ₹${(item.price * item.quantity).toLocaleString('en-IN')}`
          : '';
        const sizeStr = item.size ? ` (Size: ${item.size})` : '';
        lines.push(`• ${item.name}${sizeStr} x ${item.quantity}${priceStr}`);
      });
      if (cartSubtotal != null && cartSubtotal > 0) {
        lines.push(``);
        lines.push(`💰 *Total Amount:* ₹${cartSubtotal.toLocaleString('en-IN')}`);
      }
      lines.push(``);
      lines.push(`👤 *Customer Details*`);
      lines.push(`• Name: ${form.name.trim()}`);
      lines.push(`• Phone: ${form.phone.trim()}`);
      if (form.expectedDate) lines.push(`• Expected Delivery Date: ${form.expectedDate}`);
      lines.push(`• Shipping Address: ${form.address.trim()}`);
      lines.push(``);
      lines.push(`Please confirm availability and share the order details. Thank you!`);
      waText = lines.join('\n');
    } else {
      const lines = [
        `🛒 *NEW ORDER — DFD SPORTS*`,
        ``,
        `📦 *Product Details*`,
        `• Product: ${productName}`,
      ];
      if (productCategory) lines.push(`• Category: ${productCategory}`);
      if (form.quantity) lines.push(`• Quantity: ${form.quantity}`);
      if (productSizes && productSizes.length > 0)
        lines.push(`• Available Sizes: ${productSizes.join(', ')}`);
      if (specifications && specifications.length > 0)
        lines.push(`• Specifications: ${specifications.join(' | ')}`);
      if (customNotes)
        lines.push(`• Custom Notes: ${customNotes}`);
      lines.push(``);
      lines.push(`👤 *Customer Details*`);
      lines.push(`• Name: ${form.name.trim()}`);
      lines.push(`• Phone: ${form.phone.trim()}`);
      if (form.expectedDate) lines.push(`• Expected Delivery Date: ${form.expectedDate}`);
      lines.push(`• Shipping Address: ${form.address.trim()}`);
      lines.push(``);
      lines.push(`Please confirm availability and share the order details. Thank you!`);
      waText = lines.join('\n');
    }

    // ── Save order to DB ────────────────────────────────────────────────────
    try {
      const dbProductName =
        cartItems && cartItems.length > 0
          ? cartItems
              .map((i) => `${i.name}${i.size ? ` [${i.size}]` : ''} (x${i.quantity})`)
              .join(', ')
              .slice(0, 500)
          : specifications && specifications.length > 0
          ? `${productName} (${specifications.join(', ')})${customNotes ? ` [Notes: ${customNotes}]` : ''}`.slice(0, 500)
          : productName;

      const shippingAddressWithDate = form.expectedDate
        ? `${form.address.trim()} (Expected Delivery: ${form.expectedDate})`
        : form.address.trim();

      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          product_name: dbProductName,
          category: productCategory ?? (cartItems ? 'Cart Order' : null),
          quantity: form.quantity.trim() || '1',
          shipping_address: shippingAddressWithDate,
        }),
      });
    } catch {
      // Non-blocking — WhatsApp still opens even if DB save fails
    }

    // ── Open WhatsApp ───────────────────────────────────────────────────────
    const phone = formatPhoneNumber(whatsappNumber);
    const url = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(waText)}`
      : `https://wa.me/?text=${encodeURIComponent(waText)}`;

    onSuccess?.();

    setDone(true);
    setTimeout(() => {
      const isMobile =
        typeof window !== 'undefined' &&
        /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile) {
        window.location.href = url;
      } else {
        const win = window.open(url, '_blank', 'noopener,noreferrer');
        if (!win || win.closed || typeof win.closed === 'undefined') {
          window.location.href = url;
        }
      }

      setSubmitting(false);
      closeModal();
      setForm({ name: '', phone: '', expectedDate: '', address: '', quantity: '1' });
    }, 600);
  }

  const sizeClasses = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5 font-medium rounded-full',
    md: 'text-sm px-5 py-2.5 gap-2 font-semibold rounded-full',
    lg: 'text-base px-7 py-3.5 gap-2.5 font-bold rounded-full',
  };

  return (
    <>
      {/* ── Trigger ────────────────────────────────────────────────── */}
      {!hideTrigger && (
        <button
          type="button"
          onClick={() => setInternalOpen(true)}
          className={cn(
            'inline-flex items-center justify-center cursor-pointer select-none',
            'bg-[#25D366] hover:bg-[#20BA5A] text-white',
            'shadow-lg shadow-[#25D366]/25 transition-all duration-200 active:scale-95',
            sizeClasses[size],
            className
          )}
        >
          <MessageCircle className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
          <span>{label}</span>
        </button>
      )}

      {/* ── Modal ──────────────────────────────────────────────────── */}
      {open && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          onClick={(e) => { if (e.target === overlayRef.current) closeModal(); }}
        >
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

          <div className="relative z-10 w-full max-w-md bg-[#0D1119] rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

            {/* Header */}
            <div className="bg-gradient-to-br from-[#0d2b1a] to-[#0D1119] px-6 pt-6 pb-5 shrink-0">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#25D366]/20 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5 text-[#25D366]" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#25D366]">
                      WhatsApp Order
                    </p>
                    <h2 className="text-sm font-bold text-white leading-snug line-clamp-1 mt-0.5 uppercase">
                      {productName}
                    </h2>
                    {productCategory && (
                      <p className="text-[11px] text-gray-500 mt-0.5">{productCategory}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="ml-3 shrink-0 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="px-6 py-5 space-y-4 overflow-y-auto flex-1 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {done ? (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <CheckCircle2 className="w-12 h-12 text-[#25D366]" />
                  <p className="text-white font-bold">Opening WhatsApp…</p>
                  <p className="text-xs text-gray-400">Your order has been saved. Complete it on WhatsApp.</p>
                </div>
              ) : (
                <>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Fill in your details. Your order will be saved and sent to our team via WhatsApp instantly.
                  </p>

                  {/* Name */}
                  <Field label="Full Name" required error={errors.name}>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                      <input
                        ref={firstInputRef}
                        type="text"
                        value={form.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="Enter name"
                        className={inputCls(!!errors.name)}
                      />
                    </div>
                  </Field>

                  {/* Phone */}
                  <Field label="Phone Number" required error={errors.phone}>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="Enter mobile number"
                        className={inputCls(!!errors.phone)}
                      />
                    </div>
                  </Field>

                  {/* Expected Delivery Date */}
                  <Field label="Expected Delivery Date" required error={errors.expectedDate}>
                    <div className="relative w-full">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={form.expectedDate}
                        onChange={(e) => handleChange('expectedDate', e.target.value)}
                        onClick={(e) => e.currentTarget.showPicker?.()}
                        className={cn(
                          inputCls(!!errors.expectedDate),
                          'w-full max-w-full min-w-0 box-border block [appearance:none] [-webkit-appearance:none] [color-scheme:dark] cursor-pointer [&::-webkit-date-and-time-value]:text-left [&::-webkit-date-and-time-value]:min-h-[1.25rem]',
                          !form.expectedDate && 'text-gray-400'
                        )}
                      />
                    </div>
                  </Field>

                  {/* Shipping Address */}
                  <Field label="Shipping Address" required error={errors.address}>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-500 pointer-events-none" />
                      <textarea
                        value={form.address}
                        onChange={(e) => handleChange('address', e.target.value)}
                        placeholder="Enter address"
                        rows={3}
                        className={cn(inputCls(!!errors.address), 'resize-none')}
                      />
                    </div>
                  </Field>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className={cn(
                      'w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 mt-2',
                      submitting
                        ? 'bg-[#25D366]/50 cursor-not-allowed text-white/60'
                        : 'bg-[#25D366] hover:bg-[#20BA5A] text-white shadow-lg shadow-[#25D366]/20 active:scale-95'
                    )}
                  >
                    {submitting ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /><span>Saving & Opening…</span></>
                    ) : (
                      <><MessageCircle className="w-4 h-4" /><span>Place Order on WhatsApp</span></>
                    )}
                  </button>

                  <p className="text-center text-[11px] text-gray-600">
                    Your order details will be pre-filled in WhatsApp.
                  </p>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function inputCls(hasError?: boolean) {
  return cn(
    'w-full bg-white/5 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 border-0 border-none outline-none ring-0 focus:outline-none focus:ring-0 focus:border-none transition-colors'
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider">
        {label} {required && <span className="text-[#F5A623]">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
