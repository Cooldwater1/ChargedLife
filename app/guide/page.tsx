'use client';

import { useState } from 'react';
import {
  BookOpen, ChevronDown, Heart, Building2, Landmark, Users2, Layers, Handshake, AlertTriangle,
} from 'lucide-react';
import { GameCard } from '@/components/ui/GameCard';
import { cn } from '@/lib/cn';

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  body: { heading: string; text: string }[];
}

const SECTIONS: Section[] = [
  {
    id: 'basics',
    title: 'Getting Started',
    icon: <BookOpen size={16} />,
    body: [
      { heading: 'Next Day', text: 'Next Day simulates one day at a time — the core loop. Every day matters now: inventory deliveries, market trends, and family events all play out day by day, so decisions are made one day at a time rather than skipped over in bulk.' },
      { heading: 'Notifications', text: 'The bell in the top bar collects everything worth knowing — job offers, loan decisions, family contact, business alerts. Nothing important happens silently.' },
    ],
  },
  {
    id: 'family',
    title: 'Family & Relationships',
    icon: <Heart size={16} />,
    body: [
      { heading: 'Relationship stages', text: 'Dating → Exclusive → Serious → Engaged → Married. Becoming exclusive needs a high enough relationship score with a candidate. Exclusive automatically becomes Serious after enough time together. Proposing requires both a strong relationship and enough real days together — you cannot rush from meeting someone to marriage overnight.' },
      { heading: 'Pregnancy', text: '"Try for a Baby" rolls a chance to conceive — it is not an instant baby. A real pregnancy follows (roughly 9 months of simulated days), visible on the Family page with a trimester tracker. Birth happens automatically when the due date arrives, and there is a recovery period before you can try again.' },
      { heading: 'Family relationships are dynamic', text: 'Calling, visiting, and gifting family members raises relationship over time — but ignoring people for weeks or months causes a slow, realistic decay. Family members sometimes reach out to you first, too.' },
      { heading: 'Gifting has real consequences', text: 'A large enough gift can change a family member\'s life — pushing them toward retirement or a lifestyle change depending on their age, personality, and new financial position. It is not just a number going up.' },
      { heading: 'Mortality setting', text: 'In Settings, choose Relaxed (nobody passes away from natural causes — the friendly default) or Realistic (age-based mortality, rare until advanced age, handled respectfully). Either way, a death only happens off-screen with simple, non-graphic language.' },
      { heading: 'Divorce', text: 'A struggling marriage can end in divorce. Before it is final, you always see an estimated settlement — shared property and investments, monthly child support, and who keeps the primary home — so there are no surprises. A prenup chosen at marriage changes how much is protected.' },
    ],
  },
  {
    id: 'business',
    title: 'Running a Business',
    icon: <Building2 size={16} />,
    body: [
      { heading: 'Every dollar is real', text: 'Revenue, cost of goods, payroll, rent, marketing, utilities, and loan payments all flow through your actual transaction ledger — nothing is a hidden multiplier.' },
      { heading: 'Weekly schedule', text: 'Set open/closed and hours per day of the week from the Operations tab, with presets (Weekday, Weekend, 24/7, Closed Sundays) and a live preview of the effect before you save.' },
      { heading: 'Insights tab', text: 'A dedicated Insights tab reads your actual numbers — capacity vs. demand, staffing gaps, pricing vs. the local market, and cash runway — and tells you the specific dollar impact and what to do about it.' },
      { heading: 'Hiring', text: 'The hiring panel stays open after each hire so you can keep staffing multiple locations without reopening it, and shows the live before/after effect on headcount and payroll.' },
    ],
  },
  {
    id: 'management',
    title: 'Delegation & Management',
    icon: <Users2 size={16} />,
    body: [
      { heading: 'Manager hierarchy', text: 'As a business grows, you can hire Location Managers, then Regional Managers, an Operations Director, and eventually a CFO/CMO/COO/CEO — each tier unlocking at a higher business level.' },
      { heading: 'Delegation is a real tradeoff', text: 'For each area (pricing, hiring, staffing, marketing, inventory, operations) you choose whether you or a manager handles it. A manager\'s skill genuinely affects the quality of their decisions — a weak manager is a real cost, not free automation.' },
    ],
  },
  {
    id: 'holdings',
    title: 'Holding Companies',
    icon: <Layers size={16} />,
    body: [
      { heading: 'Why use one', text: 'A holding company groups multiple mature businesses under one parent, with its own treasury you can move capital in and out of, separate from any one subsidiary\'s own cash.' },
      { heading: 'Partial ownership', text: 'Businesses acquired at less than 100% ownership still count toward your net worth — just scaled by your ownership percentage.' },
    ],
  },
  {
    id: 'acquisitions',
    title: 'Acquisitions',
    icon: <Handshake size={16} />,
    body: [
      { heading: 'Buying a business', text: 'The Acquisitions marketplace lists businesses currently for sale with real financials for due diligence. Offer below asking and the owner may reject, counter, or — rarely — accept anyway; a fair offer has a real chance of success.' },
      { heading: 'Being approached', text: 'Your own profitable businesses can attract unsolicited offers from competitors, private equity, entrepreneurs, or other holding companies. You can accept, reject, or just let the offer expire.' },
    ],
  },
  {
    id: 'money',
    title: 'Bank & Financial Health',
    icon: <Landmark size={16} />,
    body: [
      { heading: 'Loans take time', text: 'Applying for a loan is not instant — it goes to underwriting based on your credit score, income, employment history, debt-to-income ratio, and (for business loans) profitability, with a decision arriving in a few days. You may be approved, denied with clear reasons, or offered a smaller counter amount.' },
      { heading: '"What My Life Costs"', text: 'A daily/weekly/monthly cost breakdown by category (housing, transport, food, children, loans, subscriptions, lifestyle assets) built entirely from what you actually own — never a flat guess.' },
      { heading: 'Emergency runway', text: 'How many months your current cash would cover your current expenses if all income stopped — a quick read on how exposed you are.' },
    ],
  },
  {
    id: 'ruin',
    title: 'Financial Ruin',
    icon: <AlertTriangle size={16} />,
    body: [
      { heading: 'What actually counts', text: 'Financial ruin is judged only on your personal unsecured cash going deeply negative — never on secured debt like a mortgage, auto loan, or business loan. A large mortgage on a healthy income is not ruin.' },
      { heading: 'The thresholds', text: 'Negative personal cash triggers a warning, then a critical warning, then game over as it worsens — each stage explained in your notifications well before it becomes fatal, so it is never a surprise.' },
    ],
  },
];

export default function GuidePage() {
  const [openId, setOpenId] = useState<string | null>('basics');

  return (
    <div className="space-y-6 cl-animate-in">
      <div>
        <h1 className="text-2xl font-bold text-cl-text-primary tracking-tight">Game Guide</h1>
        <p className="text-sm text-cl-text-secondary mt-1">How each of ChargedLife&apos;s systems actually works.</p>
      </div>

      <div className="space-y-3">
        {SECTIONS.map((section) => {
          const isOpen = openId === section.id;
          return (
            <GameCard key={section.id} padding="none">
              <button
                onClick={() => setOpenId(isOpen ? null : section.id)}
                className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-cl-accent">{section.icon}</span>
                  <span className="text-sm font-semibold text-cl-text-primary">{section.title}</span>
                </span>
                <ChevronDown size={16} className={cn('text-cl-text-muted transition-transform', isOpen && 'rotate-180')} />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 space-y-4">
                  {section.body.map((entry) => (
                    <div key={entry.heading}>
                      <p className="text-sm font-medium text-cl-text-primary mb-1">{entry.heading}</p>
                      <p className="text-sm text-cl-text-secondary leading-relaxed">{entry.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </GameCard>
          );
        })}
      </div>
    </div>
  );
}
