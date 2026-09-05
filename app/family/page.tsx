'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Baby, Gift, Heart, MessageCircle, Phone, Users } from 'lucide-react';
import { useGameStore } from '@/game/state/store';
import { getChildStageLabel, getRelationshipLabel } from '@/game/simulation/family';
import { getPregnancyProgress, PREGNANCY_STAGE_LABELS } from '@/game/simulation/pregnancy';
import { PERSONALITY_LABELS } from '@/game/constants/family';
import {
  WEDDING_TIERS, EXCLUSIVE_RELATIONSHIP_THRESHOLD, PROPOSAL_MIN_RELATIONSHIP, PROPOSAL_MIN_DAYS_TOGETHER,
  ENGAGEMENT_MIN_DAYS_BEFORE_WEDDING, CHILDBIRTH_COST, POSTPARTUM_COOLDOWN_DAYS,
} from '@/game/constants/balance';
import { EDUCATION_LEVEL_LABELS } from '@/game/types';
import { formatMoney } from '@/lib/format';
import { GameCard } from '@/components/ui/GameCard';
import { GameButton } from '@/components/ui/GameButton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { FamilyMemberModal } from '@/components/family/FamilyMemberModal';
import { DivorceConfirmModal } from '@/components/family/DivorceConfirmModal';
import { HelpTip } from '@/components/ui/HelpTip';

const STATUS_LABELS: Record<string, string> = {
  exclusive: 'In a Relationship', serious: 'Serious Relationship', engaged: 'Engaged', married: 'Married',
};

