'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface SelectOption<T extends string | number = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

interface SelectProps<T extends string | number = string> {
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  size?: 'sm' | 'md';
}

/** Dark-themed dropdown replacing native <select>, whose open option-list can't be
 * themed cross-browser and renders as a jarring native white popup in dark mode. */
export function Select<T extends string | number = string>({
  value, onChange, options, placeholder, className, buttonClassName, size = 'md',
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const selected = options.find((o) => o.value === value);
  const sizeClass = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'w-full flex items-center justify-between gap-2 rounded-md bg-white/[0.05] border border-cl-border-strong text-cl-text-primary hover:bg-white/[0.08] transition-colors',
          sizeClass,
          buttonClassName,
        )}
      >
        <span className={cn('truncate', !selected && 'text-cl-text-muted')}>{selected ? selected.label : (placeholder ?? 'Select...')}</span>
        <ChevronDown size={size === 'sm' ? 12 : 14} className={cn('shrink-0 text-cl-text-muted transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute z-50 left-0 right-0 mt-1 max-h-64 overflow-y-auto rounded-md border border-cl-border-strong bg-cl-bg-elevated shadow-xl py-1 cl-scrollbar-thin">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              disabled={opt.disabled}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={cn(
                'w-full text-left px-3 py-1.5 text-sm transition-colors',
                opt.value === value ? 'bg-cl-accent/15 text-cl-accent' : 'text-cl-text-primary hover:bg-white/[0.06]',
                opt.disabled && 'opacity-40 cursor-not-allowed',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
