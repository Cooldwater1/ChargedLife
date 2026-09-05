'use client';

import { useMemo } from 'react';
import { Briefcase, Check, Lock, TrendingUp, X, Zap } from 'lucide-react';
import { useGameStore } from '@/game/state/store';
import { INDUSTRY_LABELS, JOB_DEFINITIONS } from '@/game/constants/data';
import { checkJobEligibility, getNextLadderJob } from '@/game/simulation/career';
import type { IndustryKey } from '@/game/types';
import { formatMoney } from '@/lib/format';
import { GameCard } from '@/components/ui/GameCard';
import { GameButton } from '@/components/ui/GameButton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHero } from '@/components/ui/PageHero';
import { PAGE_BACKGROUND } from '@/game/constants/assets';
import { cn } from '@/lib/cn';

const INDUSTRIES: IndustryKey[] = ['retail', 'marketing', 'finance', 'technology'];

export default function CareerPage() {
  const game = useGameStore((s) => s.game);
  const applyForJob = useGameStore((s) => s.applyForJob);
  const quitJob = useGameStore((s) => s.quitJob);
  const requestPromotion = useGameStore((s) => s.requestPromotion);
  const requestRaise = useGameStore((s) => s.requestRaise);

  const currentJob = useMemo(() => JOB_DEFINITIONS.find((j) => j.id === game?.player.career.jobId) ?? null, [game]);

  const derived = useMemo(() => {
    if (!game || !currentJob) return null;
    const nextJob = getNextLadderJob(JOB_DEFINITIONS, currentJob);
    const nextEligibility = nextJob ? checkJobEligibility(nextJob, game.player.education, game.player.career) : null;
    const canRequestRaise = game.player.career.lastRaiseRequestAt === null || game.time.dayIndex - game.player.career.lastRaiseRequestAt >= 90;
    const effectiveSalary = currentJob.annualSalary + game.player.career.salaryOverride;
    return { nextJob, nextEligibility, canRequestRaise, effectiveSalary };
  }, [game, currentJob]);

  if (!game) return null;

  const { career } = game.player;

  return (
    <div className="space-y-6 cl-animate-in">
      <PageHero image={PAGE_BACKGROUND.career}>
        <h1 className="text-2xl font-bold text-cl-text-primary tracking-tight">Career</h1>
        <p className="text-sm text-cl-text-secondary mt-1">Build steady income and climb the ladder in your industry.</p>
      </PageHero>

      {currentJob && derived ? (
        <GameCard title="Current Position" icon={<Briefcase size={16} />}>
          <div className="flex items-start justify-between flex-wrap gap-6">
            <div>
              <p className="text-lg font-semibold text-cl-text-primary">{currentJob.title}</p>
              <p className="text-sm text-cl-text-secondary">{currentJob.company}</p>
              <div className="flex items-center gap-2 mt-3">
                <StatusBadge label={INDUSTRY_LABELS[currentJob.industry]} tone="info" />
                <StatusBadge label={`Tier ${currentJob.tier}`} tone="neutral" />
                <StatusBadge label={`${currentJob.workloadHoursPerWeek}h/week`} tone="neutral" />
              </div>
            </div>
            <div className="flex gap-8">
              <div>
                <p className="text-xs text-cl-text-muted mb-1">Annual Salary</p>
                <p className="text-base font-semibold text-cl-text-primary">{formatMoney(derived.effectiveSalary)}</p>
                {career.salaryOverride > 0 && <p className="text-xs text-cl-positive mt-0.5">+{formatMoney(career.salaryOverride)} from raises</p>}
              </div>
              <div>
                <p className="text-xs text-cl-text-muted mb-1">Weekly Pay</p>
                <p className="text-base font-semibold text-cl-positive">{formatMoney(Math.round(derived.effectiveSalary / 52))}</p>
                <p className="text-xs text-cl-text-muted mt-0.5">Every Friday</p>
              </div>
              <div>
                <p className="text-xs text-cl-text-muted mb-1">Performance</p>
                <p className="text-base font-semibold text-cl-text-primary">{Math.round(career.performanceScore)}/100</p>
              </div>
            </div>
            <div className="flex gap-2">
              <GameButton
                size="sm"
                variant="secondary"
                icon={<Zap size={13} />}
                disabledReason={!derived.canRequestRaise ? 'You can request another raise later' : undefined}
                onClick={requestRaise}
              >
                Request Raise
              </GameButton>
              <GameButton variant="danger" size="sm" onClick={quitJob}>Quit Job</GameButton>
            </div>
          </div>

          <div className="mt-5 pt-5 border-t border-cl-border">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs text-cl-text-secondary flex items-center gap-1.5"><TrendingUp size={13} /> Promotion Progress</p>
              <p className="text-xs text-cl-text-muted">{career.experienceYears.toFixed(1)} years experience</p>
            </div>
            <ProgressBar value={career.promotionProgress} tone="accent" />

            {derived.nextJob && (
              <div className="mt-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-cl-text-primary font-medium">Next: {derived.nextJob.title}</p>
                  <p className="text-xs text-cl-text-muted">{formatMoney(derived.nextJob.annualSalary)}/year</p>
                </div>
                <GameButton
                  size="sm"
                  disabledReason={career.promotionProgress < 100 ? 'Reach 100% promotion progress first' : !derived.nextEligibility?.eligible ? 'Requirements not yet met' : undefined}
                  onClick={requestPromotion}
                >
                  Apply for Promotion
                </GameButton>
              </div>
            )}
          </div>
        </GameCard>
      ) : (
        <EmptyState icon={<Briefcase size={36} />} title="You're currently unemployed" description="Apply for a job below to start earning a weekly salary." />
      )}

      {INDUSTRIES.map((industry) => (
        <GameCard key={industry} title={INDUSTRY_LABELS[industry]} subtitle="Salary is paid every Friday" padding="none">
          <div className="divide-y divide-cl-border">
            {JOB_DEFINITIONS.filter((j) => j.industry === industry).map((job) => {
              const isCurrent = job.id === currentJob?.id;
              const eligibility = checkJobEligibility(job, game.player.education, game.player.career);
              return (
                <div key={job.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-cl-text-primary">{job.title}</p>
                      <StatusBadge label={`Tier ${job.tier}`} tone="neutral" />
                      {!eligibility.eligible && !isCurrent && <StatusBadge label="Locked" tone="warning" />}
                    </div>
                    <p className="text-sm text-cl-text-secondary">{job.company}</p>
                    <p className="text-xs text-cl-text-muted mt-1 max-w-xl">{job.description}</p>
                    {eligibility.checks.length > 0 && (
                      <div className="flex flex-wrap gap-3 mt-2">
                        {eligibility.checks.map((check, i) => (
                          <span key={i} className={cn('flex items-center gap-1 text-xs', check.met ? 'text-cl-positive' : 'text-cl-text-muted')}>
                            {check.met ? <Check size={12} /> : <X size={12} />} {check.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-cl-text-primary mb-2">{formatMoney(job.annualSalary)}/yr</p>
                    <GameButton
                      size="sm"
                      variant={isCurrent ? 'secondary' : 'primary'}
                      disabled={isCurrent}
                      icon={!eligibility.eligible && !isCurrent ? <Lock size={13} /> : undefined}
                      disabledReason={isCurrent ? 'Current job' : !eligibility.eligible ? 'Requirements not met' : undefined}
                      onClick={() => applyForJob(job.id)}
                    >
                      {isCurrent ? 'Current Job' : 'Apply'}
                    </GameButton>
                  </div>
                </div>
              );
            })}
          </div>
        </GameCard>
      ))}
    </div>
  );
}