export default function FamilyPage() {
  const game = useGameStore((s) => s.game);
  const callParent = useGameStore((s) => s.callParent);
  const visitFamily = useGameStore((s) => s.visitFamily);
  const giveFamilyGift = useGameStore((s) => s.giveFamilyGift);
  const refreshDatingPool = useGameStore((s) => s.refreshDatingPool);
  const goOnDate = useGameStore((s) => s.goOnDate);
  const spendTimeWithPartner = useGameStore((s) => s.spendTimeWithPartner);
  const sendMessage = useGameStore((s) => s.sendMessage);
  const giveGiftToCandidate = useGameStore((s) => s.giveGiftToCandidate);
  const becomeExclusive = useGameStore((s) => s.becomeExclusive);
  const proposeMarriage = useGameStore((s) => s.proposeMarriage);
  const planWedding = useGameStore((s) => s.planWedding);
  const breakUp = useGameStore((s) => s.breakUp);
  const divorce = useGameStore((s) => s.divorce);
  const tryForBaby = useGameStore((s) => s.tryForBaby);

  const [giftMemberId, setGiftMemberId] = useState<string | null>(null);
  const [giftAmount, setGiftAmount] = useState('100');
  const [prenupChoice, setPrenupChoice] = useState<'none' | 'standard' | 'strong'>('none');
  const [viewingMemberId, setViewingMemberId] = useState<string | null>(null);
  const [confirmingDivorce, setConfirmingDivorce] = useState(false);

  if (!game) return null;

  const parents = game.player.family.filter((f) => (f.role === 'mother' || f.role === 'father') && !f.deceased);
  const grandparents = game.player.family.filter((f) => (f.role === 'grandmother' || f.role === 'grandfather') && !f.deceased);
  const children = game.player.family.filter((f) => f.role === 'child');
  const partner = game.player.family.find((f) => f.id === game.player.relationship.partnerId);
  const { status, candidates, exclusiveAt, engagedAt } = game.player.relationship;
  const viewingMember = game.player.family.find((f) => f.id === viewingMemberId);

  const daysTogether = exclusiveAt !== null ? game.time.dayIndex - exclusiveAt : 0;
  const daysEngaged = engagedAt !== null ? game.time.dayIndex - engagedAt : 0;
  const canPropose = status === 'serious' && partner && partner.relationship >= PROPOSAL_MIN_RELATIONSHIP && daysTogether >= PROPOSAL_MIN_DAYS_TOGETHER;
  const canMarry = status === 'engaged' && daysEngaged >= ENGAGEMENT_MIN_DAYS_BEFORE_WEDDING;

  const pregnancy = game.player.pregnancy;
  const pregnancyProgress = pregnancy ? getPregnancyProgress(pregnancy, game.time.dayIndex) : null;
  const postpartumDaysLeft = game.player.lastChildBornAt !== null ? POSTPARTUM_COOLDOWN_DAYS - (game.time.dayIndex - game.player.lastChildBornAt) : 0;

  return (
    <div className="space-y-6 cl-animate-in">
      <div className="relative cl-panel overflow-hidden p-6">
        <Image src="/assets/properties/cozy-suburban-family-house.png" alt="" fill sizes="100vw" className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(24,15,6,0.88)] via-[rgba(24,15,6,0.72)] to-[rgba(24,15,6,0.5)]" />
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-cl-text-primary tracking-tight">Family</h1>
          <p className="text-sm text-cl-text-secondary mt-1">Your closest relationships — the people who make it worth it.</p>
        </div>
      </div>

      <GameCard title="Parents" icon={<Users size={16} />} tone="warm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {parents.map((parent) => (
            <div key={parent.id} className="cl-panel-warm p-4">
              <button className="flex items-center justify-between mb-2 w-full text-left" onClick={() => setViewingMemberId(parent.id)}>
                <div>
                  <p className="font-semibold text-cl-text-primary hover:text-cl-accent transition-colors">{parent.name}</p>
                  <p className="text-xs text-cl-text-muted">{parent.role === 'mother' ? 'Mother' : 'Father'} · Age {parent.age}</p>
                </div>
                <StatusBadge label={parent.retired ? 'Retired' : parent.occupation} tone="neutral" />
              </button>
              <ProgressBar value={parent.relationship} tone="accent" label={getRelationshipLabel(parent.relationship)} showValue className="mb-3" />
              <div className="flex gap-2">
                <GameButton size="sm" variant="secondary" icon={<Phone size={13} />} fullWidth onClick={() => callParent(parent.id)}>Call</GameButton>
                <GameButton size="sm" variant="secondary" fullWidth onClick={() => visitFamily(parent.id)}>Visit</GameButton>
                <GameButton size="sm" variant="secondary" icon={<Gift size={13} />} onClick={() => setGiftMemberId(parent.id)}>Gift</GameButton>
              </div>
              {giftMemberId === parent.id && (
                <div className="flex items-center gap-2 mt-2">
                  <input value={giftAmount} onChange={(e) => setGiftAmount(e.target.value)} className="w-full rounded-md bg-white/[0.05] border border-cl-border-strong px-2 py-1.5 text-sm text-cl-text-primary" />
                  <GameButton size="sm" onClick={() => { giveFamilyGift(parent.id, Number(giftAmount)); setGiftMemberId(null); }}>Send</GameButton>
                </div>
              )}
            </div>
          ))}
        </div>
      </GameCard>

      {grandparents.length > 0 && (
        <GameCard title="Grandparents" icon={<Users size={16} />} tone="warm">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {grandparents.map((gp) => (
              <button key={gp.id} onClick={() => setViewingMemberId(gp.id)} className="cl-panel-warm cl-panel-hover p-4 text-left">
                <p className="font-semibold text-cl-text-primary">{gp.name}</p>
                <p className="text-xs text-cl-text-muted mb-2">{gp.role === 'grandmother' ? 'Grandmother' : 'Grandfather'} · Age {gp.age}</p>
                <ProgressBar value={gp.relationship} tone="accent" showValue />
              </button>
            ))}
          </div>
        </GameCard>
      )}

      <GameCard
        title="Relationship"
        icon={<Heart size={16} />}
        tone="warm"
        action={<HelpTip text="Relationships progress through real stages: Dating, Exclusive, Serious, Engaged, Married. Becoming exclusive needs enough relationship score; proposing needs both a high relationship AND enough real days together." />}
      >
        {status === 'single' && (
          <div>
            {candidates.length === 0 ? (
              <EmptyState icon={<Heart size={32} />} title="You're currently single" description="Explore the dating pool to meet someone new." action={<GameButton onClick={refreshDatingPool}>Explore Dating</GameButton>} />
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-cl-text-secondary">Potential matches</p>
                  <GameButton size="sm" variant="secondary" onClick={refreshDatingPool}>Refresh Pool</GameButton>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {candidates.map((c) => (
                    <div key={c.id} className="cl-panel-warm p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold text-cl-text-primary">{c.name}, {c.age}</p>
                          <p className="text-xs text-cl-text-muted">{c.occupation} · {EDUCATION_LEVEL_LABELS[c.educationLevel]}</p>
                        </div>
                        <StatusBadge label={PERSONALITY_LABELS[c.personality]} tone="neutral" />
                      </div>
                      <p className="text-xs text-cl-text-muted mb-2">Compatibility {c.compatibility}% · Income {formatMoney(c.income)}/yr</p>
                      <ProgressBar value={c.relationship} tone="accent" label="Relationship" showValue className="mb-3" />
                      <div className="flex flex-wrap gap-2">
                        <GameButton size="sm" variant="secondary" onClick={() => goOnDate(c.id)}>Go on Date</GameButton>
                        <GameButton size="sm" variant="secondary" icon={<MessageCircle size={13} />} onClick={() => sendMessage(c.id)}>Message</GameButton>
                        <GameButton size="sm" variant="secondary" icon={<Gift size={13} />} onClick={() => giveGiftToCandidate(c.id, 150)}>Gift ($150)</GameButton>
                        <GameButton
                          size="sm"
                          disabledReason={c.relationship < EXCLUSIVE_RELATIONSHIP_THRESHOLD ? `Needs ${EXCLUSIVE_RELATIONSHIP_THRESHOLD}+ relationship` : undefined}
                          onClick={() => becomeExclusive(c.id)}
                        >
                          Become Exclusive
                        </GameButton>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {status !== 'single' && partner && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <button className="text-left" onClick={() => setViewingMemberId(partner.id)}>
                <p className="text-lg font-semibold text-cl-text-primary hover:text-cl-accent transition-colors">{partner.name}</p>
                <p className="text-sm text-cl-text-secondary">{partner.occupation}</p>
              </button>
              <StatusBadge label={STATUS_LABELS[status] ?? status} tone="gold" />
            </div>
            <ProgressBar value={partner.relationship} tone="accent" label={getRelationshipLabel(partner.relationship)} showValue className="mb-2" />
            {(status === 'exclusive' || status === 'serious') && (
              <p className="text-xs text-cl-text-muted mb-4">Together {daysTogether} days{status === 'exclusive' ? ` — becomes a serious relationship after 30 days` : ''}</p>
            )}

            <div className="flex flex-wrap gap-2 mb-4">
              <GameButton size="sm" variant="secondary" disabledReason={game.player.cash < 40 ? 'Not enough cash' : undefined} onClick={spendTimeWithPartner}>Spend Time Together</GameButton>
              <GameButton size="sm" variant="secondary" icon={<Gift size={13} />} onClick={() => setGiftMemberId(partner.id)}>Give Gift</GameButton>
              {status === 'serious' && (
                <GameButton
                  size="sm"
                  disabledReason={!canPropose ? `Needs ${PROPOSAL_MIN_RELATIONSHIP}+ relationship and ${PROPOSAL_MIN_DAYS_TOGETHER}+ days together (${daysTogether}/${PROPOSAL_MIN_DAYS_TOGETHER})` : undefined}
                  onClick={proposeMarriage}
                >
                  Propose ($12,000 ring)
                </GameButton>
              )}
              {status === 'married' && (
                <GameButton
                  size="sm"
                  disabledReason={game.player.pregnancy ? 'Already expecting' : postpartumDaysLeft > 0 ? `Wait ${postpartumDaysLeft} more day(s)` : game.player.cash < CHILDBIRTH_COST ? 'Not enough cash for delivery' : undefined}
                  icon={<Baby size={13} />}
                  onClick={tryForBaby}
                >
                  Try for a Baby
                </GameButton>
              )}
              {status === 'married' ? (
                <GameButton size="sm" variant="danger" onClick={() => setConfirmingDivorce(true)}>Divorce</GameButton>
              ) : (
                <GameButton size="sm" variant="danger" onClick={breakUp}>Break Up</GameButton>
              )}
            </div>

            {giftMemberId === partner.id && (
              <div className="flex items-center gap-2 mb-4">
                <input value={giftAmount} onChange={(e) => setGiftAmount(e.target.value)} className="w-full rounded-md bg-white/[0.05] border border-cl-border-strong px-2 py-1.5 text-sm text-cl-text-primary" />
                <GameButton size="sm" onClick={() => { giveFamilyGift(partner.id, Number(giftAmount)); setGiftMemberId(null); }}>Send</GameButton>
              </div>
            )}

            {status === 'engaged' && (
              <div>
                <p className="text-xs font-medium text-cl-text-secondary uppercase tracking-wide mb-2">
                  Plan Your Wedding {!canMarry && `(available in ${ENGAGEMENT_MIN_DAYS_BEFORE_WEDDING - daysEngaged} day(s))`}
                </p>
                <div className="mb-3">
                  <label className="block text-xs text-cl-text-muted mb-1.5">Prenuptial Agreement</label>
                  <div className="flex gap-2">
                    {(['none', 'standard', 'strong'] as const).map((p) => (
                      <button key={p} onClick={() => setPrenupChoice(p)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border capitalize ${prenupChoice === p ? 'border-cl-accent bg-cl-accent/10 text-cl-accent' : 'border-cl-border-strong text-cl-text-secondary'}`}>
                        {p === 'none' ? 'No Prenup' : `${p} Prenup`}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {WEDDING_TIERS.map((tier) => (
                    <div key={tier.id} className="cl-panel-warm p-3 text-center">
                      <p className="text-sm font-medium text-cl-text-primary mb-1">{tier.name}</p>
                      <p className="text-xs text-cl-text-muted mb-3">{formatMoney(tier.cost)}</p>
                      <GameButton size="sm" fullWidth disabledReason={!canMarry ? 'Engagement too recent' : game.player.cash < tier.cost ? 'Not enough cash' : undefined} onClick={() => planWedding(tier.id, prenupChoice)}>Choose</GameButton>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </GameCard>

      {pregnancy && pregnancyProgress && (
        <GameCard title="Pregnancy" icon={<Baby size={16} />} tone="warm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-lg font-semibold text-cl-text-primary">Week {pregnancyProgress.weeks} of {pregnancyProgress.totalWeeks}</p>
            <StatusBadge label={PREGNANCY_STAGE_LABELS[pregnancyProgress.stage]} tone="gold" />
          </div>
          <ProgressBar value={(pregnancyProgress.weeks / pregnancyProgress.totalWeeks) * 100} tone="gold" showValue className="mb-2" />
          <p className="text-xs text-cl-text-muted">About {pregnancyProgress.daysRemaining} days until {pregnancy.childName} arrives.</p>
        </GameCard>
      )}

      <GameCard title="Children" icon={<Baby size={16} />} tone="warm">
        {children.length === 0 ? (
          <p className="text-sm text-cl-text-muted">No children yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {children.map((child) => (
              <button key={child.id} onClick={() => setViewingMemberId(child.id)} className="cl-panel-warm cl-panel-hover p-4 text-left">
                <p className="font-semibold text-cl-text-primary">{child.name}</p>
                <p className="text-xs text-cl-text-muted mb-2">Age {child.age} · {getChildStageLabel(child.age)}</p>
                <ProgressBar value={child.relationship} tone="accent" label="Bond" showValue />
              </button>
            ))}
          </div>
        )}
      </GameCard>

      {viewingMember && (
        <FamilyMemberModal member={viewingMember} onClose={() => setViewingMemberId(null)} onOpenRelative={(id) => setViewingMemberId(id)} />
      )}

      {confirmingDivorce && (
        <DivorceConfirmModal onClose={() => setConfirmingDivorce(false)} onConfirm={() => { divorce(); setConfirmingDivorce(false); }} />
      )}
    </div>
  );
}
