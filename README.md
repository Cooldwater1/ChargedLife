# ChargedLife

**Pre-Alpha 0.2.0**

ChargedLife is a browser-based life-simulation and business-tycoon game. Live an entire life — education, career, dating, marriage, children — while building companies, a real estate portfolio, an investment portfolio, and a collection of vehicles, boats, aircraft, and luxury goods. Progress one day at a time with the **Next Day** button; there is no continuous clock.

## Tech Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript** (strict mode)
- **Tailwind CSS v4** (CSS-first theme, no `tailwind.config.js`)
- **Zustand** (+ `immer` middleware) for game state, with `persist` + a versioned migration for localStorage saves
- **Recharts** for charts, **lucide-react** for icons

## Running the project

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint     # eslint
```

## Architecture

```
game/
  types/index.ts        Every domain type. All `timestamp`/`*At` fields are a whole-day index (no minutes).
  constants/
    balance.ts            Every tunable number (USD-denominated)
    data.ts                Career ladders (4 industries) + US cities
    education.ts           Degree programs + institution tiers
    properties.ts          Real estate listings
    vehicles.ts / boats.ts / aircraft.ts / luxury.ts   Lifestyle-asset catalogs
    investments.ts          Fictional stock/ETF/crypto seed data
    family.ts                Occupation/personality pools for parents & dating candidates
    achievements.ts           40 achievements across 9 categories
  business/fastfood.ts    Fast Food industry factory
  simulation/
    economy.ts              Demand, staffing, satisfaction, valuation, credit, loan math
    business.ts              Daily/weekly/monthly business settlement
    career.ts                Job requirement checks (education/experience/alt-path), ladder lookup
    education.ts              Enrollment, daily progress, graduation, scholarships
    family.ts                  Parent/dating-candidate generation, aging, relationship decay
    assets.ts                  Vehicle/boat/aircraft/luxury depreciation + monthly upkeep
    investments.ts             Market price simulation, portfolio valuation, buy/sell
    economyState.ts            Recession→boom economic condition drift
    lifeEvents.ts               Career/family/financial/random life-event pool
    achievements.ts             Declarative achievement checks
    networth.ts                 Net worth / total debt / collection value aggregation
    player.ts                    Personal finance: living expenses, salary, loans, properties
  time/
    calendar.ts             Whole-day → real calendar date (UTC, no DST issues)
    timeEngine.ts             advanceDay(): the single orchestrator for one full day
  state/
    initialState.ts          Fresh GameState factory
    migrations.ts              v1 (NOK, continuous clock) → v2 (USD, Next Day) save migration
    store.ts                     The Zustand store: all state + every player action

components/
  ui/            Design-system primitives (GameCard, MetricCard, GameButton, GameModal, TrendChart, ...)
  layout/        Sidebar, TopBar (Next Day button), StartScreen, DaySummaryModal, LifeEventModal
  business/      Business-management UI (unchanged structure from Fast Food deep-dive)

app/
  page.tsx (Overview/Life Dashboard), profile/, family/, education/, career/,
  businesses/, businesses/[id]/, properties/, investments/, bank/,
  vehicles/, boats/, aircraft/, collection/, achievements/, statistics/, timeline/, settings/
```

## What changed in this version

**Time system.** Continuous minutes-based clock (Pause/1x/2x) replaced entirely by a single **Next Day** button. `GameTime` is now `{ dayIndex: number }`; every timestamp in the codebase is a whole-day index. `advanceDay()` runs living expenses and business simulation every day, salary/payroll every Friday, rent/loans/savings/family/lifestyle-asset costs on the 1st of the month, and aging on Jan 1 — then returns a `DaySummary` the UI shows as a modal (configurable: always / important-only / never).

**Currency.** Everything is USD (`$1,250`, `$1.25M`, `$4.8B`). Cities are now US metros (Austin, Dallas, Chicago, Seattle, Miami, LA, SF, NYC) with their own cost-of-living/salary/rent multipliers.

**New life systems.** Education (7 levels, 13 fields, 3 institution tiers, scholarships, student loans), Family (generated parents with Call/Visit/Gift, aging, retirement), Dating (5-candidate pool, compatibility, Date/Message/Gift/Exclusive), Marriage (propose → engage → 3-tier wedding), Children (aging, bond), a general Life Events system (career/family/financial/random with real choices), and a Life Timeline that auto-logs every milestone.

**Career overhaul.** Four full industry ladders (Retail 5 tiers, Marketing 8, Finance 6, Technology 6) with real requirements (education level + field + general/industry experience, plus a pure-experience alt-path for Technology) and a LOCKED-job UX showing exactly which requirements are unmet. Promotion (with a performance-weighted rejection chance) and Request Raise are both real mechanics now.

**New asset classes.** Vehicles (9 categories, dealership + garage, depreciation, financing), Boats, Aircraft, and Luxury goods (watches/jewelry/collectibles) each with realistic recurring costs (insurance, maintenance, marina fees, crew, hangar) — owning a superyacht or a private jet is a genuine financial commitment, not a free trophy. A Collection page aggregates all four.

**Investments.** 13 fictional stocks/ETFs/crypto instruments with daily geometric-drift price simulation nudged by the broader economic condition, a real portfolio (buy/sell, avg cost, gain/loss), and a price-history chart per instrument.

**Economy.** A five-state economic condition (recession → boom) that persists for a while before drifting, feeding into interest rates, unemployment, and market drift — surfaced on the Bank page.

**Save migration.** `game/state/migrations.ts` converts any v1 save (NOK, continuous clock, no life-sim systems) into a fully-populated v2 save: cash, career, bank, businesses, and properties carry over; every new system (education, family, vehicles, investments, etc.) is initialized fresh. No save is ever silently destroyed.

## Visual note — no photography

This build has no image-generation or file-download tool available, so "seeing your mansion / your Ferrari / your yacht" is delivered as tasteful icon-in-gradient-panel treatments (a large Lucide icon over a soft accent-to-gold gradient), not photographs. The brief's asset-imagery request is honored in spirit (every major purchase gets a visual hero treatment) but not with real photos — swapping in actual images later just means dropping files into `public/assets/*` and referencing them from the listing data files, since all asset visuals are already data-driven.

## Deliberately postponed

- Business delegation/CEO/manager automation, holding companies, business acquisitions/mergers, NPC competitors with market share — the brief's own priority order (section 197) puts these after the life-sim foundation, and building them shallowly would have meant less depth everywhere else.
- Parent mortality / end-of-life events — flagged as a sensitive topic worth its own careful design pass rather than a rushed implementation.
- Automated unit tests for the simulation math — validated instead through extensive manual browser testing of every new system end-to-end (see below); a `game/simulation/*` test suite is straightforward to add later since the functions are already pure.
- Divorce asset-splitting, Game Guide page, Next Week fast-advance — noted as real gaps, not faked.

## Testing performed

Full TypeScript (`tsc --noEmit`), ESLint, and `next build` all pass clean with zero errors/warnings. Manually verified end-to-end in-browser: v1→v2 save migration (cash/business data preserved, currency and UI fully converted), Next Day + Day Summary pipeline, career application with the LOCKED-job requirement UX, education enrollment → graduation → achievement/timeline entry, the full dating → exclusive → engaged → married → child pipeline, vehicle purchase, and stock buy with live portfolio/cash updates.
