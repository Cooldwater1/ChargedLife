'use client';

import { BarChart3 } from 'lucide-react';
import { useGameStore } from '@/game/state/store';
import { calculateNetWorth } from '@/game/simulation/networth';
import { toCalendarDate } from '@/game/time/calendar';
import { formatMoney, formatNumber } from '@/lib/format';
import { GameCard } from '@/components/ui/GameCard';

export default function StatisticsPage() {
  const game = useGameStore((s) => s.game);
  if (!game) return null;

  const stats = game.player.statistics;
  const date = toCalendarDate(game.time.dayIndex);
  const netWorth = calculateNetWorth(game);

  const sections: { title: string; rows: { label: string; value: string }[] }[] = [
    {
      title: 'Life',
      rows: [
        { label: 'Days Played', value: formatNumber(stats.daysPlayed) },
        { label: 'Current Age', value: `${game.player.age}` },
        { label: 'Current Year', value: `${date.year}` },
        { label: 'Cities Lived In', value: '1' },
      ],
    },
    {
      title: 'Wealth',
      rows: [
        { label: 'Current Net Worth', value: formatMoney(netWorth) },
        { label: 'Highest Net Worth', value: formatMoney(stats.highestNetWorth) },
        { label: 'Total Money Earned', value: formatMoney(stats.totalMoneyEarned) },
        { label: 'Total Money Spent', value: formatMoney(stats.totalMoneySpent) },
        { label: 'Investment Profit', value: formatMoney(stats.investmentProfit) },
        { label: 'Loans Taken', value: formatNumber(stats.loansTaken) },
      ],
    },
    {
      title: 'Career & Education',
      rows: [
        { label: 'Jobs Held', value: formatNumber(stats.jobsHeld) },
        { label: 'Promotions', value: formatNumber(stats.promotions) },
        { label: 'Degrees Earned', value: formatNumber(stats.degreesEarned) },
      ],
    },
    {
      title: 'Business',
      rows: [
        { label: 'Businesses Started', value: formatNumber(stats.businessesStarted) },
        { label: 'Businesses Sold', value: formatNumber(stats.businessesSold) },
        { label: 'Employees Hired', value: formatNumber(stats.employeesHired) },
        { label: 'Employees Fired', value: formatNumber(stats.employeesFired) },
        { label: 'Customers Served', value: formatNumber(stats.customersServed) },
        { label: 'Marketing Spend', value: formatMoney(stats.marketingSpend) },
      ],
    },
    {
      title: 'Life & Family',
      rows: [
        { label: 'Dates Been On', value: formatNumber(stats.datesBeenOn) },
        { label: 'Years Married', value: formatNumber(stats.yearsMarried) },
        { label: 'Properties Purchased', value: formatNumber(stats.propertiesPurchased) },
        { label: 'Vehicles Purchased', value: formatNumber(stats.vehiclesPurchased) },
        { label: 'Boats Purchased', value: formatNumber(stats.boatsPurchased) },
        { label: 'Aircraft Purchased', value: formatNumber(stats.aircraftPurchased) },
        { label: 'Luxury Items Purchased', value: formatNumber(stats.luxuryPurchased) },
      ],
    },
  ];

  return (
    <div className="space-y-6 cl-animate-in">
      <div>
        <h1 className="text-2xl font-bold text-cl-text-primary tracking-tight">Statistics</h1>
        <p className="text-sm text-cl-text-secondary mt-1">Your lifetime stats since starting ChargedLife.</p>
      </div>

      {sections.map((section) => (
        <GameCard key={section.title} title={section.title} icon={<BarChart3 size={16} />} padding="none">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 divide-cl-border">
            {section.rows.map((row, i) => (
              <div key={row.label} className={`flex items-center justify-between px-5 py-3.5 ${i % 2 === 0 ? 'md:border-r md:border-cl-border' : ''}`}>
                <span className="text-sm text-cl-text-secondary">{row.label}</span>
                <span className="text-sm font-semibold text-cl-text-primary tabular-nums">{row.value}</span>
              </div>
            ))}
          </div>
        </GameCard>
      ))}
    </div>
  );
}
