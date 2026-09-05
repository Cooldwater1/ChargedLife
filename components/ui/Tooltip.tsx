'use client';

import { useState, type ReactNode } from 'react';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/cn';

interface TooltipProps {
  content: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function Tooltip({ content, children, className }: TooltipProps) {
  const [open, setOpen] = useState(false);

  return (
    <span
      className={cn('relative inline-flex items-center', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {children ?? <HelpCircle size={13} className="text-cl-text-muted hover:text-cl-text-secondary cursor-help" />}
      {open && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-max max-w-xs cl-animate-in">
          <span className="block cl-panel !bg-cl-bg-elevated px-3 py-2 text-xs text-cl-text-secondary leading-relaxed shadow-xl">
            {content}
          </span>
        </span>
      )}
    </span>
  );
}
