'use client';

import { useState } from 'react';
import Image from 'next/image';
import { BedDouble, Bath, Building2, Home, Key, Maximize, Star } from 'lucide-react';
import { useGameStore } from '@/game/state/store';
import { PROPERTY_LISTINGS, PROPERTY_TYPE_LABELS, type PropertyListing } from '@/game/constants/properties';
import { RENTAL_LISTINGS, type RentalListing } from '@/game/constants/rentals';
import { buildLoanApplicantProfile, underwriteLoan } from '@/game/simulation/loans';
import { MORTGAGE_DOWNPAYMENT_PCT, MORTGAGE_RATE_ANNUAL, MORTGAGE_TERM_MONTHS } from '@/game/constants/balance';
import { calculateLoanMonthlyPayment } from '@/game/simulation/economy';
import type { PropertyUse } from '@/game/types';
import { formatMoney } from '@/lib/format';
import { GameCard } from '@/components/ui/GameCard';
import { MetricCard } from '@/components/ui/MetricCard';
import { MoneyDisplay } from '@/components/ui/MoneyDisplay';
import { GameButton } from '@/components/ui/GameButton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { GameModal } from '@/components/ui/GameModal';
import { HelpTip } from '@/components/ui/HelpTip';
import { PageHero } from '@/components/ui/PageHero';
import { PAGE_BACKGROUND } from '@/game/constants/assets';
import { GiftAssetModal } from '@/components/assets/GiftAssetModal';
import { cn } from '@/lib/cn';

