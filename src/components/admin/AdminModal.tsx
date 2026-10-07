'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  className?: string;
}

const MAX_WIDTH_CLASSES: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
};

export function AdminModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = '2xl',
  className,
}: AdminModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  // Keep onClose ref updated without re-triggering modal effect
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Focus management & Escape key & Scroll lock
  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedElementRef.current = document.activeElement as HTMLElement | null;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus first input inside the modal content body ONLY when modal opens
    const timer = setTimeout(() => {
      if (modalRef.current) {
        const activeEl = document.activeElement;
        // Do not steal focus if an element inside modal is already focused
        if (activeEl && modalRef.current.contains(activeEl) && activeEl !== modalRef.current) {
          return;
        }

        const bodyContainer = modalRef.current.querySelector('[data-modal-body="true"]');
        const firstInput = (bodyContainer || modalRef.current).querySelector<HTMLElement>(
          'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled])'
        );
        firstInput?.focus();
      }
    }, 60);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      clearTimeout(timer);

      // Return focus to previous element
      if (previouslyFocusedElementRef.current) {
        previouslyFocusedElementRef.current.focus();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      {/* Dark overlay backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={() => onCloseRef.current()}
        aria-hidden="true"
      />

      {/* Centered Modal Card */}
      <div
        ref={modalRef}
        className={cn(
          'relative z-10 w-full bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200',
          MAX_WIDTH_CLASSES[maxWidth] || 'max-w-2xl',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="min-w-0 pr-4">
            <h2
              id="admin-modal-title"
              className="text-lg sm:text-xl font-bold text-black tracking-tight"
            >
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-slate-600 mt-0.5 font-medium truncate">
                {subtitle}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => onCloseRef.current()}
            aria-label="Close modal"
            className="p-2 rounded-xl text-slate-500 hover:text-black hover:bg-slate-200/60 transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div
          data-modal-body="true"
          className="p-6 overflow-y-auto flex-1 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
