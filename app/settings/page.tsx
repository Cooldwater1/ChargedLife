'use client';

import { useState } from 'react';
import { AlertOctagon, Bell, Bug, CalendarClock, Hash, HeartPulse, Palette, Sparkles, Settings as SettingsIcon } from 'lucide-react';
import { useGameStore } from '@/game/state/store';
import { ACHIEVEMENT_DEFINITIONS } from '@/game/constants/achievements';
import { GAME_VERSION } from '@/game/constants/balance';
import type { GameSettings } from '@/game/types';
import { GameCard } from '@/components/ui/GameCard';
import { GameButton } from '@/components/ui/GameButton';
import { Select } from '@/components/ui/Select';
import { cn } from '@/lib/cn';

function SettingRow({ icon, label, description, control }: { icon: React.ReactNode; label: string; description: string; control: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 py-3.5 first:pt-0 last:pb-0 border-b border-cl-border last:border-0">
      <div className="flex items-start gap-3 min-w-0">
        <span className="mt-0.5 text-cl-text-muted shrink-0">{icon}</span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-cl-text-primary">{label}</p>
          <p className="text-xs text-cl-text-muted mt-0.5 leading-relaxed">{description}</p>
        </div>
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}

function SegmentedControl<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="flex gap-1 rounded-lg border border-cl-border-strong bg-white/[0.03] p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn('px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap', value === opt.value ? 'bg-cl-accent-strong text-white' : 'text-cl-text-secondary')}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={cn('relative w-10 h-6 rounded-full transition-colors', checked ? 'bg-cl-accent-strong' : 'bg-white/[0.1]')}
    >
      <span className={cn('absolute top-1 w-4 h-4 rounded-full bg-white transition-transform', checked ? 'translate-x-5' : 'translate-x-1')} />
    </button>
  );
}

const DAY_SUMMARY_OPTIONS: { value: GameSettings['daySummaryMode']; label: string }[] = [
  { value: 'always', label: 'Always' },
  { value: 'important_only', label: 'Important Only' },
  { value: 'never', label: 'Never' },
];

