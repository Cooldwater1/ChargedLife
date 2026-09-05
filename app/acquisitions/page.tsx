'use client';

import { useState } from 'react';
import { Building2, Handshake, Inbox, TrendingDown, TrendingUp } from 'lucide-react';
import { useGameStore } from '@/game/state/store';
import { formatMoney } from '@/lib/format';
import { GameCard } from '@/components/ui/GameCard';
import { MetricCard } from '@/components/ui/MetricCard';
import { GameButton } from '@/components/ui/GameButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { GameModal } from '@/components/ui/GameModal';
import { PageHero } from '@/components/ui/PageHero';
import { PAGE_BACKGROUND } from '@/game/constants/assets';
import type { IncomingBuyerType, NPCBusiness } from '@/game/types';

const GROWTH_TONE: Record<NPCBusiness['growthStyle'], { label: string; tone: 'success' | 'neutral' | 'warning' | 'danger' }> = {
  aggressive: { label: 'Aggressive Growth', tone: 'success' },
  steady: { label: 'Steady', tone: 'neutral' },
  declining: { label: 'Declining', tone: 'warning' },
  struggling: { label: 'Struggling', tone: 'danger' },
};

const BUYER_TYPE_LABELS: Record<IncomingBuyerType, string> = {
  competitor: 'Competitor', private_equity: 'Private Equity Firm', entrepreneur: 'Independent Entrepreneur', holding_company: 'Holding Company',
};

