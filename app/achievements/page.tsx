'use client';

import { useMemo } from 'react';
import { Award, Lock } from 'lucide-react';
import { useGameStore } from '@/game/state/store';
import { ACHIEVEMENT_DEFINITIONS } from '@/game/constants/achievements';
import type { AchievementCategory } from '@/game/types';
import { toCalendarDate } from '@/game/time/calendar';
import { formatDateLong } from '@/lib/format';
import { GameCard } from '@/components/ui/GameCard';
import { MetricCard } from '@/components/ui/MetricCard';
import { cn } from '@/lib/cn';

const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  wealth: 'Wealth',
  business: 'Business',
  career: 'Career',
  property: 'Property',
  progression: 'Progression',
  education: 'Education',
  family: 'Family',
  luxury: 'Luxury',
  life: 'Life',
};

export default function AchievementsPage() {
  const game = useGameStore((s) => s.game);

  const grouped = useMemo(() => {
    if (!game) return null;
    const unlockedMap = new Map(game.player.achievements.map((a) => [a.id, a.unlockedAt]));
    const byCategory = new Map<AchievementCategory, { id: string; name: string; description: string; unlockedAt: number | null }[]>();
    for (const def of ACHIEVEMENT_DEFINITIONS) {
      const list = byCategory.get(def.category) ?? [];
      list.push({ ...def, unlockedAt: unlockedMap.get(def.id) ?? null });
      byCategory.set(def.category, list);
    }
    return byCategory;
  }, [game]);

  if (!game || !grouped) return null;

  const unlockedCount = game.player.achievements.filter((a) => a.unlockedAt !== null).length;

  return (
    <div className="space-y-6 cl-animate-in">
      <div>
        <h1 className="text-2xl font-bold text-cl-text-primary tracking-tight">Achievements</h1>
        <p className="text-sm text-cl-text-secondary mt-1">Track your milestones as you build your empire.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-md">
        <MetricCard label="Unlocked" value={`${unlockedCount} / ${ACHIEVEMENT_DEFINITIONS.length}`} icon={<Award size={16} />} accent="gold" />
        <MetricCard label="Completion" value={`${Math.round((unlockedCount / ACHIEVEMENT_DEFINITIONS.length) * 100)}%`} />
      </div>

      {[...grouped.entries()].map(([category, achievements]) => (
        <GameCard key={category} title={CATEGORY_LABELS[category]} icon={<Award size={16} />}>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {achievements.map((a) => (
              <div
                key={a.id}
                className={cn(
                  'cl-panel p-4 flex items-start gap-3',
                  a.unlockedAt !== null ? '!border-cl-gold/30 bg-gradient-to-br from-cl-gold/[0.04] to-transparent' : 'opacity-60',
                )}
              >
                {a.unlockedAt !== null ? (
                  <Award size={22} className="text-cl-gold shrink-0 mt-0.5" />
                ) : (
                  <Lock size={20} className="text-cl-text-muted shrink-0 mt-0.5" />
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-cl-text-primary">{a.name}</p>
                  <p className="text-xs text-cl-text-secondary mt-0.5">{a.description}</p>
                  {a.unlockedAt !== null && (
                    <p className="text-xs text-cl-gold mt-1.5">Unlocked {formatDateLong(toCalendarDate(a.unlockedAt))}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </GameCard>
      ))}
    </div>
  );
}
