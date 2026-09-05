'use client';

import { useState } from 'react';
import Image from 'next/image';
import { GraduationCap } from 'lucide-react';
import { useGameStore } from '@/game/state/store';
import { DEGREE_FIELD_LABELS, EDUCATION_PROGRAMS, INSTITUTION_TIER_LABELS } from '@/game/constants/education';
import { INSTITUTION_TIER_IMAGE, PAGE_BACKGROUND } from '@/game/constants/assets';
import { PageHero } from '@/components/ui/PageHero';
import { calculateTuition } from '@/game/simulation/education';
import { EDUCATION_LEVEL_LABELS, type InstitutionTier } from '@/game/types';
import { formatDateLong } from '@/lib/format';
import { toCalendarDate } from '@/game/time/calendar';
import { formatMoney } from '@/lib/format';
import { GameCard } from '@/components/ui/GameCard';
import { GameButton } from '@/components/ui/GameButton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { GameModal } from '@/components/ui/GameModal';

const INSTITUTION_TIERS: InstitutionTier[] = ['community', 'state', 'elite'];

export default function EducationPage() {
  const game = useGameStore((s) => s.game);
  const enroll = useGameStore((s) => s.enrollInEducation);
  const dropOut = useGameStore((s) => s.dropOutOfEducation);

  const [enrollTarget, setEnrollTarget] = useState<string | null>(null);
  const [tier, setTier] = useState<InstitutionTier>('state');
  const [payWithLoan, setPayWithLoan] = useState(false);

  if (!game) return null;

  const { education } = game.player;
  const enrolledProgram = EDUCATION_PROGRAMS.find((p) => p.id === education.enrolledProgramId);
  const targetProgram = EDUCATION_PROGRAMS.find((p) => p.id === enrollTarget);
  const tuitionPreview = targetProgram ? calculateTuition(targetProgram, tier) : 0;

  return (
    <div className="space-y-6 cl-animate-in">
      <PageHero image={PAGE_BACKGROUND.education}>
        <h1 className="text-2xl font-bold text-cl-text-primary tracking-tight">Education</h1>
        <p className="text-sm text-cl-text-secondary mt-1">Degrees unlock better jobs and higher salaries.</p>
      </PageHero>

      <GameCard title="Current Education" icon={<GraduationCap size={16} />}>
        {enrolledProgram ? (
          <div>
            <p className="text-lg font-semibold text-cl-text-primary">{enrolledProgram.name}</p>
            <p className="text-sm text-cl-text-secondary mb-3">{education.institutionTier && INSTITUTION_TIER_LABELS[education.institutionTier]}</p>
            <ProgressBar value={(education.progressDays / education.totalDaysRequired) * 100} tone="accent" label={`${education.progressDays} / ${education.totalDaysRequired} days`} showValue className="mb-4" />
            <GameButton size="sm" variant="danger" onClick={dropOut}>Drop Out</GameButton>
          </div>
        ) : (
          <p className="text-sm text-cl-text-muted">Not currently enrolled in any program.</p>
        )}
      </GameCard>

      <GameCard title="Completed Degrees">
        {education.completedDegrees.length === 0 ? (
          <p className="text-sm text-cl-text-muted">No degrees completed yet.</p>
        ) : (
          <div className="space-y-2">
            {education.completedDegrees.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-cl-text-primary font-medium">
                  {EDUCATION_LEVEL_LABELS[d.level]}{d.field ? ` in ${DEGREE_FIELD_LABELS[d.field]}` : ''}
                </span>
                <span className="text-cl-text-muted text-xs">{formatDateLong(toCalendarDate(d.completedAt))}</span>
              </div>
            ))}
          </div>
        )}
      </GameCard>

      <GameCard title="Available Programs" padding="none">
        <div className="divide-y divide-cl-border">
          {EDUCATION_PROGRAMS.map((program) => (
            <div key={program.id} className="flex items-center justify-between gap-4 px-5 py-4">
              <div>
                <p className="font-semibold text-cl-text-primary">{program.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge label={EDUCATION_LEVEL_LABELS[program.level]} tone="neutral" />
                  <span className="text-xs text-cl-text-muted">{program.durationDays} days</span>
                </div>
              </div>
              <GameButton
                size="sm"
                disabledReason={!!education.enrolledProgramId ? 'Already enrolled in a program' : undefined}
                onClick={() => { setEnrollTarget(program.id); setTier('state'); setPayWithLoan(false); }}
              >
                Enroll
              </GameButton>
            </div>
          ))}
        </div>
      </GameCard>

      {targetProgram && (
        <GameModal
          open
          onClose={() => setEnrollTarget(null)}
          title={targetProgram.name}
          subtitle={`${targetProgram.durationDays} days of study`}
          footer={
            <GameButton
              disabledReason={!payWithLoan && game.player.cash < tuitionPreview ? 'Not enough cash' : undefined}
              onClick={() => { enroll(targetProgram.id, tier, payWithLoan); setEnrollTarget(null); }}
            >
              Enroll & Pay
            </GameButton>
          }
        >
          <div>
            <div className="relative h-40 rounded-lg bg-gradient-to-br from-cl-accent/20 via-cl-gold/10 to-transparent flex items-center justify-center mb-5 overflow-hidden">
              {INSTITUTION_TIER_IMAGE[tier] ? (
                <Image src={INSTITUTION_TIER_IMAGE[tier]} alt={INSTITUTION_TIER_LABELS[tier]} fill sizes="600px" className="object-cover" />
              ) : (
                <GraduationCap size={48} className="text-cl-text-muted/40" />
              )}
            </div>
            <label className="block text-xs font-medium text-cl-text-secondary uppercase tracking-wide mb-2">Institution</label>
            <div className="grid grid-cols-3 gap-2 mb-5">
              {INSTITUTION_TIERS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTier(t)}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${tier === t ? 'border-cl-accent bg-cl-accent/10 text-cl-accent' : 'border-cl-border-strong text-cl-text-secondary'}`}
                >
                  {INSTITUTION_TIER_LABELS[t]}
                </button>
              ))}
            </div>

            <div className="cl-panel p-4 mb-4 flex items-center justify-between">
              <span className="text-sm text-cl-text-secondary">Estimated Tuition</span>
              <span className="text-lg font-semibold text-cl-text-primary">{formatMoney(tuitionPreview)}</span>
            </div>

            <label className="flex items-center gap-2 text-sm text-cl-text-secondary">
              <input type="checkbox" checked={payWithLoan} onChange={(e) => setPayWithLoan(e.target.checked)} className="accent-cl-accent" />
              Finance with a student loan instead of paying cash upfront
            </label>
          </div>
        </GameModal>
      )}
    </div>
  );
}
