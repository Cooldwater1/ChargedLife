'use client';

import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatMoney, formatNumber } from '@/lib/format';

export interface ChartSeries {
  key: string;
  label: string;
  color: string;
}

interface TrendChartProps {
  data: Record<string, number | string>[];
  series: ChartSeries[];
  xKey: string;
  height?: number;
  valueFormatter?: (v: number) => string;
  type?: 'area' | 'line';
}

function CustomTooltip({ active, payload, label, valueFormatter }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string; valueFormatter: (v: number) => string }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="cl-panel !bg-cl-bg-elevated px-3 py-2 text-xs shadow-xl">
      <p className="text-cl-text-muted mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-1.5 font-medium" style={{ color: p.color }}>
          <span className="inline-block w-2 h-2 rounded-full" style={{ background: p.color }} />
          {p.name}: {valueFormatter(p.value)}
        </p>
      ))}
    </div>
  );
}

export function TrendChart({ data, series, xKey, height = 220, valueFormatter = formatNumber, type = 'area' }: TrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center text-sm text-cl-text-muted" style={{ height }}>
        No financial data yet.
      </div>
    );
  }

  const Chart = type === 'area' ? AreaChart : LineChart;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <Chart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fill: 'var(--cl-text-muted)', fontSize: 11 }} axisLine={{ stroke: 'rgba(148,163,184,0.15)' }} tickLine={false} />
        <YAxis tick={{ fill: 'var(--cl-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} width={48} tickFormatter={(v) => (Math.abs(v) >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`)} />
        <Tooltip content={<CustomTooltip valueFormatter={valueFormatter} />} cursor={{ stroke: 'rgba(148,163,184,0.2)' }} />
        {series.map((s) =>
          type === 'area' ? (
            <Area key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} fill={`url(#grad-${s.key})`} strokeWidth={2} />
          ) : (
            <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={2} dot={false} />
          ),
        )}
      </Chart>
    </ResponsiveContainer>
  );
}

export function formatMoneyShort(v: number): string {
  return formatMoney(v, { abbreviate: true });
}
