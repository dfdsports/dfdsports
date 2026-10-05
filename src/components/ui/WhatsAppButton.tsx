'use client';

import React from 'react';
import Link from 'next/link';
import { generateWhatsAppLink, WhatsAppEnquiryParams } from '@/lib/whatsapp';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WhatsAppButtonProps extends WhatsAppEnquiryParams {
  children?: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'whatsapp' | 'dark' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function WhatsAppButton({
  phoneNumber,
  type = 'general',
  productName,
  categoryName,
  quantity,
  customDetails,
  customMessage,
  children = 'Enquire on WhatsApp',
  className,
  variant = 'whatsapp',
  size = 'md',
  showIcon = true,
}: WhatsAppButtonProps) {
  const url = generateWhatsAppLink({
    phoneNumber,
    type,
    productName,
    categoryName,
    quantity,
    customDetails,
    customMessage,
  });

  const sizeClasses = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5 font-medium rounded-full',
    md: 'text-sm px-5 py-2.5 gap-2 font-semibold rounded-full',
    lg: 'text-base px-7 py-3.5 gap-2.5 font-bold rounded-full',
  };

  const variantClasses = {
    primary:
      'bg-[#F5A623] hover:bg-[#E09612] text-[#080A0F] shadow-lg shadow-[#F5A623]/20 transition-all duration-200 active:scale-95',
    whatsapp:
      'bg-[#25D366] hover:bg-[#20BA5A] text-white shadow-lg shadow-[#25D366]/25 transition-all duration-200 active:scale-95',
    dark:
      'bg-[#121622]/90 hover:bg-[#1a2030] text-white shadow-md transition-all duration-200 active:scale-95 backdrop-blur-sm',
    outline:
      'bg-transparent hover:bg-white/10 text-white transition-all duration-200 active:scale-95',
    ghost:
      'bg-transparent hover:text-[#F5A623] text-gray-300 p-0 shadow-none transition-colors duration-200',
  };

  return (
    <Link
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center justify-center text-center cursor-pointer select-none transition-transform',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      {showIcon && <MessageCircle className={cn(size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4')} />}
      <span>{children}</span>
    </Link>
  );
}
