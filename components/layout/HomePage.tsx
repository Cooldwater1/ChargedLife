'use client';

import Image from 'next/image';
import { Briefcase, Building2, CalendarClock, Gem, Heart, Sparkles, Wallet, Zap } from 'lucide-react';
import { GAME_ASSETS } from '@/game/constants/assets';
import { GameButton } from '@/components/ui/GameButton';

const FEATURES = [
  { icon: Briefcase, title: 'Build Your Career', body: 'Earn degrees, gain experience, find jobs, and climb the corporate ladder.' },
  { icon: Building2, title: 'Build Businesses', body: 'Start companies, hire employees and executives, manage operations, and build an empire.' },
  { icon: Heart, title: 'Build a Life', body: 'Relationships, marriage, children, and family — the people who make it worth it.' },
  { icon: Gem, title: 'Build Wealth', body: 'Properties, investments, cars, yachts, aircraft, and the luxuries that come with it.' },
];

const LOOP_STEPS = ['Plan', 'Decide', 'Advance the Day', 'See the Consequences'];

const LIFESTYLE_SHOTS = [
  { src: '/assets/properties/grand-estate-mansion.png', label: 'A Home to Call Your Own' },
  { src: '/assets/vehicles/orange-supercar.png', label: 'A Garage Worth Bragging About' },
  { src: '/assets/boats/grand-superyacht.png', label: 'Weekends on the Water' },
  { src: '/assets/aircraft/futuristic-private-jet.png', label: 'The Whole World, Yours' },
];

export function HomePage({ onPlay }: { onPlay: () => void }) {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative flex items-center justify-center min-h-screen px-4 overflow-hidden">
        <Image src={GAME_ASSETS.backgrounds.luxuryCityNight} alt="" fill sizes="100vw" className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(7,11,22,0.75)] via-[rgba(7,11,22,0.55)] to-[rgba(7,11,22,0.97)]" />

        <div className="relative z-10 text-center max-w-2xl cl-animate-in">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cl-accent to-cl-accent-strong shadow-[0_0_40px_-4px_var(--cl-accent-glow)] mb-6 mx-auto">
            <Zap size={30} className="text-white" fill="white" />
          </div>
          <h1 className="text-5xl font-bold text-cl-text-primary tracking-tight mb-3">CHARGEDLIFE</h1>
          <p className="text-xl font-semibold text-cl-gold mb-4">Build Your Life. Build Your Empire.</p>
          <p className="text-sm text-cl-text-secondary leading-relaxed mb-8 max-w-lg mx-auto">
            Start with an ordinary life and build your way toward wealth, family, businesses, properties, and financial freedom —
            one decision at a time.
          </p>
          <GameButton size="lg" onClick={onPlay} className="px-10">Play ChargedLife</GameButton>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-cl-text-primary text-center mb-2">Everything a Life Is Made Of</h2>
        <p className="text-sm text-cl-text-secondary text-center mb-10">Four pillars, all connected — progress in one shapes the others.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="cl-panel p-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cl-accent/10 text-cl-accent mb-4">
                <f.icon size={20} />
              </div>
              <h3 className="text-sm font-semibold text-cl-text-primary mb-1.5">{f.title}</h3>
              <p className="text-xs text-cl-text-secondary leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Decisions matter */}
      <section className="px-4 py-20 bg-white/[0.02] border-y border-cl-border">
        <div className="max-w-3xl mx-auto text-center">
          <Sparkles size={24} className="text-cl-gold mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-cl-text-primary mb-3">Every Decision Has Consequences</h2>
          <p className="text-sm text-cl-text-secondary leading-relaxed">
            Hire a CEO on day one and it might bankrupt you. Skip the mortgage and rent instead. Gift the yacht to your father
            instead of selling it. There&apos;s no invisible hand keeping you safe — the money, the relationships, and the
            business results are all real, and they all remember what you chose.
          </p>
        </div>
      </section>

      {/* Gameplay loop */}
      <section className="px-4 py-20 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-cl-text-primary text-center mb-10 flex items-center justify-center gap-2">
          <CalendarClock size={22} className="text-cl-accent" /> The Loop
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {LOOP_STEPS.map((step, i) => (
            <div key={step} className="cl-panel p-5 text-center relative">
              <p className="text-xs text-cl-text-muted mb-2">Step {i + 1}</p>
              <p className="text-sm font-semibold text-cl-text-primary">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Lifestyle showcase */}
      <section className="px-4 py-20 bg-white/[0.02] border-y border-cl-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-cl-text-primary text-center mb-10">Wealth Should Feel Like Something</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {LIFESTYLE_SHOTS.map((shot) => (
              <div key={shot.src} className="relative h-40 rounded-xl overflow-hidden cl-panel">
                <Image src={shot.src} alt={shot.label} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(7,11,22,0.9)] via-transparent to-transparent" />
                <p className="absolute bottom-2 left-3 right-3 text-xs font-medium text-white">{shot.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Business showcase */}
      <section className="px-4 py-20 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="relative h-64 rounded-xl overflow-hidden cl-panel">
            <Image src={GAME_ASSETS.businesses.fastFoodRestaurantSunset} alt="Business management" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-cl-text-primary mb-3">Run a Real Company</h2>
            <p className="text-sm text-cl-text-secondary leading-relaxed mb-4">
              Hire staff, set a headquarters, bring on executives, and delegate what you don&apos;t want to manage yourself.
              A good CEO makes running a large business easier — a bad one is extremely expensive.
            </p>
            <ul className="text-xs text-cl-text-secondary space-y-1.5">
              <li>• Real employees with real hiring costs and salaries</li>
              <li>• Executives who actually affect performance</li>
              <li>• Headquarters, holding companies, and acquisitions</li>
            </ul>
          </div>
        </div>
      </section>

      {/* End CTA */}
      <section className="px-4 py-24 text-center">
        <Wallet size={26} className="text-cl-gold mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-cl-text-primary mb-6">Ready to Build Your Life?</h2>
        <GameButton size="lg" onClick={onPlay} className="px-10">Play the Game</GameButton>
        <p className="text-[10px] text-cl-text-muted mt-8 tracking-wide">Pre-Alpha — a work in progress</p>
      </section>
    </div>
  );
}
