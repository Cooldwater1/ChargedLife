'use client';

import { useState } from 'react';
import { HelpCircle } from 'lucide-react';

export function HelpTip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setOpen(false)}
        className="text-cl-text-muted hover:text-cl-accent transition-colors"
        aria-label="Help"
      >
        <HelpCircle size={13} />
      </button>
      {open && (
        <span className="absolute z-40 right-0 bottom-full mb-2 w-56 rounded-lg bg-cl-bg-elevated border border-cl-border-strong px-3 py-2 text-xs text-cl-text-secondary leading-relaxed shadow-lg">
          {text}
        </span>
      )}
    </span>
  );
}
