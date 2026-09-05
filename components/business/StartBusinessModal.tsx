'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CITY_DEFINITIONS } from '@/game/constants/data';
import { BUSINESS_INDUSTRY_IMAGE } from '@/game/constants/assets';
import { MIN_BUSINESS_STARTUP_COST, RECOMMENDED_BUSINESS_STARTUP_COST } from '@/game/constants/balance';
import { useGameStore } from '@/game/state/store';
import { formatMoney } from '@/lib/format';
import { GameModal } from '@/components/ui/GameModal';
import { GameButton } from '@/components/ui/GameButton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { cn } from '@/lib/cn';

interface StartBusinessModalProps {
  open: boolean;
  onClose: () => void;
}

const COMPETITION_TONE = { low: 'success', medium: 'warning', high: 'danger' } as const;

export function StartBusinessModal({ open, onClose }: StartBusinessModalProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [city, setCity] = useState(CITY_DEFINITIONS[0].city);
  const [investment, setInvestment] = useState(RECOMMENDED_BUSINESS_STARTUP_COST);

  const cash = useGameStore((s) => s.game?.player.cash ?? 0);
  const startBusiness = useGameStore((s) => s.startBusiness);

  const canAffordMin = cash >= MIN_BUSINESS_STARTUP_COST;
  const canAffordChosen = cash >= investment;

  const handleClose = () => {
    setStep(0);
    setName('');
    setInvestment(RECOMMENDED_BUSINESS_STARTUP_COST);
    onClose();
  };

  const handleConfirm = () => {
    startBusiness({ name: name.trim(), city, investment });
    handleClose();
  };

  return (
    <GameModal
      open={open}
      onClose={handleClose}
      title="Start a New Business"
      subtitle={`Step ${step + 1} of 3`}
      size="lg"
      footer={
        <>
          {step > 0 && <GameButton variant="ghost" onClick={() => setStep((s) => s - 1)}>Back</GameButton>}
          {step < 2 ? (
            <GameButton
              onClick={() => setStep((s) => s + 1)}
              disabledReason={step === 1 && !name.trim() ? 'Enter a business name' : undefined}
            >
              Continue
            </GameButton>
          ) : (
            <GameButton
              onClick={handleConfirm}
              disabledReason={!canAffordChosen ? 'Not enough cash for this investment' : undefined}
            >
              Confirm & Launch
            </GameButton>
          )}
        </>
      }
    >
      {step === 0 && (
        <div>
          <p className="text-sm text-cl-text-secondary mb-4">Choose an industry to start your business in.</p>
          <div className="grid grid-cols-2 gap-3">
            <button className="cl-panel cl-panel-hover !border-cl-accent/40 text-left overflow-hidden">
              <div className="relative h-28">
                <Image src={BUSINESS_INDUSTRY_IMAGE.fast_food} alt="Fast Food" fill sizes="320px" className="object-cover" />
              </div>
              <div className="p-4">
                <p className="font-semibold text-cl-text-primary mb-1">Fast Food</p>
                <p className="text-xs text-cl-text-secondary">Serve customers burgers, fries and drinks. Manage staff, pricing, and locations.</p>
              </div>
            </button>
            {['Marketing Agency', 'Retail Store', 'Web Agency'].map((locked) => (
              <div key={locked} className="cl-panel p-4 text-left opacity-50 cursor-not-allowed">
                <p className="font-semibold text-cl-text-primary mb-1">{locked}</p>
                <StatusBadge label="Coming Soon" tone="neutral" />
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-cl-text-secondary uppercase tracking-wide mb-2">Business Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. ChargedFood"
              maxLength={30}
              className="w-full rounded-lg bg-white/[0.05] border border-cl-border-strong px-4 py-2.5 text-sm text-cl-text-primary placeholder:text-cl-text-muted focus:outline-none focus:border-cl-accent transition-colors"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-cl-text-secondary uppercase tracking-wide mb-2">Location City</label>
            <div className="grid grid-cols-2 gap-2">
              {CITY_DEFINITIONS.map((c) => (
                <button
                  key={c.city}
                  onClick={() => setCity(c.city)}
                  className={cn(
                    'text-left rounded-lg border px-3 py-2.5 transition-colors',
                    city === c.city ? 'border-cl-accent bg-cl-accent/10' : 'border-cl-border-strong bg-white/[0.03] hover:bg-white/[0.06]',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-cl-text-primary">{c.city}</p>
                    <StatusBadge label={c.competition} tone={COMPETITION_TONE[c.competition]} />
                  </div>
                  <p className="text-xs text-cl-text-muted mt-1">{c.label}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="cl-panel p-3">
              <p className="text-xs text-cl-text-muted mb-1">Minimum</p>
              <p className="text-sm font-semibold text-cl-text-primary">{formatMoney(MIN_BUSINESS_STARTUP_COST)}</p>
            </div>
            <div className="cl-panel p-3 !border-cl-accent/30">
              <p className="text-xs text-cl-text-muted mb-1">Recommended</p>
              <p className="text-sm font-semibold text-cl-accent">{formatMoney(RECOMMENDED_BUSINESS_STARTUP_COST)}</p>
            </div>
            <div className="cl-panel p-3">
              <p className="text-xs text-cl-text-muted mb-1">Your Cash</p>
              <p className={cn('text-sm font-semibold', canAffordMin ? 'text-cl-positive' : 'text-cl-negative')}>{formatMoney(cash)}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-cl-text-secondary uppercase tracking-wide">Startup Investment</label>
              <span className="text-sm font-semibold text-cl-text-primary">{formatMoney(investment)}</span>
            </div>
            <input
              type="range"
              min={MIN_BUSINESS_STARTUP_COST}
              max={Math.max(cash, RECOMMENDED_BUSINESS_STARTUP_COST * 2)}
              step={1000}
              value={investment}
              onChange={(e) => setInvestment(Number(e.target.value))}
              className="w-full accent-cl-accent"
            />
            <p className="text-xs text-cl-text-muted mt-2 leading-relaxed">
              Higher investment funds better initial kitchen capacity. About 32% becomes working capital; the rest sets up your restaurant.
            </p>
          </div>

          {!canAffordChosen && <p className="text-xs text-cl-negative">You don&apos;t have enough cash for this investment amount.</p>}
        </div>
      )}
    </GameModal>
  );
}
