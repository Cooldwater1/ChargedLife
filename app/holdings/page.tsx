'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowDownToLine, ArrowUpFromLine, Layers, Plus } from 'lucide-react';
import { useGameStore } from '@/game/state/store';
import { calculateBusinessValuation } from '@/game/simulation/economy';
import { formatMoney } from '@/lib/format';
import { GameCard } from '@/components/ui/GameCard';
import { MetricCard } from '@/components/ui/MetricCard';
import { MoneyDisplay } from '@/components/ui/MoneyDisplay';
import { GameButton } from '@/components/ui/GameButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Select';
import { HelpTip } from '@/components/ui/HelpTip';
import { PageHero } from '@/components/ui/PageHero';
import { PAGE_BACKGROUND } from '@/game/constants/assets';

export default function HoldingsPage() {
  const game = useGameStore((s) => s.game);
  const createHoldingCompany = useGameStore((s) => s.createHoldingCompany);
  const moveBusinessToHolding = useGameStore((s) => s.moveBusinessToHolding);
  const removeBusinessFromHolding = useGameStore((s) => s.removeBusinessFromHolding);
  const transferHoldingCapital = useGameStore((s) => s.transferHoldingCapital);
  const setDividendPolicy = useGameStore((s) => s.setDividendPolicy);
  const setSubsidiaryCapitalBudget = useGameStore((s) => s.setSubsidiaryCapitalBudget);

  const [newName, setNewName] = useState('');
  const [transferAmounts, setTransferAmounts] = useState<Record<string, string>>({});
  const [assignTarget, setAssignTarget] = useState<Record<string, string>>({});
  const [budgetDrafts, setBudgetDrafts] = useState<Record<string, string>>({});

  if (!game) return null;

  const unassignedEligible = game.businesses.filter((b) => !b.holdingCompanyId);
  const totalHoldingCash = game.player.holdingCompanies.reduce((s, h) => s + h.cash, 0);
  const totalSubsidiaries = game.player.holdingCompanies.reduce((s, h) => s + h.subsidiaryBusinessIds.length, 0);

  const getAmount = (id: string) => Number(transferAmounts[id] ?? '10000');

  return (
    <div className="space-y-6 cl-animate-in">
      <PageHero image={PAGE_BACKGROUND.holdings}>
        <h1 className="text-2xl font-bold text-cl-text-primary tracking-tight">Holding Companies</h1>
        <p className="text-sm text-cl-text-secondary mt-1">Group businesses under a parent company for consolidated capital and reporting.</p>
      </PageHero>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <MetricCard label="Holding Companies" value={game.player.holdingCompanies.length} icon={<Layers size={16} />} />
        <MetricCard label="Total Holding Cash" value={<MoneyDisplay amount={totalHoldingCash} size="lg" />} />
        <MetricCard label="Subsidiaries" value={totalSubsidiaries} />
      </div>

      <GameCard title="Form a New Holding Company">
        <div className="flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Anderson Capital Group"
            className="w-full rounded-lg bg-white/[0.05] border border-cl-border-strong px-4 py-2.5 text-sm text-cl-text-primary placeholder:text-cl-text-muted focus:outline-none focus:border-cl-accent transition-colors"
          />
          <GameButton icon={<Plus size={16} />} disabledReason={!newName.trim() ? 'Enter a name' : undefined} onClick={() => { createHoldingCompany(newName.trim()); setNewName(''); }}>
            Create
          </GameButton>
        </div>
        <p className="text-xs text-cl-text-muted mt-2">Any business you own can be placed under a holding company — no level requirement.</p>
      </GameCard>

      {game.player.holdingCompanies.length === 0 ? (
        <EmptyState icon={<Layers size={36} />} title="No holding companies yet" description="Form one above, then add any of your businesses as a subsidiary." />
      ) : (
        <div className="space-y-6">
          {game.player.holdingCompanies.map((holding) => {
            const subsidiaries = game.businesses.filter((b) => b.holdingCompanyId === holding.id);
            const totalValuation = subsidiaries.reduce((s, b) => s + calculateBusinessValuation(b) * (b.ownershipPct / 100), 0);
            const amount = getAmount(holding.id);

            return (
              <GameCard
                key={holding.id}
                title={holding.name}
                subtitle={`${subsidiaries.length} subsidiary business${subsidiaries.length !== 1 ? 'es' : ''}`}
                icon={<Layers size={16} />}
                action={<HelpTip text="Each subsidiary can sweep a % of its own monthly profit up to this holding as a dividend, and the holding can commit a monthly capital budget back down to fund a subsidiary's growth. The holding also pays its own corporate overhead every month regardless of performance — running a holding company isn't free." />}
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                  <div className="cl-panel p-3 text-center">
                    <p className="text-xs text-cl-text-muted mb-1">Holding Cash</p>
                    <p className="text-sm font-semibold text-cl-positive">{formatMoney(holding.cash)}</p>
                  </div>
                  <div className="cl-panel p-3 text-center">
                    <p className="text-xs text-cl-text-muted mb-1">Consolidated Valuation</p>
                    <p className="text-sm font-semibold text-cl-gold">{formatMoney(totalValuation, { abbreviate: true })}</p>
                  </div>
                  <div className="cl-panel p-3 text-center">
                    <p className="text-xs text-cl-text-muted mb-1">Monthly Overhead</p>
                    <p className="text-sm font-semibold text-cl-negative">{formatMoney(holding.monthlyAdminOverhead)}</p>
                  </div>
                  <div className="cl-panel p-3 text-center">
                    <p className="text-xs text-cl-text-muted mb-1">Founded</p>
                    <p className="text-sm font-semibold text-cl-text-primary">Day {holding.foundedAt}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-5">
                  <input
                    value={transferAmounts[holding.id] ?? '10000'}
                    onChange={(e) => setTransferAmounts((prev) => ({ ...prev, [holding.id]: e.target.value }))}
                    className="w-40 rounded-md bg-white/[0.05] border border-cl-border-strong px-3 py-1.5 text-sm text-cl-text-primary"
                  />
                  <GameButton
                    size="sm" variant="secondary" icon={<ArrowDownToLine size={13} />}
                    disabledReason={game.player.cash < amount ? 'Not enough personal cash' : undefined}
                    onClick={() => transferHoldingCapital(holding.id, amount, 'deposit')}
                  >
                    Deposit
                  </GameButton>
                  <GameButton
                    size="sm" variant="secondary" icon={<ArrowUpFromLine size={13} />}
                    disabledReason={holding.cash < amount ? 'Not enough holding cash' : undefined}
                    onClick={() => transferHoldingCapital(holding.id, amount, 'withdraw')}
                  >
                    Withdraw
                  </GameButton>
                </div>

                {subsidiaries.length > 0 && (
                  <div className="space-y-2 mb-5">
                    {subsidiaries.map((b) => {
                      const budgetDraft = budgetDrafts[b.id] ?? String(b.allocatedCapitalBudget);
                      return (
                        <div key={b.id} className="cl-panel p-3">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <Link href={`/businesses/${b.id}`} className="text-sm font-medium text-cl-text-primary hover:text-cl-accent transition-colors">{b.name}</Link>
                              <p className="text-xs text-cl-text-muted">{formatMoney(calculateBusinessValuation(b), { abbreviate: true })} valuation · {b.ownershipPct}% owned</p>
                            </div>
                            <GameButton size="sm" variant="ghost" onClick={() => removeBusinessFromHolding(b.id)}>Remove</GameButton>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <div className="flex items-center justify-between text-xs text-cl-text-muted mb-1">
                                <span>Dividend Policy</span>
                                <span className="text-cl-text-primary font-medium">{b.dividendPolicyPct}% of profit/mo</span>
                              </div>
                              <input
                                type="range" min={0} max={100} step={5}
                                value={b.dividendPolicyPct}
                                onChange={(e) => setDividendPolicy(b.id, Number(e.target.value))}
                                className="w-full accent-cl-accent"
                              />
                            </div>
                            <div>
                              <p className="text-xs text-cl-text-muted mb-1">Capital Allocation ($/mo from holding)</p>
                              <div className="flex items-center gap-2">
                                <input
                                  value={budgetDraft}
                                  onChange={(e) => setBudgetDrafts((prev) => ({ ...prev, [b.id]: e.target.value }))}
                                  className="w-full rounded-md bg-white/[0.05] border border-cl-border-strong px-3 py-1.5 text-sm text-cl-text-primary"
                                />
                                <GameButton
                                  size="sm" variant="secondary"
                                  onClick={() => setSubsidiaryCapitalBudget(b.id, Number(budgetDraft) || 0)}
                                >
                                  Set
                                </GameButton>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {unassignedEligible.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Select
                      className="w-full"
                      value={assignTarget[holding.id] ?? ''}
                      onChange={(v) => setAssignTarget((prev) => ({ ...prev, [holding.id]: v }))}
                      options={[
                        { value: '', label: 'Add a subsidiary...' },
                        ...unassignedEligible.map((b) => ({ value: b.id, label: b.name })),
                      ]}
                    />
                    <GameButton
                      size="sm"
                      disabledReason={!assignTarget[holding.id] ? 'Choose a business' : undefined}
                      onClick={() => { moveBusinessToHolding(assignTarget[holding.id], holding.id); setAssignTarget((prev) => ({ ...prev, [holding.id]: '' })); }}
                    >
                      Add
                    </GameButton>
                  </div>
                )}
              </GameCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
