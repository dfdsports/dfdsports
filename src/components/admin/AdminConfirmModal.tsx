'use client';

import React, { useEffect, useRef } from 'react';
import { AlertTriangle, Trash2, LogOut, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AdminConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  icon?: 'trash' | 'logout' | 'warning';
  isLoading?: boolean;
}

export function AdminConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  icon = 'trash',
  isLoading = false,
}: AdminConfirmModalProps) {
  const displayMessage = description || message || '';
  const modalRef = useRef<HTMLDivElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  // Escape key & body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const timer = setTimeout(() => {
      confirmBtnRef.current?.focus();
    }, 50);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      clearTimeout(timer);
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const iconConfig = {
    trash: {
      Icon: Trash2,
      bg: 'bg-rose-100 text-rose-600 border-rose-200',
    },
    logout: {
      Icon: LogOut,
      bg: 'bg-amber-100 text-amber-700 border-amber-200',
    },
    warning: {
      Icon: AlertTriangle,
      bg: 'bg-amber-100 text-amber-600 border-amber-200',
    },
  }[icon];

  const { Icon, bg } = iconConfig;

  const buttonStyle = {
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 focus:ring-rose-500',
    warning: 'bg-amber-500 hover:bg-amber-600 text-black shadow-md shadow-amber-500/20 focus:ring-amber-500',
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 focus:ring-blue-500',
  }[variant];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-5 overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={() => {
          if (!isLoading) onClose();
        }}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        ref={modalRef}
        className="relative z-10 w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
      >
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex items-start gap-3.5 sm:gap-4">
            <div
              className={cn(
                'w-11 h-11 sm:w-12 sm:h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-xs',
                bg
              )}
            >
              <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>

            <div className="flex-1 min-w-0 pr-2">
              <h3
                id="confirm-modal-title"
                className="text-base sm:text-lg font-bold text-black tracking-tight"
              >
                {title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                {displayMessage}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              aria-label="Close"
              className="p-1.5 rounded-lg text-slate-400 hover:text-black hover:bg-slate-100 transition-colors shrink-0 disabled:opacity-40 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 transition-colors text-center justify-center cursor-pointer disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              ref={confirmBtnRef}
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={cn(
                'w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer',
                buttonStyle
              )}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-current/20 border-t-current animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{confirmText}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
