'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Sparkles, Wallet, Zap } from 'lucide-react';
import { useGameStore } from '@/game/state/store';
import { GAME_VERSION, STARTING_AGE, STARTING_CASH } from '@/game/constants/balance';
import { CITY_DEFINITIONS } from '@/game/constants/data';
import { GAME_ASSETS } from '@/game/constants/assets';
import { formatMoney } from '@/lib/format';
import { GameButton } from '@/components/ui/GameButton';
import { Select } from '@/components/ui/Select';
import type { LifeEventsDifficulty } from '@/game/types';

export function StartScreen() {
  const [name, setName] = useState('');
  const [city, setCity] = useState('Austin');
  const [difficulty, setDifficulty] = useState<LifeEventsDifficulty>('relaxed');
  const startNewGame = useGameStore((s) => s.startNewGame);

  const handleStart = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    startNewGame(trimmed, { city, lifeEventsDifficulty: difficulty });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-10 overflow-hidden">
      <Image src={GAME_ASSETS.backgrounds.luxuryCityNight} alt="" fill sizes="100vw" className="object-cover" priority />
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(7,11,22,0.94)] via-[rgba(7,11,22,0.9)] to-[rgba(7,11,22,0.97)]" />

      <div className="relative z-10 w-full max-w-md cl-panel cl-animate-pop p-8">
        <div className="flex flex-col items-center text-center mb-7">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cl-accent to-cl-accent-strong shadow-[0_0_32px_-4px_var(--cl-accent-glow)] mb-4">
            <Zap size={28} className="text-white" fill="white" />
          </div>
          <h1 className="text-2xl font-bold text-cl-text-primary tracking-tight">CHARGEDLIFE</h1>
          <p className="text-sm text-cl-text-secondary mt-1 flex items-center gap-1.5"><Sparkles size={13} /> Start a New Life</p>
          <p className="text-xs text-cl-text-muted mt-1">Who will you become?</p>
        </div>

        <label className="block text-xs font-medium text-cl-text-secondary uppercase tracking-wide mb-2">Player Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleStart()}
          placeholder="e.g. Alex Carter"
          maxLength={30}
          className="w-full rounded-lg bg-white/[0.05] border border-cl-border-strong px-4 py-2.5 text-sm text-cl-text-primary placeholder:text-cl-text-muted focus:outline-none focus:border-cl-accent transition-colors mb-5"
          autoFocus
        />

        <label className="block text-xs font-medium text-cl-text-secondary uppercase tracking-wide mb-2">Starting City</label>
        <Select
          className="w-full mb-5"
          value={city}
          onChange={setCity}
          options={CITY_DEFINITIONS.map((c) => ({ value: c.city, label: c.city }))}
        />

        <label className="block text-xs font-medium text-cl-text-secondary uppercase tracking-wide mb-2">Life Events</label>
        <div className="flex gap-1 rounded-lg border border-cl-border-strong bg-white/[0.03] p-0.5 mb-2">
          {(['relaxed', 'realistic'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setDifficulty(mode)}
              className={`flex-1 px-3 py-2 rounded-md text-xs font-medium capitalize transition-colors ${difficulty === mode ? 'bg-cl-accent-strong text-white' : 'text-cl-text-secondary'}`}
            >
              {mode}
            </button>
          ))}
        </div>
        <p className="text-xs text-cl-text-muted mb-6">
          {difficulty === 'relaxed' ? 'Parents and other family members do not pass away from natural causes.' : 'Family members can age and pass away naturally, like real life.'}
        </p>

        <div className="rounded-lg bg-white/[0.03] border border-cl-border px-4 py-3 mb-6 grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] text-cl-text-muted uppercase tracking-wide flex items-center gap-1"><Wallet size={11} /> Starting Cash</p>
            <p className="text-sm font-semibold text-cl-positive">{formatMoney(STARTING_CASH)}</p>
          </div>
          <div>
            <p className="text-[10px] text-cl-text-muted uppercase tracking-wide">Age</p>
            <p className="text-sm font-semibold text-cl-text-primary">{STARTING_AGE}</p>
          </div>
          <div>
            <p className="text-[10px] text-cl-text-muted uppercase tracking-wide">Education</p>
            <p className="text-sm font-semibold text-cl-text-primary">High School</p>
          </div>
          <div>
            <p className="text-[10px] text-cl-text-muted uppercase tracking-wide">Status</p>
            <p className="text-sm font-semibold text-cl-text-primary">Single</p>
          </div>
        </div>

        <GameButton onClick={handleStart} disabledReason={name.trim() ? undefined : 'Enter a name to continue'} fullWidth size="lg">
          Start Your Life
        </GameButton>

        <p className="text-center text-[10px] text-cl-text-muted mt-6 tracking-wide">{GAME_VERSION}</p>
      </div>
    </div>
  );
}