export default function SettingsPage() {
  const game = useGameStore((s) => s.game);
  const updateSettings = useGameStore((s) => s.updateSettings);
  const resetSave = useGameStore((s) => s.resetSave);

  const devAddCash = useGameStore((s) => s.devAddCash);
  const devSetAge = useGameStore((s) => s.devSetAge);
  const devAdvanceDays = useGameStore((s) => s.devAdvanceDays);
  const devUnlockAchievement = useGameStore((s) => s.devUnlockAchievement);
  const devAddBusinessCash = useGameStore((s) => s.devAddBusinessCash);
  const devSetReputation = useGameStore((s) => s.devSetReputation);
  const devResetBusiness = useGameStore((s) => s.devResetBusiness);
  const devAddExperience = useGameStore((s) => s.devAddExperience);
  const devCompleteDegree = useGameStore((s) => s.devCompleteDegree);
  const devAddPartner = useGameStore((s) => s.devAddPartner);
  const devAddChild = useGameStore((s) => s.devAddChild);
  const devTriggerEvent = useGameStore((s) => s.devTriggerEvent);
  const devMoveMarket = useGameStore((s) => s.devMoveMarket);

  const [confirmReset, setConfirmReset] = useState(false);
  const [cashAmount, setCashAmount] = useState('50000');
  const [ageValue, setAgeValue] = useState('30');
  const [jumpDaysValue, setJumpDaysValue] = useState('7');
  const [experienceValue, setExperienceValue] = useState('1');
  const [marketPctValue, setMarketPctValue] = useState('5');
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [achievementToUnlock, setAchievementToUnlock] = useState('');

  if (!game) return null;

  return (
    <div className="space-y-6 cl-animate-in">
      <div>
        <h1 className="text-2xl font-bold text-cl-text-primary tracking-tight">Settings</h1>
        <p className="text-sm text-cl-text-secondary mt-1">{GAME_VERSION}</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <GameCard title="Gameplay" icon={<SettingsIcon size={16} />}>
          <SettingRow
            icon={<CalendarClock size={16} />}
            label="Day Summary"
            description="Choose when ChargedLife shows the summary after advancing time."
            control={<SegmentedControl value={game.player.settings.daySummaryMode} options={DAY_SUMMARY_OPTIONS} onChange={(v) => updateSettings({ daySummaryMode: v })} />}
          />
          <SettingRow
            icon={<Sparkles size={16} />}
            label="Animations"
            description="Enable smooth transitions and animated numbers."
            control={<Toggle checked={game.player.settings.animationsEnabled} onChange={() => updateSettings({ animationsEnabled: !game.player.settings.animationsEnabled })} />}
          />
        </GameCard>

        <GameCard title="Notifications" icon={<Bell size={16} />}>
          <SettingRow
            icon={<Bell size={16} />}
            label="In-Game Notifications"
            description="Show important game notifications as they happen."
            control={<Toggle checked={game.player.settings.notificationsEnabled} onChange={() => updateSettings({ notificationsEnabled: !game.player.settings.notificationsEnabled })} />}
          />
        </GameCard>

        <GameCard title="Life Simulation" icon={<HeartPulse size={16} />}>
          <SettingRow
            icon={<HeartPulse size={16} />}
            label="Life Events"
            description={
              game.player.settings.lifeEventsDifficulty === 'relaxed'
                ? 'Relaxed: parents and other family members do not pass away from natural causes.'
                : 'Realistic: family members can pass away from natural causes as they age, rare until advanced age.'
            }
            control={
              <SegmentedControl
                value={game.player.settings.lifeEventsDifficulty}
                options={[{ value: 'relaxed', label: 'Relaxed' }, { value: 'realistic', label: 'Realistic' }]}
                onChange={(v) => updateSettings({ lifeEventsDifficulty: v })}
              />
            }
          />
        </GameCard>

        <GameCard title="Interface" icon={<Palette size={16} />}>
          <SettingRow
            icon={<Hash size={16} />}
            label="Number Format"
            description="How large monetary values are displayed."
            control={
              <SegmentedControl
                value={game.player.settings.numberFormat}
                options={[{ value: 'full', label: 'Full' }, { value: 'abbreviated', label: 'Abbreviated' }]}
                onChange={(v) => updateSettings({ numberFormat: v })}
              />
            }
          />
        </GameCard>

        <GameCard title="Save Data" icon={<AlertOctagon size={16} />}>
          <SettingRow
            icon={<AlertOctagon size={16} />}
            label="Reset Save"
            description="Permanently deletes all progress and returns to the start screen."
            control={
              confirmReset ? (
                <div className="flex gap-2">
                  <GameButton size="sm" variant="danger" onClick={resetSave}>Confirm Reset</GameButton>
                  <GameButton size="sm" variant="ghost" onClick={() => setConfirmReset(false)}>Cancel</GameButton>
                </div>
              ) : (
                <GameButton size="sm" variant="danger" onClick={() => setConfirmReset(true)}>Reset Save</GameButton>
              )
            }
          />
        </GameCard>
      </div>

      <GameCard title="Developer / Beta Tools" subtitle="For testing purposes only" icon={<Bug size={16} />} className="!border-cl-warning/25">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-cl-text-secondary uppercase tracking-wide mb-2">Add / Remove Cash</label>
            <div className="flex gap-2">
              <input value={cashAmount} onChange={(e) => setCashAmount(e.target.value)} className="w-full rounded-md bg-white/[0.05] border border-cl-border-strong px-3 py-1.5 text-sm text-cl-text-primary" />
              <GameButton size="sm" variant="secondary" onClick={() => devAddCash(Number(cashAmount))}>Add</GameButton>
              <GameButton size="sm" variant="secondary" onClick={() => devAddCash(-Number(cashAmount))}>Remove</GameButton>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-cl-text-secondary uppercase tracking-wide mb-2">Set Age</label>
            <div className="flex gap-2">
              <input value={ageValue} onChange={(e) => setAgeValue(e.target.value)} className="w-full rounded-md bg-white/[0.05] border border-cl-border-strong px-3 py-1.5 text-sm text-cl-text-primary" />
              <GameButton size="sm" variant="secondary" onClick={() => devSetAge(Number(ageValue))}>Set</GameButton>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-cl-text-secondary uppercase tracking-wide mb-2">Advance Days</label>
            <div className="flex gap-2">
              <input value={jumpDaysValue} onChange={(e) => setJumpDaysValue(e.target.value)} className="w-full rounded-md bg-white/[0.05] border border-cl-border-strong px-3 py-1.5 text-sm text-cl-text-primary" />
              <GameButton size="sm" variant="secondary" onClick={() => devAdvanceDays(Number(jumpDaysValue))}>Advance</GameButton>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-cl-text-secondary uppercase tracking-wide mb-2">Add Career Experience (years)</label>
            <div className="flex gap-2">
              <input value={experienceValue} onChange={(e) => setExperienceValue(e.target.value)} className="w-full rounded-md bg-white/[0.05] border border-cl-border-strong px-3 py-1.5 text-sm text-cl-text-primary" />
              <GameButton size="sm" variant="secondary" onClick={() => devAddExperience(Number(experienceValue))}>Add</GameButton>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-cl-text-secondary uppercase tracking-wide mb-2">Unlock Achievement</label>
            <Select
              className="w-full"
              value={achievementToUnlock}
              placeholder="Choose achievement..."
              onChange={(v) => {
                setAchievementToUnlock(v);
                if (v) devUnlockAchievement(v);
              }}
              options={ACHIEVEMENT_DEFINITIONS.map((a) => ({ value: a.id, label: a.name }))}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-cl-text-secondary uppercase tracking-wide mb-2">Life & Market</label>
            <div className="flex flex-wrap gap-2">
              <GameButton size="sm" variant="secondary" onClick={devCompleteDegree}>Complete Degree</GameButton>
              <GameButton size="sm" variant="secondary" onClick={devAddPartner}>Add Partner</GameButton>
              <GameButton size="sm" variant="secondary" onClick={devAddChild}>Add Child</GameButton>
              <GameButton size="sm" variant="secondary" onClick={devTriggerEvent}>Trigger Event</GameButton>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-cl-text-secondary uppercase tracking-wide mb-2">Move Market (%)</label>
            <div className="flex gap-2">
              <input value={marketPctValue} onChange={(e) => setMarketPctValue(e.target.value)} className="w-full rounded-md bg-white/[0.05] border border-cl-border-strong px-3 py-1.5 text-sm text-cl-text-primary" />
              <GameButton size="sm" variant="secondary" onClick={() => devMoveMarket(Number(marketPctValue))}>Apply +</GameButton>
              <GameButton size="sm" variant="secondary" onClick={() => devMoveMarket(-Number(marketPctValue))}>Apply -</GameButton>
            </div>
          </div>

          {game.businesses.length > 0 && (
            <>
              <div>
                <label className="block text-xs font-medium text-cl-text-secondary uppercase tracking-wide mb-2">Target Business</label>
                <Select
                  className="w-full"
                  value={selectedBusinessId}
                  placeholder="Choose business..."
                  onChange={setSelectedBusinessId}
                  options={game.businesses.map((b) => ({ value: b.id, label: b.name }))}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-cl-text-secondary uppercase tracking-wide mb-2">Business Actions</label>
                <div className="flex flex-wrap gap-2">
                  <GameButton size="sm" variant="secondary" disabledReason={!selectedBusinessId ? 'Choose a business' : undefined} onClick={() => devAddBusinessCash(selectedBusinessId, 100_000)}>+$100K Cash</GameButton>
                  <GameButton size="sm" variant="secondary" disabledReason={!selectedBusinessId ? 'Choose a business' : undefined} onClick={() => devSetReputation(selectedBusinessId, 95)}>Set Reputation 95</GameButton>
                  <GameButton size="sm" variant="danger" disabledReason={!selectedBusinessId ? 'Choose a business' : undefined} onClick={() => selectedBusinessId && devResetBusiness(selectedBusinessId)}>Delete Business</GameButton>
                </div>
              </div>
            </>
          )}
        </div>
      </GameCard>
    </div>
  );
}
