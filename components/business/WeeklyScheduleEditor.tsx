'use client';

import { useState } from 'react';
import { Clock, Copy } from 'lucide-react';
import { useGameStore } from '@/game/state/store';
import { WEEKDAY_LABELS, estimateScheduleImpact, formatScheduleHour } from '@/game/business/schedule';
import type { WeeklySchedule } from '@/game/types';
import { GameButton } from '@/components/ui/GameButton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Select } from '@/components/ui/Select';

const HOUR_OPTIONS = Array.from({ length: 49 }, (_, i) => i * 0.5); // 0 to 24 in 30-min steps

export function WeeklyScheduleEditor({ businessId, locationId, schedule }: { businessId: string; locationId: string; schedule: WeeklySchedule }) {
  const setWeeklySchedule = useGameStore((s) => s.setWeeklySchedule);
  const applySchedulePreset = useGameStore((s) => s.applySchedulePreset);
  const [draft, setDraft] = useState<WeeklySchedule>(schedule);
  const [syncedSchedule, setSyncedSchedule] = useState<WeeklySchedule>(schedule);

  // Presets are applied directly via the store, so keep the draft in sync whenever the saved schedule changes underneath us.
  if (schedule !== syncedSchedule) {
    setSyncedSchedule(schedule);
    setDraft(schedule);
  }

  const impact = estimateScheduleImpact(schedule, draft);
  const isDirty = JSON.stringify(draft) !== JSON.stringify(schedule);

  const updateDay = (index: number, patch: Partial<WeeklySchedule[number]>) => {
    setDraft((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)) as WeeklySchedule);
  };

  const commit = () => setWeeklySchedule(businessId, locationId, draft);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        <GameButton size="sm" variant="secondary" onClick={() => applySchedulePreset(businessId, locationId, 'weekday', undefined, 8, 22)}>Weekday Preset</GameButton>
        <GameButton size="sm" variant="secondary" onClick={() => applySchedulePreset(businessId, locationId, 'weekend', undefined, 10, 20)}>Weekend Preset</GameButton>
        <GameButton size="sm" variant="secondary" onClick={() => applySchedulePreset(businessId, locationId, '24-7')}>24/7</GameButton>
        <GameButton size="sm" variant="secondary" onClick={() => applySchedulePreset(businessId, locationId, 'closed-sundays')}>Closed Sundays</GameButton>
        <GameButton size="sm" variant="ghost" icon={<Copy size={13} />} onClick={() => applySchedulePreset(businessId, locationId, 'copy-to-weekdays', 1)}>Copy Monday to Weekdays</GameButton>
        <GameButton size="sm" variant="ghost" icon={<Copy size={13} />} onClick={() => applySchedulePreset(businessId, locationId, 'copy-to-all', 1)}>Copy Monday to All Days</GameButton>
      </div>

      <div className="space-y-2 mb-4">
        {draft.map((day, i) => (
          <div key={i} className="flex items-center gap-3 cl-panel p-3">
            <button
              onClick={() => updateDay(i, { open: !day.open })}
              className={`w-24 shrink-0 px-2 py-1 rounded-md text-xs font-medium border ${day.open ? 'border-cl-positive/30 bg-cl-positive/10 text-cl-positive' : 'border-cl-border-strong text-cl-text-muted'}`}
            >
              {WEEKDAY_LABELS[i]}
            </button>
            {day.open ? (
              <>
                <Select
                  size="sm"
                  className="w-28"
                  value={day.openHour}
                  onChange={(v) => updateDay(i, { openHour: v })}
                  options={HOUR_OPTIONS.filter((h) => h < 24).map((h) => ({ value: h, label: formatScheduleHour(h) }))}
                />
                <span className="text-cl-text-muted text-xs">to</span>
                <Select
                  size="sm"
                  className="w-28"
                  value={day.closeHour}
                  onChange={(v) => updateDay(i, { closeHour: v })}
                  options={HOUR_OPTIONS.filter((h) => h > day.openHour).map((h) => ({ value: h, label: formatScheduleHour(h) }))}
                />
              </>
            ) : (
              <StatusBadge label="Closed" tone="neutral" />
            )}
          </div>
        ))}
      </div>

      {isDirty && (
        <div className="cl-panel p-3 mb-4 flex items-center justify-between">
          <div className="text-xs text-cl-text-secondary flex items-center gap-2">
            <Clock size={13} />
            {impact.currentWeeklyHours}h/week → {impact.proposedWeeklyHours}h/week
            <span className={impact.deltaPct >= 0 ? 'text-cl-positive font-medium' : 'text-cl-negative font-medium'}>
              ({impact.deltaPct >= 0 ? '+' : ''}{impact.deltaPct}%)
            </span>
          </div>
          <GameButton size="sm" onClick={commit}>Save Schedule</GameButton>
        </div>
      )}
    </div>
  );
}
