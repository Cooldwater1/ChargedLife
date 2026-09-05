'use client';

import { useState } from 'react';
import { HeartCrack } from 'lucide-react';
import { useGameStore } from '@/game/state/store';
import { calculateNetWorth } from '@/game/simulation/networth';
import { formatDateLong, formatMoney } from '@/lib/format';
import { toCalendarDate } from '@/game/time/calendar';
import { GameButton } from '@/components/ui/GameButton';

export function GameOverScreen() {
  const game = useGameStore((s) => s.game);
  const resetSave = useGameStore((s) => s.resetSave);
  const [showSummary, setShowSummary] = useState(false);

  if (!game) return null;

  const netWorth = calculateNetWorth(game);
  const stats = game.player.statistics;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-lg cl-panel cl-animate-pop p-8">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cl-negative/80 to-cl-negative shadow-[0_0_32px_-4px_rgba(239,68,68,0.4)] mb-4">
            <HeartCrack size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-cl-text-primary tracking-tight">Financial Ruin</h1>
          <p className="text-sm text-cl-text-secondary mt-1 max-w-sm leading-relaxed">
            {game.player.name}&apos;s finances collapsed under unpaid personal debt. This chapter of the story ends here — but every life offers a fresh start.
          </p>
        </div>

        {!showSummary ? (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="cl-panel p-3 text-center">
              <p className="text-xs text-cl-text-muted mb-1">Final Net Worth</p>
              <p className="text-sm font-semibold text-cl-text-primary">{formatMoney(netWorth)}</p>
            </div>
            <div className="cl-panel p-3 text-center">
              <p className="text-xs text-cl-text-muted mb-1">Age at End</p>
              <p className="text-sm font-semibold text-cl-text-primary">{game.player.age}</p>
            </div>
            <div className="cl-panel p-3 text-center">
              <p className="text-xs text-cl-text-muted mb-1">Businesses Built</p>
              <p className="text-sm font-semibold text-cl-text-primary">{stats.businessesStarted}</p>
            </div>
            <div className="cl-panel p-3 text-center">
              <p className="text-xs text-cl-text-muted mb-1">Days Played</p>
              <p className="text-sm font-semibold text-cl-text-primary">{stats.daysPlayed}</p>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="cl-panel p-3 text-center">
                <p className="text-xs text-cl-text-muted mb-1">Highest Net Worth</p>
                <p className="text-sm font-semibold text-cl-gold">{formatMoney(stats.highestNetWorth)}</p>
              </div>
              <div className="cl-panel p-3 text-center">
                <p className="text-xs text-cl-text-muted mb-1">Total Earned</p>
                <p className="text-sm font-semibold text-cl-text-primary">{formatMoney(stats.totalMoneyEarned)}</p>
              </div>
              <div className="cl-panel p-3 text-center">
                <p className="text-xs text-cl-text-muted mb-1">Jobs Held</p>
                <p className="text-sm font-semibold text-cl-text-primary">{stats.jobsHeld}</p>
              </div>
              <div className="cl-panel p-3 text-center">
                <p className="text-xs text-cl-text-muted mb-1">Children</p>
                <p className="text-sm font-semibold text-cl-text-primary">{stats.childrenBorn}</p>
              </div>
            </div>
            <p className="text-xs font-medium text-cl-text-secondary uppercase tracking-wide mb-2">Life Timeline</p>
            <div className="space-y-2 max-h-52 overflow-y-auto cl-scrollbar-thin pr-1">
              {game.player.timeline.length === 0 ? (
                <p className="text-sm text-cl-text-muted">No major events recorded.</p>
              ) : (
                [...game.player.timeline].reverse().map((entry) => (
                  <div key={entry.id} className="flex items-start justify-between gap-3 text-sm">
                    <div>
                      <p className="text-cl-text-primary font-medium">{entry.title}</p>
                      <p className="text-xs text-cl-text-muted">{entry.description}</p>
                    </div>
                    <span className="text-xs text-cl-text-muted shrink-0">{formatDateLong(toCalendarDate(entry.timestamp))}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <GameButton variant="secondary" fullWidth onClick={() => setShowSummary((s) => !s)}>
            {showSummary ? 'Hide Details' : 'View Life Summary'}
          </GameButton>
          <GameButton fullWidth onClick={resetSave}>Start New Life</GameButton>
        </div>
      </div>
    </div>
  );
}
