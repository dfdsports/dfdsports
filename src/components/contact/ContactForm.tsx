'use client';

import React, { useState } from 'react';
import { CompanySettings } from '@/types/database';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { Send, CheckCircle2, MessageCircle, AlertCircle } from 'lucide-react';

interface ContactFormProps {
  company?: CompanySettings | null;
}

export function ContactForm({ company }: ContactFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [enquiryType, setEnquiryType] = useState<'general' | 'product' | 'custom_jersey'>('general');
  const [requirement, setRequirement] = useState('');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setErrorMsg('Please provide your name and phone/WhatsApp number.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enquiry_type: enquiryType,
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || null,
          size_or_requirement: requirement.trim() || null,
          message: message.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        console.warn('Enquiry submission issue:', data.error);
      }

      setSubmitted(true);
    } catch {
      // Even if network fails, allow them to proceed to WhatsApp
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const directWhatsAppUrl = generateWhatsAppLink({
    phoneNumber: company?.whatsapp_number,
    type: enquiryType,
    customMessage: `Hi DFD Sports, my name is ${name || 'Customer'}. I am enquiring about ${
      enquiryType === 'custom_jersey' ? 'Custom Teamwear' : 'Sports Equipment'
    }.\nRequirement: ${requirement || 'Catalog & Quotation'}\nNotes: ${message || 'Please contact me.'}`,
  });

  return (
    <div className="rounded-sm bg-transparent sm:bg-[#0E121B] p-0 sm:p-10 shadow-none sm:shadow-2xl relative">
      {submitted ? (
        <div className="text-center py-10">
          <div className="w-16 h-16 rounded-full bg-[#25D366]/20 text-[#25D366] flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Enquiry Received!</h3>
          <p className="text-sm text-gray-400 max-w-md mx-auto mb-8">
            Thank you, {name}. Our sports consultant has received your inquiry. For immediate response
            and instant discussion, click below to open WhatsApp.
          </p>

          <a
            href={directWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold text-sm shadow-xl shadow-[#25D366]/25 transition-transform active:scale-95"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Continue on WhatsApp Directly</span>
          </a>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <h3 className="text-xl font-semibold uppercase tracking-tight text-white mb-1">
            Send an Institutional or Bulk Enquiry
          </h3>
          <p className="text-xs text-gray-400 mb-6">
            Fill in your details and our team will prepare a tailored quotation for you.
          </p>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                Your Full Name <span className="text-[#F5A623]">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-[#F5A623] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                Phone / WhatsApp Number <span className="text-[#F5A623]">*</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-[#F5A623] text-sm"
              />
            </div>
          </div>

          {/* Email & Enquiry Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                Email Address (Optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-[#F5A623] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                Enquiry Type
              </label>
              <select
                value={enquiryType}
                onChange={(e) =>
                  setEnquiryType(e.target.value as 'general' | 'product' | 'custom_jersey')
                }
                className="w-full px-4 py-3 rounded-xl bg-[#141824] text-white focus:outline-none focus:ring-2 focus:ring-[#F5A623] text-sm"
              >
                <option value="general">General Sports Equipment Supply</option>
                <option value="custom_jersey">Custom Sublimation Teamwear / Jerseys</option>
                <option value="product">Specific Product & Brand Quotation</option>
              </select>
            </div>
          </div>

          {/* Requirement / Quantity */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
              Sports Requirement or Estimated Quantity
            </label>
            <input
              type="text"
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-[#F5A623] text-sm"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
              Message or Specific Notes
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-[#F5A623] text-sm"
            />
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#F5A623] hover:bg-[#E09612] text-[#080A0F] font-bold text-sm shadow-xl shadow-[#F5A623]/20 transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Submitting...' : 'Submit Enquiry'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
