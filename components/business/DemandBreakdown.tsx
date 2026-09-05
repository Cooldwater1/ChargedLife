import type { DemandModifier } from '@/game/simulation/economy';

export function DemandBreakdown({ expected, modifiers }: { expected: number; modifiers: DemandModifier[] }) {
  return (
    <div>
      <p className="text-xs text-cl-text-muted mb-2">Expected Customers Today</p>
      <p className="text-3xl font-bold text-cl-text-primary tabular-nums mb-3">{expected}</p>
      <div className="space-y-1.5">
        {modifiers.map((m, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <span className="text-cl-text-secondary">{m.label}</span>
            <span className={m.pct >= 0 ? 'text-cl-positive font-medium' : 'text-cl-negative font-medium'}>
              {m.pct >= 0 ? '+' : ''}{m.pct.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
