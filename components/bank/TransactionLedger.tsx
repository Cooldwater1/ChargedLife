'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { Business, HoldingCompany, Transaction, TransactionCategory } from '@/game/types';
import { formatDateLong, formatMoney } from '@/lib/format';
import { toCalendarDate } from '@/game/time/calendar';
import { GameCard } from '@/components/ui/GameCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Select';

const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  salary: 'Salary', living_expenses: 'Living Expenses', business_investment: 'Business Investment',
  business_revenue: 'Business Revenue', business_payroll: 'Business Payroll', business_benefits: 'Employee Benefits', business_rent: 'Business Rent',
  business_marketing: 'Business Marketing', business_cogs: 'Cost of Goods Sold', business_inventory: 'Inventory', business_utilities: 'Utilities',
  business_training: 'Training', business_misc: 'Business Misc',
  business_upgrade: 'Business Upgrade', business_loan_payment: 'Business Loan Payment', business_owner_draw: 'Owner Draw',
  loan_disbursement: 'Loan Disbursed', loan_payment: 'Loan Payment', savings_interest: 'Savings Interest',
  savings_transfer: 'Savings Transfer', property_purchase: 'Property Purchase', property_mortgage: 'Mortgage Payment',
  property_maintenance: 'Property Maintenance', property_rent_income: 'Rental Income', education_tuition: 'Tuition',
  family_expense: 'Family Expense', family_gift: 'Family Gift', wedding: 'Wedding', vehicle_purchase: 'Vehicle Purchase',
  vehicle_expense: 'Vehicle Expense', vehicle_sale: 'Vehicle Sale', boat_purchase: 'Boat Purchase', boat_expense: 'Boat Expense',
  boat_sale: 'Boat Sale', aircraft_purchase: 'Aircraft Purchase', aircraft_expense: 'Aircraft Expense', aircraft_sale: 'Aircraft Sale',
  luxury_purchase: 'Luxury Purchase', luxury_sale: 'Luxury Sale', investment_buy: 'Investment Buy', investment_sell: 'Investment Sell',
  achievement_reward: 'Achievement Reward', relocation: 'Relocation', other: 'Other',
};

type SourceFilter = 'all' | 'personal' | string;

export function TransactionLedger({ transactions, businesses, holdingCompanies, dayIndex }: { transactions: Transaction[]; businesses: Business[]; holdingCompanies: HoldingCompany[]; dayIndex: number }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<TransactionCategory | 'all'>('all');
  const [source, setSource] = useState<SourceFilter>('all');

  const filtered = useMemo(() => {
    return [...transactions]
      .filter((t) => source === 'all' || t.source === source)
      .filter((t) => category === 'all' || t.category === category)
      .filter((t) => !search.trim() || t.description.toLowerCase().includes(search.trim().toLowerCase()))
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 200);
  }, [transactions, source, category, search]);

  const usedCategories = useMemo(() => {
    const set = new Set<TransactionCategory>();
    for (const t of transactions) set.add(t.category);
    return [...set].sort((a, b) => CATEGORY_LABELS[a].localeCompare(CATEGORY_LABELS[b]));
  }, [transactions]);

  return (
    <GameCard title="Transaction Ledger" subtitle={`${filtered.length} of ${transactions.length} transactions shown`}>
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cl-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search description..."
            className="w-full rounded-md bg-white/[0.05] border border-cl-border-strong pl-8 pr-3 py-1.5 text-sm text-cl-text-primary placeholder:text-cl-text-muted"
          />
        </div>
        <Select
          className="w-44"
          value={source}
          onChange={setSource}
          options={[
            { value: 'all', label: 'All Accounts' },
            { value: 'personal', label: 'Personal' },
            ...businesses.map((b) => ({ value: `business:${b.id}`, label: b.name })),
            ...holdingCompanies.map((h) => ({ value: `holding:${h.id}`, label: h.name })),
          ]}
        />
        <Select
          className="w-48"
          value={category}
          onChange={(v) => setCategory(v as TransactionCategory | 'all')}
          options={[
            { value: 'all', label: 'All Categories' },
            ...usedCategories.map((c) => ({ value: c, label: CATEGORY_LABELS[c] })),
          ]}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Search size={28} />} title="No matching transactions" description="Try a different search term or filter." />
      ) : (
        <div className="max-h-96 overflow-y-auto cl-scrollbar-thin pr-2">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-cl-bg-elevated">
              <tr className="text-left text-xs text-cl-text-muted border-b border-cl-border">
                <th className="pb-2 pr-3 font-medium">Date</th>
                <th className="pb-2 pr-3 font-medium">Description</th>
                <th className="pb-2 pr-3 font-medium">Category</th>
                <th className="pb-2 pr-3 font-medium">Account</th>
                <th className="pb-2 pl-3 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cl-border">
              {filtered.map((t) => {
                const business = t.source.startsWith('business:') ? businesses.find((b) => `business:${b.id}` === t.source) : null;
                const holding = t.source.startsWith('holding:') ? holdingCompanies.find((h) => `holding:${h.id}` === t.source) : null;
                const accountName = business?.name ?? holding?.name ?? 'Personal';
                return (
                  <tr key={t.id}>
                    <td className="py-2 pr-3 text-cl-text-muted whitespace-nowrap">{formatDateLong(toCalendarDate(t.timestamp))}</td>
                    <td className="py-2 pr-3 text-cl-text-primary">{t.description}</td>
                    <td className="py-2 pr-3 text-cl-text-muted">{CATEGORY_LABELS[t.category]}</td>
                    <td className="py-2 pr-3 text-cl-text-muted">{accountName}</td>
                    <td className={`py-2 pl-3 text-right font-medium whitespace-nowrap ${t.amount >= 0 ? 'text-cl-positive' : 'text-cl-negative'}`}>
                      {formatMoney(t.amount, { showSign: true })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-cl-text-muted mt-3">Showing the most recent 200 matching transactions as of day {dayIndex}.</p>
    </GameCard>
  );
}
