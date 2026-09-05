import Image from 'next/image';
import { Star } from 'lucide-react';
import type { Business } from '@/game/types';
import { calculateBusinessValuation } from '@/game/simulation/economy';
import { BUSINESS_INDUSTRY_IMAGE } from '@/game/constants/assets';
import { formatMoney } from '@/lib/format';
import { MoneyDisplay } from '@/components/ui/MoneyDisplay';

const INDUSTRY_LABELS: Record<Business['industry'], string> = {
  fast_food: 'Fast Food Restaurant',
};

export function BusinessHeader({ business }: { business: Business }) {
  const valuation = calculateBusinessValuation(business);
  const stars = business.reputation / 20;

  const heroImage = BUSINESS_INDUSTRY_IMAGE[business.industry];

  return (
    <div className="cl-panel overflow-hidden">
      {heroImage && (
        <div className="relative h-36">
          <Image src={heroImage} alt={INDUSTRY_LABELS[business.industry]} fill sizes="100vw" className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(12,19,36,0.98)] via-[rgba(12,19,36,0.55)] to-transparent" />
        </div>
      )}
      <div className="p-6">
      <div className="flex items-start justify-between flex-wrap gap-6">
        <div>
          <h1 className="text-2xl font-bold text-cl-text-primary tracking-tight">{business.name}</h1>
          <p className="text-sm text-cl-text-secondary mt-1">{INDUSTRY_LABELS[business.industry]}</p>
          <div className="flex items-center gap-4 mt-3 text-sm">
            <span className="flex items-center gap-1.5 text-cl-gold font-medium">
              <Star size={15} fill="currentColor" /> {stars.toFixed(1)} / 5.0
            </span>
            <span className="text-cl-text-muted">{business.locations.length} location{business.locations.length !== 1 ? 's' : ''}</span>
            <span className="text-cl-text-muted">{business.employees.length} employees</span>
          </div>
        </div>

        <div className="flex gap-8">
          <div className="text-right">
            <p className="text-xs text-cl-text-muted mb-1">Business Cash</p>
            <MoneyDisplay amount={business.cash} size="lg" colorize />
          </div>
          <div className="text-right">
            <p className="text-xs text-cl-text-muted mb-1">Estimated Valuation</p>
            <span className="text-2xl font-semibold text-cl-gold font-mono tabular-nums">{formatMoney(valuation, { abbreviate: true })}</span>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
