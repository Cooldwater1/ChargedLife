'use client';

import { useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { useGameStore } from '@/game/state/store';
import { calculateNetWorth } from '@/game/simulation/networth';
import { toCalendarDate } from '@/game/time/calendar';
import { formatDateLong, formatMoney } from '@/lib/format';
import { cn } from '@/lib/cn';
import { NotificationBell } from './NotificationBell';
import { GameButton } from '@/components/ui/GameButton';

export function TopBar() {
  const game = useGameStore((s) => s.game);
  const advance = useGameStore((s) => s.advanceDay);

  const netWorth = useMemo(() => (game ? calculateNetWorth(game) : 0), [game]);
  const date = useMemo(() => (game ? toCalendarDate(game.time.dayIndex) : null), [game]);

  if (!game || !date) return null;

  const hasPendingEvent = game.player.lifeEvents.some((e) => !e.resolved);

  return (
    <header className="h-16 shrink-0 sticky top-0 z-30 flex items-center justify-between gap-4 px-6 border-b border-cl-border bg-cl-bg-base/80 backdrop-blur-xl">
      <div className="flex items-center gap-6">
        <div>
          <p className="text-xs text-cl-text-muted leading-none mb-1">Cash</p>
          <p className="text-sm font-semibold text-cl-text-primary font-mono tabular-nums">{formatMoney(game.player.cash)}</p>
        </div>
        <div className="w-px h-8 bg-cl-border" />
        <div>
          <p className="text-xs text-cl-text-muted leading-none mb-1">Net Worth</p>
          <p className={cn('text-sm font-semibold font-mono tabular-nums', netWorth >= 0 ? 'text-cl-positive' : 'text-cl-negative')}>{formatMoney(netWorth)}</p>
        </div>
        <div className="w-px h-8 bg-cl-border" />
        <div>
          <p className="text-xs text-cl-text-muted leading-none mb-1">Age</p>
          <p className="text-sm font-semibold text-cl-text-primary tabular-nums">{game.player.age}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <p className="text-sm font-medium text-cl-text-primary">{formatDateLong(date)}</p>

        <GameButton
          onClick={advance}
          icon={<ChevronRight size={16} />}
          disabledReason={hasPendingEvent ? 'Resolve the pending life event first' : undefined}
        >
          Next Day
        </GameButton>

        <NotificationBell />
      </div>
    </header>
  );
}