function PropertyImage({ src, alt, className }: { src?: string; alt: string; className?: string }) {
  return (
    <div className={cn('relative bg-gradient-to-br from-cl-accent/20 via-cl-gold/10 to-transparent flex items-center justify-center overflow-hidden', className)}>
      {src ? <Image src={src} alt={alt} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" /> : <Home size={40} className="text-cl-text-muted/40" />}
    </div>
  );
}

export default function PropertiesPage() {
  const game = useGameStore((s) => s.game);
  const buyPropertyWithCash = useGameStore((s) => s.buyPropertyWithCash);
  const applyForPropertyMortgage = useGameStore((s) => s.applyForPropertyMortgage);
  const sellProperty = useGameStore((s) => s.sellProperty);
  const rentProperty = useGameStore((s) => s.rentProperty);
  const terminateLease = useGameStore((s) => s.terminateLease);
  const hostPropertyParty = useGameStore((s) => s.hostPropertyParty);

  const [tab, setTab] = useState<'buy' | 'rent'>('buy');
  const [purchaseTarget, setPurchaseTarget] = useState<PropertyListing | null>(null);
  const [use, setUse] = useState<PropertyUse>('primary');
  const [financeMethod, setFinanceMethod] = useState<'cash' | 'mortgage'>('mortgage');
  const [downPaymentPct, setDownPaymentPct] = useState(MORTGAGE_DOWNPAYMENT_PCT);
  const [giftTarget, setGiftTarget] = useState<{ id: string; name: string; value: number } | null>(null);

  if (!game) return null;

  const totalEquity = game.player.properties.reduce((s, p) => s + (p.currentValue - p.mortgageBalance), 0);
  const totalMonthlyRentIncome = game.player.properties.filter((p) => p.use === 'rental').reduce((s, p) => s + p.monthlyRent, 0);
  const ownedNames = new Set(game.player.properties.map((p) => p.name));
  const currentRentalListing = game.player.currentRental ? RENTAL_LISTINGS.find((r) => r.id === game.player.currentRental!.listingId) : null;

  const minDownPayment = purchaseTarget ? Math.round(purchaseTarget.price * MORTGAGE_DOWNPAYMENT_PCT) : 0;
  const downPayment = purchaseTarget ? Math.max(minDownPayment, Math.round(purchaseTarget.price * downPaymentPct)) : 0;
  const loanAmount = purchaseTarget ? purchaseTarget.price - downPayment : 0;
  const mortgagePreview = purchaseTarget && loanAmount > 0
    ? underwriteLoan(buildLoanApplicantProfile(game), 'mortgage', loanAmount, MORTGAGE_TERM_MONTHS, MORTGAGE_RATE_ANNUAL)
    : null;
  const previewRate = mortgagePreview?.approvedRateAnnual ?? MORTGAGE_RATE_ANNUAL;
  const previewMonthlyPayment = loanAmount > 0 ? calculateLoanMonthlyPayment(mortgagePreview?.approvedAmount ?? loanAmount, previewRate, MORTGAGE_TERM_MONTHS) : 0;

  const handleClosePurchase = () => { setPurchaseTarget(null); setFinanceMethod('mortgage'); setDownPaymentPct(MORTGAGE_DOWNPAYMENT_PCT); };
  const handleConfirmPurchase = () => {
    if (!purchaseTarget) return;
    if (financeMethod === 'cash') buyPropertyWithCash(purchaseTarget.id, use);
    else applyForPropertyMortgage(purchaseTarget.id, use, downPayment);
    handleClosePurchase();
  };

  return (
    <div className="space-y-6 cl-animate-in">
      <PageHero image={PAGE_BACKGROUND.properties}>
        <h1 className="text-2xl font-bold text-cl-text-primary tracking-tight">Properties</h1>
        <p className="text-sm text-cl-text-secondary mt-1">Buy your way up the property ladder, or rent an apartment while you save.</p>
      </PageHero>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <MetricCard label="Properties Owned" value={game.player.properties.length} icon={<Home size={16} />} />
        <MetricCard label="Total Equity" value={<MoneyDisplay amount={totalEquity} size="lg" colorize />} />
        <MetricCard label="Monthly Rent Income" value={<MoneyDisplay amount={totalMonthlyRentIncome} size="lg" />} accent="positive" />
      </div>

      <div className="flex gap-1 rounded-lg border border-cl-border-strong bg-white/[0.03] p-1 w-fit">
        <button onClick={() => setTab('buy')} className={cn('flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors', tab === 'buy' ? 'bg-cl-accent-strong text-white' : 'text-cl-text-secondary')}>
          <Building2 size={14} /> Buy
        </button>
        <button onClick={() => setTab('rent')} className={cn('flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors', tab === 'rent' ? 'bg-cl-accent-strong text-white' : 'text-cl-text-secondary')}>
          <Key size={14} /> Rent
        </button>
      </div>

      {tab === 'buy' ? (
        <>
          <GameCard title="Your Properties" padding="none">
            {game.player.properties.length === 0 ? (
              <EmptyState icon={<Home size={32} />} title="You don't own any property yet" description="Browse listings below to purchase your first home or investment property." />
            ) : (
              <div className="divide-y divide-cl-border">
                {game.player.properties.map((p) => {
                  const listing = p.listingId ? PROPERTY_LISTINGS.find((l) => l.id === p.listingId) : undefined;
                  return (
                    <div key={p.id} className="flex items-center gap-4 px-5 py-4">
                      <PropertyImage src={listing?.image} alt={p.name} className="w-20 h-16 rounded-lg shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-cl-text-primary">{p.name}</p>
                          <StatusBadge label={p.use === 'primary' ? 'Primary Residence' : p.use === 'rental' ? 'Rental' : 'Vacation Home'} tone={p.use === 'rental' ? 'success' : 'info'} />
                          <StatusBadge label={p.mortgageBalance > 0 ? 'Mortgaged' : 'Owned Outright'} tone={p.mortgageBalance > 0 ? 'warning' : 'success'} />
                        </div>
                        <p className="text-xs text-cl-text-muted">{p.city} · {PROPERTY_TYPE_LABELS[p.type]} · {p.bedrooms} bd · {p.bathrooms} ba</p>
                      </div>
                      <div className="flex items-center gap-6 text-right shrink-0">
                        <div>
                          <p className="text-xs text-cl-text-muted mb-0.5">Value</p>
                          <p className="text-sm font-medium text-cl-text-primary">{formatMoney(p.currentValue)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-cl-text-muted mb-0.5">Equity</p>
                          <p className="text-sm font-medium text-cl-positive">{formatMoney(p.currentValue - p.mortgageBalance)}</p>
                        </div>
                        {p.mortgageBalance > 0 && (
                          <div>
                            <p className="text-xs text-cl-text-muted mb-0.5">Mortgage/mo</p>
                            <p className="text-sm font-medium text-cl-negative">{formatMoney(p.monthlyMortgagePayment)}</p>
                          </div>
                        )}
                        {p.use === 'rental' && (
                          <div>
                            <p className="text-xs text-cl-text-muted mb-0.5">Rent Income</p>
                            <p className="text-sm font-medium text-cl-positive">{formatMoney(p.monthlyRent)}/mo</p>
                          </div>
                        )}
                        {p.use === 'primary' && (
                          <GameButton
                            size="sm" variant="ghost"
                            disabledReason={game.player.cash < Math.round(p.monthlyMaintenance * 0.3 + p.currentValue * 0.0008) + 300 ? 'Not enough cash' : undefined}
                            onClick={() => hostPropertyParty(p.id)}
                          >
                            Host Party
                          </GameButton>
                        )}
                        <GameButton size="sm" variant="secondary" onClick={() => sellProperty(p.id)}>Sell</GameButton>
                        <GameButton
                          size="sm" variant="ghost"
                          disabledReason={p.mortgageBalance > 0 ? 'Pay off mortgage first' : undefined}
                          onClick={() => setGiftTarget({ id: p.id, name: p.name, value: p.currentValue })}
                        >
                          Gift
                        </GameButton>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </GameCard>

          {giftTarget && (
            <GiftAssetModal
              open
              onClose={() => setGiftTarget(null)}
              assetType="property"
              assetId={giftTarget.id}
              assetName={giftTarget.name}
              assetValue={giftTarget.value}
            />
          )}

          <GameCard title="Property Listings" subtitle="Buy with cash, or apply for a real mortgage with underwriting">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {PROPERTY_LISTINGS.map((listing) => {
                const alreadyOwned = ownedNames.has(listing.name);
                const minDown = Math.round(listing.price * MORTGAGE_DOWNPAYMENT_PCT);
                return (
                  <div key={listing.id} className="cl-panel cl-panel-hover overflow-hidden flex flex-col">
                    <PropertyImage src={listing.image} alt={listing.name} className="h-40" />
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-cl-text-primary">{listing.name}</p>
                        <span className="flex items-center gap-0.5 text-cl-gold text-xs">
                          {Array.from({ length: listing.luxuryRating }, (_, i) => <Star key={i} size={11} fill="currentColor" />)}
                        </span>
                      </div>
                      <p className="text-xs text-cl-text-muted mb-2">{listing.city}</p>
                      <p className="text-xs text-cl-text-secondary mb-3 flex-1">{listing.description}</p>
                      <div className="flex items-center gap-3 text-xs text-cl-text-muted mb-3">
                        <span className="flex items-center gap-1"><BedDouble size={12} /> {listing.bedrooms}</span>
                        <span className="flex items-center gap-1"><Bath size={12} /> {listing.bathrooms}</span>
                        <span className="flex items-center gap-1"><Maximize size={12} /> {listing.sqft.toLocaleString('en-US')} sqft</span>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-cl-text-muted">Price</span>
                        <span className="text-sm font-semibold text-cl-text-primary">{formatMoney(listing.price)}</span>
                      </div>
                      <GameButton
                        size="sm"
                        fullWidth
                        disabledReason={alreadyOwned ? 'Already owned' : game.player.cash < minDown ? `Need at least ${formatMoney(minDown)} for a down payment` : undefined}
                        onClick={() => { setPurchaseTarget(listing); setUse(listing.isRentalFriendly ? 'primary' : 'primary'); setFinanceMethod(game.player.cash >= listing.price ? 'cash' : 'mortgage'); setDownPaymentPct(MORTGAGE_DOWNPAYMENT_PCT); }}
                      >
                        View & Purchase
                      </GameButton>
                    </div>
                  </div>
                );
              })}
            </div>
          </GameCard>
        </>
      ) : (
        <>
          <GameCard title="Your Lease" icon={<Key size={16} />}>
            {game.player.currentRental && currentRentalListing ? (
              <div className="flex items-center gap-4">
                <PropertyImage src={currentRentalListing.image} alt={currentRentalListing.name} className="w-24 h-20 rounded-lg shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-cl-text-primary">{currentRentalListing.name}</p>
                  <p className="text-xs text-cl-text-muted mb-2">{currentRentalListing.city}</p>
                  <p className="text-sm text-cl-text-secondary">{formatMoney(game.player.currentRental.monthlyRent)}/mo</p>
                </div>
                <GameButton size="sm" variant="danger" onClick={terminateLease}>Terminate Lease</GameButton>
              </div>
            ) : (
              <p className="text-sm text-cl-text-muted">You&apos;re not currently renting anywhere. Choose a place below to move in.</p>
            )}
          </GameCard>

          <GameCard
            title="Apartments For Rent"
            subtitle="Pay a deposit and first month's rent to move in — cancel the lease anytime"
            action={<HelpTip text="Renting is reversible and needs no credit check — but you build no equity. A mortgage costs more upfront and needs approval, but you own the place." />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {RENTAL_LISTINGS.map((listing: RentalListing) => {
                const isCurrent = game.player.currentRental?.listingId === listing.id;
                return (
                  <div key={listing.id} className="cl-panel cl-panel-hover overflow-hidden flex flex-col">
                    <PropertyImage src={listing.image} alt={listing.name} className="h-36" />
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-cl-text-primary">{listing.name}</p>
                        <span className="flex items-center gap-0.5 text-cl-gold text-xs">
                          {Array.from({ length: listing.qualityRating }, (_, i) => <Star key={i} size={11} fill="currentColor" />)}
                        </span>
                      </div>
                      <p className="text-xs text-cl-text-muted mb-2">{listing.city}</p>
                      <p className="text-xs text-cl-text-secondary mb-3 flex-1">{listing.description}</p>
                      <div className="flex items-center gap-3 text-xs text-cl-text-muted mb-3">
                        <span className="flex items-center gap-1"><BedDouble size={12} /> {listing.bedrooms}</span>
                        <span className="flex items-center gap-1"><Bath size={12} /> {listing.bathrooms}</span>
                        <span className="flex items-center gap-1"><Maximize size={12} /> {listing.sqft.toLocaleString('en-US')} sqft</span>
                      </div>
                      <div className="space-y-1 mb-3 text-xs">
                        <div className="flex items-center justify-between"><span className="text-cl-text-muted">Monthly Rent</span><span className="font-semibold text-cl-text-primary">{formatMoney(listing.monthlyRent)}</span></div>
                        <div className="flex items-center justify-between"><span className="text-cl-text-muted">Deposit</span><span className="text-cl-text-primary">{formatMoney(listing.deposit)}</span></div>
                        <div className="flex items-center justify-between"><span className="text-cl-text-muted">Move-In Cost</span><span className="text-cl-text-primary">{formatMoney(listing.moveInCost)}</span></div>
                        <div className="flex items-center justify-between"><span className="text-cl-text-muted">Est. Utilities</span><span className="text-cl-text-primary">{formatMoney(listing.utilitiesEstimateMonthly)}/mo</span></div>
                      </div>
                      <GameButton
                        size="sm"
                        fullWidth
                        disabledReason={isCurrent ? 'You live here' : game.player.currentRental ? 'End your current lease first' : game.player.cash < listing.moveInCost ? 'Not enough cash to move in' : undefined}
                        onClick={() => rentProperty(listing.id)}
                      >
                        {isCurrent ? 'Current Home' : 'Move In'}
                      </GameButton>
                    </div>
                  </div>
                );
              })}
            </div>
          </GameCard>
        </>
      )}

      {purchaseTarget && (
        <GameModal
          open
          onClose={handleClosePurchase}
          title={purchaseTarget.name}
          subtitle={purchaseTarget.city}
          size="lg"
          footer={
            <GameButton
              onClick={handleConfirmPurchase}
              disabledReason={
                financeMethod === 'cash'
                  ? game.player.cash < purchaseTarget.price ? 'Not enough cash' : undefined
                  : game.player.cash < downPayment ? 'Not enough cash for the down payment' : undefined
              }
            >
              {financeMethod === 'cash' ? 'Buy With Cash' : 'Apply For Mortgage'}
            </GameButton>
          }
        >
          <PropertyImage src={purchaseTarget.image} alt={purchaseTarget.name} className="h-52 rounded-lg mb-5" />
          <p className="text-sm text-cl-text-secondary mb-4">{purchaseTarget.description}</p>

          <div className="flex gap-2 mb-5">
            <button
              onClick={() => setFinanceMethod('cash')}
              className={cn('flex-1 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors', financeMethod === 'cash' ? 'border-cl-accent bg-cl-accent/10 text-cl-accent' : 'border-cl-border-strong text-cl-text-secondary')}
            >
              Buy With Cash
            </button>
            <button
              onClick={() => setFinanceMethod('mortgage')}
              className={cn('flex-1 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors', financeMethod === 'mortgage' ? 'border-cl-accent bg-cl-accent/10 text-cl-accent' : 'border-cl-border-strong text-cl-text-secondary')}
            >
              Apply For Mortgage
            </button>
          </div>

          {financeMethod === 'cash' ? (
            <div className="grid grid-cols-2 gap-3 mb-5 text-center">
              <div className="cl-panel p-3">
                <p className="text-xs text-cl-text-muted mb-1">Price</p>
                <p className="text-sm font-semibold text-cl-text-primary">{formatMoney(purchaseTarget.price)}</p>
              </div>
              <div className="cl-panel p-3">
                <p className="text-xs text-cl-text-muted mb-1">Your Cash</p>
                <p className={cn('text-sm font-semibold', game.player.cash >= purchaseTarget.price ? 'text-cl-positive' : 'text-cl-negative')}>{formatMoney(game.player.cash)}</p>
              </div>
            </div>
          ) : (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-cl-text-secondary uppercase tracking-wide">Down Payment</label>
                <span className="text-sm font-semibold text-cl-text-primary">{formatMoney(downPayment)} ({Math.round((downPayment / purchaseTarget.price) * 100)}%)</span>
              </div>
              <input
                type="range" min={minDownPayment} max={Math.max(minDownPayment, Math.round(purchaseTarget.price * 0.6))} step={1000}
                value={downPayment}
                onChange={(e) => setDownPaymentPct(Number(e.target.value) / purchaseTarget.price)}
                className="w-full accent-cl-accent mb-4"
              />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center mb-3">
                <div className="cl-panel p-3">
                  <p className="text-xs text-cl-text-muted mb-1">Loan Amount</p>
                  <p className="text-sm font-semibold text-cl-text-primary">{formatMoney(loanAmount)}</p>
                </div>
                <div className="cl-panel p-3">
                  <p className="text-xs text-cl-text-muted mb-1">Est. Rate</p>
                  <p className="text-sm font-semibold text-cl-text-primary">{(previewRate * 100).toFixed(2)}%</p>
                </div>
                <div className="cl-panel p-3">
                  <p className="text-xs text-cl-text-muted mb-1">Term</p>
                  <p className="text-sm font-semibold text-cl-text-primary">{MORTGAGE_TERM_MONTHS / 12} yrs</p>
                </div>
                <div className="cl-panel p-3">
                  <p className="text-xs text-cl-text-muted mb-1">Est. Monthly Payment</p>
                  <p className="text-sm font-semibold text-cl-text-primary">{formatMoney(previewMonthlyPayment)}</p>
                </div>
              </div>
              {mortgagePreview && (
                <div className={cn('cl-panel p-3 mb-3', mortgagePreview.status === 'denied' ? '!border-cl-negative/30' : mortgagePreview.status === 'counter_offer' ? '!border-cl-warning/30' : '!border-cl-positive/30')}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-cl-text-primary">Underwriting Preview</span>
                    <StatusBadge
                      label={mortgagePreview.status === 'approved' ? 'Likely Approved' : mortgagePreview.status === 'counter_offer' ? 'Likely Countered' : 'Likely Denied'}
                      tone={mortgagePreview.status === 'approved' ? 'success' : mortgagePreview.status === 'counter_offer' ? 'warning' : 'danger'}
                    />
                  </div>
                  {mortgagePreview.status === 'counter_offer' && mortgagePreview.approvedAmount !== null && (
                    <p className="text-xs text-cl-text-secondary">The bank may only approve {formatMoney(mortgagePreview.approvedAmount)} — you&apos;d need extra cash to cover the {formatMoney(loanAmount - mortgagePreview.approvedAmount)} gap.</p>
                  )}
                  {mortgagePreview.denialReasons.length > 0 && (
                    <p className="text-xs text-cl-negative">{mortgagePreview.denialReasons.join(' ')}</p>
                  )}
                </div>
              )}
              <p className="text-xs text-cl-text-muted">Your cash: {formatMoney(game.player.cash)}</p>
            </div>
          )}

          {purchaseTarget.isRentalFriendly && (
            <div>
              <label className="block text-xs font-medium text-cl-text-secondary uppercase tracking-wide mb-2">Intended Use</label>
              <div className="flex gap-2">
                {(['primary', 'rental', 'vacation'] as PropertyUse[]).map((u) => (
                  <button
                    key={u}
                    onClick={() => setUse(u)}
                    className={cn('flex-1 px-3 py-2 rounded-lg border text-sm font-medium capitalize transition-colors', use === u ? 'border-cl-accent bg-cl-accent/10 text-cl-accent' : 'border-cl-border-strong text-cl-text-secondary')}
                  >
                    {u === 'primary' ? 'Primary' : u === 'rental' ? 'Rental' : 'Vacation'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </GameModal>
      )}
    </div>
  );
}
