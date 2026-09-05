'use client';

import { History } from 'lucide-react';
import { useGameStore } from '@/game/state/store';
import { toCalendarDate } from '@/game/time/calendar';
import { formatDateShort } from '@/lib/format';
import { GameCard } from '@/components/ui/GameCard';
import { EmptyState } from '@/components/ui/EmptyState';

export default function TimelinePage() {
  const game = useGameStore((s) => s.game);
  if (!game) return null;

  const entries = [...game.player.timeline].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="space-y-6 cl-animate-in">
      <div>
        <h1 className="text-2xl font-bold text-cl-text-primary tracking-tight">Life Timeline</h1>
        <p className="text-sm text-cl-text-secondary mt-1">The story of your life, one milestone at a time.</p>
      </div>

      <GameCard title="Milestones" icon={<History size={16} />}>
        {entries.length === 0 ? (
          <EmptyState icon={<History size={32} />} title="Your story is just beginning" description="Major life events will appear here as you play." />
        ) : (
          <div className="relative pl-6">
            <div className="absolute left-[7px] top-1 bottom-1 w-px bg-cl-border" />
            <div className="space-y-6">
              {entries.map((entry) => (
                <div key={entry.id} className="relative">
                  <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-cl-accent border-2 border-cl-bg-base" />
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-cl-text-primary">{entry.title}</p>
                    <span className="text-xs text-cl-text-muted">Age {entry.age} · {formatDateShort(toCalendarDate(entry.timestamp))}</span>
                  </div>
                  <p className="text-sm text-cl-text-secondary">{entry.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </GameCard>
    </div>
  );
}