export default function AcquisitionsPage() {
  const game = useGameStore((s) => s.game);
  const submitAcquisitionOffer = useGameStore((s) => s.submitAcquisitionOffer);
  const acceptAcquisitionCounter = useGameStore((s) => s.acceptAcquisitionCounter);
  const withdrawAcquisitionOffer = useGameStore((s) => s.withdrawAcquisitionOffer);
  const respondToIncomingOffer = useGameStore((s) => s.respondToIncomingOffer);

  const [diligenceTarget, setDiligenceTarget] = useState<NPCBusiness | null>(null);
  const [offerAmount, setOfferAmount] = useState('');

  if (!game) return null;

  const forSale = game.npcBusinesses.filter((n) => n.forSale && !n.failed);
  const myOffers = game.player.acquisitionOffers.filter((o) => o.status !== 'withdrawn');
  const incomingOffers = game.player.incomingBusinessOffers.filter((o) => o.status === 'pending');

  const offerFor = (npcId: string) => game.player.acquisitionOffers.find((o) => o.npcBusinessId === npcId && (o.status === 'pending' || o.status === 'countered'));

  const openDiligence = (npc: NPCBusiness) => {
    setDiligenceTarget(npc);
    setOfferAmount(String(npc.askingPrice));
  };

  return (
    <div className="space-y-6 cl-animate-in">
      <PageHero image={PAGE_BACKGROUND.acquisitions}>
        <h1 className="text-2xl font-bold text-cl-text-primary tracking-tight">Acquisitions</h1>
        <p className="text-sm text-cl-text-secondary mt-1">Browse businesses for sale, negotiate a deal, or field offers on your own companies.</p>
      </PageHero>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <MetricCard label="Businesses For Sale" value={forSale.length} icon={<Building2 size={16} />} />
        <MetricCard label="Your Pending Offers" value={myOffers.filter((o) => o.status === 'pending' || o.status === 'countered').length} icon={<Handshake size={16} />} />
        <MetricCard label="Incoming Offers" value={incomingOffers.length} icon={<Inbox size={16} />} />
      </div>

      {incomingOffers.length > 0 && (
        <GameCard title="Incoming Offers on Your Businesses" icon={<Inbox size={16} />}>
          <div className="space-y-3">
            {incomingOffers.map((offer) => {
              const business = game.businesses.find((b) => b.id === offer.businessId);
              if (!business) return null;
              return (
                <div key={offer.id} className="cl-panel p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-cl-text-primary">{offer.buyerName} <span className="text-cl-text-muted font-normal">— {BUYER_TYPE_LABELS[offer.buyerType]}</span></p>
                    <p className="text-xs text-cl-text-muted mt-0.5">Offering {formatMoney(offer.offerAmount)} for {business.name}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <GameButton size="sm" variant="danger" onClick={() => respondToIncomingOffer(offer.id, 'reject')}>Reject</GameButton>
                    <GameButton size="sm" onClick={() => respondToIncomingOffer(offer.id, 'accept')}>Accept & Sell</GameButton>
                  </div>
                </div>
              );
            })}
          </div>
        </GameCard>
      )}

      {myOffers.length > 0 && (
        <GameCard title="Your Offers" icon={<Handshake size={16} />}>
          <div className="space-y-3">
            {myOffers.map((offer) => {
              const npc = game.npcBusinesses.find((n) => n.id === offer.npcBusinessId);
              return (
                <div key={offer.id} className="cl-panel p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-cl-text-primary">{npc?.name ?? 'Business no longer available'}</p>
                    <p className="text-xs text-cl-text-muted mt-0.5">
                      Your offer: {formatMoney(offer.offerAmount)}
                      {offer.counterAmount !== null && ` · Counter: ${formatMoney(offer.counterAmount)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge
                      label={offer.status === 'pending' ? 'Under Review' : offer.status === 'countered' ? 'Countered' : offer.status === 'accepted' ? 'Accepted' : 'Rejected'}
                      tone={offer.status === 'pending' ? 'info' : offer.status === 'countered' ? 'warning' : offer.status === 'accepted' ? 'success' : 'danger'}
                    />
                    {offer.status === 'countered' && offer.counterAmount !== null && (
                      <GameButton size="sm" disabledReason={game.player.cash < offer.counterAmount ? 'Not enough cash' : undefined} onClick={() => acceptAcquisitionCounter(offer.id)}>Accept Counter</GameButton>
                    )}
                    {offer.status === 'pending' && <GameButton size="sm" variant="ghost" onClick={() => withdrawAcquisitionOffer(offer.id)}>Withdraw</GameButton>}
                  </div>
                </div>
              );
            })}
          </div>
        </GameCard>
      )}

      <GameCard title="Businesses For Sale" padding="none">
        {forSale.length === 0 ? (
          <EmptyState icon={<Building2 size={36} />} title="Nothing on the market right now" description="Business owners occasionally list their companies for sale — check back as time passes." />
        ) : (
          <div className="divide-y divide-cl-border">
            {forSale.map((npc) => {
              const growth = GROWTH_TONE[npc.growthStyle];
              const existingOffer = offerFor(npc.id);
              return (
                <div key={npc.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-cl-text-primary">{npc.name}</p>
                      <StatusBadge label={growth.label} tone={growth.tone} />
                      {existingOffer && <StatusBadge label="Offer Pending" tone="gold" />}
                    </div>
                    <p className="text-xs text-cl-text-muted mt-0.5">{npc.city} · {npc.locations} location{npc.locations !== 1 ? 's' : ''} · {npc.employees} employees</p>
                    <div className="flex items-center gap-4 mt-1.5 text-xs text-cl-text-secondary">
                      <span>Revenue {formatMoney(npc.monthlyRevenue)}/mo</span>
                      <span>Profit {formatMoney(npc.monthlyProfit)}/mo</span>
                      <span>Debt {formatMoney(npc.debt)}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-cl-gold mb-2">{formatMoney(npc.askingPrice, { abbreviate: true })}</p>
                    <GameButton size="sm" onClick={() => openDiligence(npc)}>Review</GameButton>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GameCard>

      {diligenceTarget && (
        <GameModal
          open
          onClose={() => setDiligenceTarget(null)}
          title={diligenceTarget.name}
          subtitle={`${diligenceTarget.city} · Founded around day ${diligenceTarget.foundedAt}`}
          size="lg"
          footer={
            <GameButton
              disabledReason={
                !offerAmount || Number(offerAmount) <= 0 ? 'Enter an offer amount'
                : game.player.cash < Number(offerAmount) ? 'Not enough cash'
                : offerFor(diligenceTarget.id) ? 'You already have a pending offer on this business'
                : undefined
              }
              onClick={() => { submitAcquisitionOffer(diligenceTarget.id, Number(offerAmount)); setDiligenceTarget(null); }}
            >
              Submit Offer
            </GameButton>
          }
        >
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
            <div className="cl-panel p-3 text-center">
              <p className="text-xs text-cl-text-muted mb-1">Monthly Revenue</p>
              <p className="text-sm font-semibold text-cl-text-primary">{formatMoney(diligenceTarget.monthlyRevenue)}</p>
            </div>
            <div className="cl-panel p-3 text-center">
              <p className="text-xs text-cl-text-muted mb-1">Monthly Profit</p>
              <p className={`text-sm font-semibold ${diligenceTarget.monthlyProfit >= 0 ? 'text-cl-positive' : 'text-cl-negative'}`}>{formatMoney(diligenceTarget.monthlyProfit)}</p>
            </div>
            <div className="cl-panel p-3 text-center">
              <p className="text-xs text-cl-text-muted mb-1">Outstanding Debt</p>
              <p className="text-sm font-semibold text-cl-negative">{formatMoney(diligenceTarget.debt)}</p>
            </div>
            <div className="cl-panel p-3 text-center">
              <p className="text-xs text-cl-text-muted mb-1">Employees</p>
              <p className="text-sm font-semibold text-cl-text-primary">{diligenceTarget.employees}</p>
            </div>
            <div className="cl-panel p-3 text-center">
              <p className="text-xs text-cl-text-muted mb-1">Locations</p>
              <p className="text-sm font-semibold text-cl-text-primary">{diligenceTarget.locations}</p>
            </div>
            <div className="cl-panel p-3 text-center">
              <p className="text-xs text-cl-text-muted mb-1">Reputation</p>
              <p className="text-sm font-semibold text-cl-text-primary">{(diligenceTarget.reputation / 20).toFixed(1)} / 5.0</p>
            </div>
          </div>

          <div className="cl-panel p-4 mb-5">
            <p className="text-xs font-medium text-cl-text-secondary uppercase tracking-wide mb-3">Revenue Trend (Recent Months)</p>
            <div className="flex items-end gap-1.5 h-16">
              {diligenceTarget.history.map((h, i) => {
                const max = Math.max(...diligenceTarget.history.map((p) => p.revenue), 1);
                return <div key={i} className="flex-1 bg-cl-accent/40 rounded-sm" style={{ height: `${Math.max(4, (h.revenue / max) * 100)}%` }} />;
              })}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-cl-text-muted">
              {diligenceTarget.growthStyle === 'aggressive' || diligenceTarget.growthStyle === 'steady' ? <TrendingUp size={13} className="text-cl-positive" /> : <TrendingDown size={13} className="text-cl-negative" />}
              {GROWTH_TONE[diligenceTarget.growthStyle].label}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-cl-text-secondary uppercase tracking-wide mb-2">
              Your Offer <span className="text-cl-text-muted normal-case">— asking price {formatMoney(diligenceTarget.askingPrice)}</span>
            </label>
            <input
              value={offerAmount}
              onChange={(e) => setOfferAmount(e.target.value)}
              className="w-full rounded-lg bg-white/[0.05] border border-cl-border-strong px-4 py-2.5 text-sm text-cl-text-primary focus:outline-none focus:border-cl-accent transition-colors"
            />
            <p className="text-xs text-cl-text-muted mt-2 leading-relaxed">
              Offers well below asking price are likely to be rejected outright. A fair offer may be accepted, countered, or rejected depending on the owner&apos;s situation.
            </p>
          </div>
        </GameModal>
      )}
    </div>
  );
}
