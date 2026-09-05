'use client';

import { Sparkles } from 'lucide-react';
import { useGameStore } from '@/game/state/store';
import { formatMoney } from '@/lib/format';
import { GameModal } from '@/components/ui/GameModal';

export function LifeEventModal() {
  const event = useGameStore((s) => s.game?.player.lifeEvents.find((e) => !e.resolved) ?? null);
  const resolve = useGameStore((s) => s.resolveLifeEvent);

  if (!event) return null;

  return (
    <GameModal open onClose={() => {}} title={event.title} subtitle="A moment in your story" size="md">
      <div className="flex items-start gap-3 mb-5">
        <Sparkles size={20} className="text-cl-gold shrink-0 mt-0.5" />
        <p className="text-sm text-cl-text-secondary leading-relaxed">{event.description}</p>
      </div>
      <div className="space-y-3">
        {event.choices.map((choice) => (
          <button
            key={choice.id}
            onClick={() => resolve(event.id, choice)}
            className="w-full text-left cl-panel cl-panel-hover p-4"
          >
            <div className="flex items-center justify-between mb-1">
              <p className="font-medium text-cl-text-primary">{choice.label}</p>
              {choice.cost !== 0 && (
                <span className={choice.cost > 0 ? 'text-sm text-cl-negative font-medium' : 'text-sm text-cl-positive font-medium'}>
                  {choice.cost > 0 ? `-${formatMoney(choice.cost)}` : `+${formatMoney(-choice.cost)}`}
                </span>
              )}
            </div>
            <p className="text-xs text-cl-text-secondary">{choice.description}</p>
          </button>
        ))}
      </div>
    </GameModal>
  );
}
