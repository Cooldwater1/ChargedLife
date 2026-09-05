'use client';

import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

interface GameModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const SIZE_MAP = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function GameModal({ open, onClose, title, subtitle, children, footer, size = 'md' }: GameModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  // Rendered via portal straight into <body> — any ancestor page wrapper that has a completed
  // CSS animation with a transform (e.g. .cl-animate-in's fill-mode retains `transform:
  // translateY(0)`) becomes a containing block for `position: fixed` descendants per spec,
  // which would otherwise trap this modal inside the scrolled page instead of the viewport.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm cl-animate-in" onClick={onClose} />
      <div
        className={cn(
          'relative w-full cl-panel cl-animate-pop max-h-[85vh] flex flex-col',
          SIZE_MAP[size],
        )}
        style={{ background: 'linear-gradient(180deg, rgba(20,32,56,0.98), rgba(12,19,36,0.98))' }}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-cl-border shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-cl-text-primary">{title}</h2>
            {subtitle && <p className="text-sm text-cl-text-muted mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-cl-text-muted hover:text-cl-text-primary transition-colors p-1 -m-1 rounded-md hover:bg-white/5">
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto cl-scrollbar-thin">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-cl-border flex items-center justify-end gap-3 shrink-0">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
