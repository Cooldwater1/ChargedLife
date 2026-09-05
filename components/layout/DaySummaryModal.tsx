'use client';

import { AlertCircle, Calendar, TrendingDown, TrendingUp } from 'lucide-react';
import { useGameStore } from '@/game/state/store';
import { formatMoney } from '@/lib/format';
import { GameModal } from '@/components/ui/GameModal';
import { GameButton } from '@/components/ui/GameButton';

export function DaySummaryModal() {
  const summary = useGameStore((s) => s.lastDaySummary);
  const settings = useGameStore((s) => s.game?.player.settings);
  const hasPendingLifeEvent = useGameStore((s) => s.game?.player.lifeEvents.some((e) => !e.resolved) ?? false);
  const dismiss = useGameStore((s) => s.dismissDaySummary);

  if (!summary || !settings || hasPendingLifeEvent) return null;
  if (settings.daySummaryMode === 'never') return null;
  if (settings.daySummaryMode === 'important_only' && !summary.hasImportant) return null;

  const isWeek = summary.daysSimulated > 1;

  return (
    <GameModal
      open
      onClose={dismiss}
      title={isWeek ? `Week Complete (${summary.daysSimulated} day${summary.daysSimulated !== 1 ? 's' : ''})` : 'Day Complete'}
      subtitle={summary.dateLabel}
      size="md"
      footer={<GameButton onClick={dismiss}>Continue</GameButton>}
    >
      {isWeek && summary.stoppedEarly && (
        <div className="flex items-start gap-2 cl-panel p-3 mb-4 !border-cl-warning/30">
          <AlertCircle size={15} className="text-cl-warning shrink-0 mt-0.5" />
          <p className="text-xs text-cl-text-secondary">
            Stopped after {summary.daysSimulated} day{summary.daysSimulated !== 1 ? 's' : ''} because something needs your attention.
          </p>
        </div>
      )}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="cl-panel p-3 text-center">
          <p className="text-xs text-cl-text-muted mb-1 flex items-center justify-center gap-1"><TrendingUp size={12} /> Income</p>
          <p className="text-sm font-semibold text-cl-positive">{formatMoney(summary.income)}</p>
        </div>
        <div className="cl-panel p-3 text-center">
          <p className="text-xs text-cl-text-muted mb-1 flex items-center justify-center gap-1"><TrendingDown size={12} /> Expenses</p>
          <p className="text-sm font-semibold text-cl-negative">{formatMoney(summary.expenses)}</p>
        </div>
        <div className="cl-panel p-3 text-center !border-cl-accent/30">
          <p className="text-xs text-cl-text-muted mb-1">Net Change</p>
          <p className={`text-sm font-semibold ${summary.netChange >= 0 ? 'text-cl-positive' : 'text-cl-negative'}`}>{formatMoney(summary.netChange, { showSign: true })}</p>
        </div>
      </div>

      {summary.businessLines.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-cl-text-secondary uppercase tracking-wide mb-2">Business Performance</p>
          <div className="space-y-1.5">
            {summary.businessLines.map((line, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-cl-text-secondary">{line.label}</span>
                <span className={(line.amount ?? 0) >= 0 ? 'text-cl-positive font-medium' : 'text-cl-negative font-medium'}>
                  {formatMoney(line.amount ?? 0, { showSign: true })} {line.detail}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {summary.investmentChange !== 0 && (
        <div className="flex items-center justify-between text-sm mb-4">
          <span className="text-cl-text-secondary flex items-center gap-1.5"><Calendar size={13} /> Investment Portfolio</span>
          <span className={summary.investmentChange >= 0 ? 'text-cl-positive font-medium' : 'text-cl-negative font-medium'}>
            {formatMoney(summary.investmentChange, { showSign: true })}
          </span>
        </div>
      )}

      {summary.relationshipLines.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-cl-text-secondary uppercase tracking-wide mb-2">Relationship Changes</p>
          <div className="space-y-1.5">
            {summary.relationshipLines.map((line, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-cl-text-secondary">{line.label}</span>
                {line.amount !== undefined && (
                  <span className={line.amount >= 0 ? 'text-cl-positive font-medium' : 'text-cl-negative font-medium'}>
                    {line.amount >= 0 ? '+' : ''}{line.amount} {line.detail}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {summary.eventLines.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-cl-text-secondary uppercase tracking-wide mb-2">Notable Events</p>
          <ul className="space-y-1 text-sm text-cl-text-secondary list-disc list-inside">
            {summary.eventLines.map((line, i) => <li key={i}>{line}</li>)}
          </ul>
        </div>
      )}

      {isWeek && summary.importantEventCount > 0 && (
        <p className="text-xs text-cl-text-muted">{summary.importantEventCount} important event{summary.importantEventCount !== 1 ? 's' : ''} this week.</p>
      )}
    </GameModal>
  );
}
