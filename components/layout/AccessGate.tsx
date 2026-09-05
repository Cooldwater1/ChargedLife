'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Lock, Zap } from 'lucide-react';
import { GAME_ASSETS } from '@/game/constants/assets';
import { GameButton } from '@/components/ui/GameButton';

const ACCESS_CODE = 'Kazeb';
const STORAGE_KEY = 'chargedlife-access-granted';

export function hasStoredAccess(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function AccessGate({ onSuccess }: { onSuccess: () => void }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    if (code.trim() === ACCESS_CODE) {
      try {
        window.localStorage.setItem(STORAGE_KEY, 'true');
      } catch {
        // localStorage unavailable — access still granted for this page view
      }
      onSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      <Image src={GAME_ASSETS.backgrounds.abstractDarkBlue} alt="" fill sizes="100vw" className="object-cover" priority />
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(7,11,22,0.92)] via-[rgba(7,11,22,0.88)] to-[rgba(7,11,22,0.96)]" />

      <div className="relative z-10 w-full max-w-sm cl-panel cl-animate-pop p-8 text-center">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cl-accent to-cl-accent-strong shadow-[0_0_32px_-4px_var(--cl-accent-glow)] mb-4 mx-auto">
          <Lock size={24} className="text-white" />
        </div>
        <h1 className="text-xl font-bold text-cl-text-primary tracking-tight mb-1">CHARGEDLIFE</h1>
        <p className="text-sm text-cl-gold font-medium mb-1">Private Pre-Alpha Access</p>
        <p className="text-xs text-cl-text-secondary mb-6">ChargedLife is currently in private testing. Enter your access code to continue.</p>

        <label className="block text-xs font-medium text-cl-text-secondary uppercase tracking-wide mb-2 text-left">Access Code</label>
        <input
          value={code}
          onChange={(e) => { setCode(e.target.value); setError(false); }}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="••••••"
          className="w-full rounded-lg bg-white/[0.05] border border-cl-border-strong px-4 py-2.5 text-sm text-cl-text-primary text-center tracking-wide placeholder:text-cl-text-muted focus:outline-none focus:border-cl-accent transition-colors mb-2"
          autoFocus
        />
        <p className="text-xs text-cl-negative mb-4 h-4">{error && 'Invalid access code.'}</p>
        <GameButton onClick={handleSubmit} disabledReason={code.trim() ? undefined : 'Enter your access code'} fullWidth size="lg">
          Continue
        </GameButton>

        <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-cl-text-muted mt-6">
          <Zap size={11} /> Pre-Alpha build — not a public release
        </p>
      </div>
    </div>
  );
}
