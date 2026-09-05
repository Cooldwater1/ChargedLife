'use client';

import { useMemo, useState } from 'react';
import { TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { useGameStore } from '@/game/state/store';
import { calculateHoldingGain, calculatePortfolioValue } from '@/game/simulation/investments';
import { formatMoney, formatPercent, formatStockPrice } from '@/lib/format';
import { GameCard } from '@/components/ui/GameCard';
import { MetricCard } from '@/components/ui/MetricCard';
import { MoneyDisplay } from '@/components/ui/MoneyDisplay';
import { GameButton } from '@/components/ui/GameButton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TrendChart } from '@/components/ui/TrendChart';
import { EmptyState } from '@/components/ui/EmptyState';
import { GameModal } from '@/components/ui/GameModal';
import { PageHero } from '@/components/ui/PageHero';
import { PAGE_BACKGROUND } from '@/game/constants/assets';
import type { MarketInstrument } from '@/game/types';

const ASSET_CLASS_LABELS: Record<string, string> = { stock: 'Stock', etf: 'ETF', crypto: 'Crypto' };

export default function InvestmentsPage() {
  const game = useGameStore((s) => s.game);
  const buyStock = useGameStore((s) => s.buyStock);
  const sellStock = useGameStore((s) => s.sellStock);
  const [tradeTarget, setTradeTarget] = useState<MarketInstrument | null>(null);
  const [tradeShares, setTradeShares] = useState('1');
  const [tradeMode, setTradeMode] = useState<'buy' | 'sell'>('buy');

  const portfolioValue = useMemo(() => (game ? calculatePortfolioValue(game.player.investments, game.market) : 0), [game]);

  if (!game) return null;

  const todayChange = game.market.reduce((sum, m) => {
    const holding = game.player.investments.holdings.find((h) => h.symbol === m.symbol);
    if (!holding) return sum;
    return sum + (m.price - m.previousClose) * holding.shares;
  }, 0);

  const chartData = tradeTarget?.history.map((h) => ({ day: `D${h.dayIndex}`, price: Number(h.price.toFixed(2)) })) ?? [];

  const heldShares = tradeTarget ? game.player.investments.holdings.find((h) => h.symbol === tradeTarget.symbol)?.shares ?? 0 : 0;
  const tradeCost = tradeTarget ? tradeTarget.price * Number(tradeShares || 0) : 0;

  return (
    <div className="space-y-6 cl-animate-in">
      <PageHero image={PAGE_BACKGROUND.investments}>
        <h1 className="text-2xl font-bold text-cl-text-primary tracking-tight">Investments</h1>
        <p className="text-sm text-cl-text-secondary mt-1">Stocks, ETFs, and crypto — grow your wealth strategically.</p>
      </PageHero>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Portfolio Value" value={<MoneyDisplay amount={portfolioValue} size="lg" />} icon={<Wallet size={16} />} />
        <MetricCard label="Today's Change" value={<MoneyDisplay amount={todayChange} size="lg" colorize showSign />} />
        <MetricCard label="Realized Gains" value={<MoneyDisplay amount={game.player.investments.realizedGains} size="lg" colorize />} />
        <MetricCard label="Cash Available" value={<MoneyDisplay amount={game.player.cash} size="lg" />} />
      </div>

      <GameCard title="Your Holdings" padding="none">
        {game.player.investments.holdings.length === 0 ? (
          <EmptyState icon={<TrendingUp size={32} />} title="You don't own any investments yet" description="Buy your first shares from the market below." />
        ) : (
          <div className="divide-y divide-cl-border">
            {game.player.investments.holdings.map((h) => {
              const instrument = game.market.find((m) => m.symbol === h.symbol);
              if (!instrument) return null;
              const { value, gain, gainPct } = calculateHoldingGain(h, game.market);
              return (
                <div key={h.symbol} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="font-semibold text-cl-text-primary">{instrument.name} <span className="text-cl-text-muted font-normal">{instrument.symbol}</span></p>
                    <p className="text-xs text-cl-text-muted">{h.shares} shares @ avg {formatStockPrice(h.avgCost)}</p>
                  </div>
                  <div className="flex items-center gap-6 text-right">
                    <div>
                      <p className="text-xs text-cl-text-muted mb-0.5">Value</p>
                      <p className="text-sm font-medium text-cl-text-primary">{formatMoney(value)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-cl-text-muted mb-0.5">Gain/Loss</p>
                      <p className={gain >= 0 ? 'text-sm font-medium text-cl-positive' : 'text-sm font-medium text-cl-negative'}>{formatPercent(gainPct, { showSign: true, decimals: 1 })}</p>
                    </div>
                    <GameButton size="sm" variant="secondary" onClick={() => { setTradeTarget(instrument); setTradeMode('sell'); setTradeShares(String(h.shares)); }}>Trade</GameButton>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GameCard>

      <GameCard title="Market" padding="none">
        <div className="divide-y divide-cl-border">
          {game.market.map((m) => {
            const change = m.previousClose > 0 ? ((m.price - m.previousClose) / m.previousClose) * 100 : 0;
            return (
              <div key={m.symbol} className="flex items-center justify-between px-5 py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-cl-text-primary">{m.name}</p>
                    <StatusBadge label={ASSET_CLASS_LABELS[m.assetClass]} tone="neutral" />
                  </div>
                  <p className="text-xs text-cl-text-muted">{m.symbol} · {m.sector}</p>
                </div>
                <div className="flex items-center gap-6 text-right">
                  <p className="text-sm font-semibold text-cl-text-primary">{formatStockPrice(m.price)}</p>
                  <p className={`text-xs font-medium flex items-center gap-1 ${change >= 0 ? 'text-cl-positive' : 'text-cl-negative'}`}>
                    {change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {formatPercent(change, { showSign: true, decimals: 2 })}
                  </p>
                  <GameButton size="sm" onClick={() => { setTradeTarget(m); setTradeMode('buy'); setTradeShares('1'); }}>Trade</GameButton>
                </div>
              </div>
            );
          })}
        </div>
      </GameCard>

      {tradeTarget && (
        <GameModal
          open
          onClose={() => setTradeTarget(null)}
          title={tradeTarget.name}
          subtitle={`${tradeTarget.symbol} · ${formatStockPrice(tradeTarget.price)}`}
          size="lg"
          footer={
            <>
              <GameButton
                variant="secondary"
                disabledReason={heldShares < Number(tradeShares || 0) || Number(tradeShares) <= 0 ? 'Not enough shares' : undefined}
                onClick={() => { sellStock(tradeTarget.symbol, Number(tradeShares)); setTradeTarget(null); }}
              >
                Sell
              </GameButton>
              <GameButton
                disabledReason={game.player.cash < tradeCost || Number(tradeShares) <= 0 ? 'Not enough cash' : undefined}
                onClick={() => { buyStock(tradeTarget.symbol, Number(tradeShares)); setTradeTarget(null); }}
              >
                Buy
              </GameButton>
            </>
          }
        >
          <TrendChart data={chartData} xKey="day" valueFormatter={(v) => formatStockPrice(v)} series={[{ key: 'price', label: 'Price', color: 'var(--cl-accent)' }]} type="line" />
          <div className="mt-4">
            <label className="block text-xs font-medium text-cl-text-secondary uppercase tracking-wide mb-2">Shares</label>
            <input
              value={tradeShares}
              onChange={(e) => setTradeShares(e.target.value)}
              className="w-full rounded-md bg-white/[0.05] border border-cl-border-strong px-3 py-2 text-sm text-cl-text-primary"
            />
            <p className="text-xs text-cl-text-muted mt-2">
              {tradeMode === 'buy' ? `Cost: ${formatMoney(tradeCost)}` : `You own ${heldShares} shares`}
            </p>
          </div>
        </GameModal>
      )}
    </div>
  );
}
