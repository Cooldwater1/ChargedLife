'use client';

import { useMemo, useState } from 'react';
import { Briefcase, GraduationCap, Heart, MapPin, User } from 'lucide-react';
import { useGameStore } from '@/game/state/store';
import { JOB_DEFINITIONS, CITY_DEFINITIONS } from '@/game/constants/data';
import { EDUCATION_LEVEL_LABELS } from '@/game/types';
import { getHighestCompletedLevel } from '@/game/simulation/education';
import { calculateNetWorth } from '@/game/simulation/networth';
import { formatMoney } from '@/lib/format';
import { GameCard } from '@/components/ui/GameCard';
import { MetricCard } from '@/components/ui/MetricCard';
import { MoneyDisplay } from '@/components/ui/MoneyDisplay';
import { GameButton } from '@/components/ui/GameButton';
import { GameModal } from '@/components/ui/GameModal';
import { StatusBadge } from '@/components/ui/StatusBadge';

const RELATIONSHIP_STATUS_LABELS: Record<string, string> = {
  single: 'Single', dating: 'Dating', exclusive: 'In a Relationship', engaged: 'Engaged', married: 'Married',
};

export default function ProfilePage() {
  const game = useGameStore((s) => s.game);
  const relocate = useGameStore((s) => s.relocate);
  const [moveModalOpen, setMoveModalOpen] = useState(false);

  const derived = useMemo(() => {
    if (!game) return null;
    const job = JOB_DEFINITIONS.find((j) => j.id === game.player.career.jobId);
    const partner = game.player.family.find((f) => f.id === game.player.relationship.partnerId);
    const netWorth = calculateNetWorth(game);
    const educationLevel = getHighestCompletedLevel(game.player.education.completedDegrees);
    return { job, partner, netWorth, educationLevel };
  }, [game]);

  if (!game || !derived) return null;

  return (
    <div className="space-y-6 cl-animate-in">
      <div className="cl-panel p-6">
        <div className="flex items-start gap-5">
          <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-cl-accent to-cl-accent-strong shrink-0">
            <User size={36} className="text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-cl-text-primary tracking-tight">{game.player.name}</h1>
            <p className="text-sm text-cl-text-secondary mt-1 flex items-center gap-1.5"><MapPin size={13} /> Age {game.player.age} · {game.player.city}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <StatusBadge label={derived.job ? derived.job.title : 'Unemployed'} tone="info" />
              <StatusBadge label={RELATIONSHIP_STATUS_LABELS[game.player.relationship.status]} tone={game.player.relationship.status === 'married' ? 'gold' : 'neutral'} />
              <StatusBadge label={EDUCATION_LEVEL_LABELS[derived.educationLevel]} tone="neutral" />
            </div>
          </div>
          <GameButton size="sm" variant="secondary" onClick={() => setMoveModalOpen(true)}>Relocate</GameButton>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Net Worth" value={<MoneyDisplay amount={derived.netWorth} size="lg" colorize />} />
        <MetricCard label="Lifetime Earnings" value={<MoneyDisplay amount={game.player.statistics.totalMoneyEarned} size="lg" />} />
        <MetricCard label="Days Lived" value={game.player.statistics.daysPlayed} />
        <MetricCard label="Degrees Earned" value={game.player.statistics.degreesEarned} icon={<GraduationCap size={16} />} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <GameCard title="Career" icon={<Briefcase size={16} />}>
          {derived.job ? (
            <div>
              <p className="text-lg font-semibold text-cl-text-primary">{derived.job.title}</p>
              <p className="text-sm text-cl-text-secondary">{derived.job.company}</p>
              <p className="text-xs text-cl-text-muted mt-2">{formatMoney(derived.job.annualSalary)}/year</p>
            </div>
          ) : (
            <p className="text-sm text-cl-text-muted">Currently unemployed.</p>
          )}
        </GameCard>

        <GameCard title="Relationship" icon={<Heart size={16} />}>
          {derived.partner ? (
            <div>
              <p className="text-lg font-semibold text-cl-text-primary">{derived.partner.name}</p>
              <p className="text-sm text-cl-text-secondary">{derived.partner.occupation}</p>
              <p className="text-xs text-cl-text-muted mt-2">Relationship: {derived.partner.relationship}/100</p>
            </div>
          ) : (
            <p className="text-sm text-cl-text-muted">You&apos;re currently single.</p>
          )}
        </GameCard>
      </div>

      <GameModal open={moveModalOpen} onClose={() => setMoveModalOpen(false)} title="Relocate" subtitle="Moving changes cost of living and job market conditions">
        <div className="space-y-2">
          {CITY_DEFINITIONS.map((c) => (
            <button
              key={c.city}
              disabled={c.city === game.player.city}
              onClick={() => { relocate(c.city); setMoveModalOpen(false); }}
              className="w-full text-left cl-panel cl-panel-hover p-3 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-medium text-cl-text-primary">{c.city}{c.city === game.player.city ? ' (Current)' : ''}</p>
                <p className="text-xs text-cl-text-muted">{c.label}</p>
              </div>
              <p className="text-xs text-cl-text-muted">Moving cost ~{formatMoney(Math.round(3_000 * c.costOfLivingMultiplier))}</p>
            </button>
          ))}
        </div>
      </GameModal>
    </div>
  );
}
