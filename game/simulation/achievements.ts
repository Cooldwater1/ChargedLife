import { ACHIEVEMENT_DEFINITIONS } from '@/game/constants/achievements';
import { JOB_DEFINITIONS } from '@/game/constants/data';
import { calculateBusinessValuation } from '@/game/simulation/economy';
import { calculateNetWorth, calculateTotalDebt } from '@/game/simulation/networth';
import type { GameState } from '@/game/types';
import type { PendingNotification } from '@/game/simulation/business';

type AchievementCheck = (state: GameState) => boolean;

const CHECKS: Record<string, AchievementCheck> = {
  new_beginning: (s) => s.player.statistics.daysPlayed >= 1,
  independent: (s) => s.player.properties.length >= 1,
  relocated: (s) => s.player.statistics.daysPlayed > 0 && s.player.city !== 'Austin',

  first_paycheck: (s) => s.transactions.some((t) => t.category === 'salary'),
  career_climber: (s) => s.player.statistics.promotions >= 1,
  executive: (s) => {
    const job = JOB_DEFINITIONS.find((j) => j.id === s.player.career.jobId);
    return !!job && job.tier >= 6;
  },
  ceo_title: (s) => {
    const job = JOB_DEFINITIONS.find((j) => j.id === s.player.career.jobId);
    if (!job) return false;
    const maxTier = Math.max(...JOB_DEFINITIONS.filter((j) => j.industry === job.industry).map((j) => j.tier));
    return job.tier === maxTier;
  },

  graduate: (s) => s.player.education.completedDegrees.length >= 1,
  bachelor_earned: (s) => s.player.education.completedDegrees.some((d) => d.level === 'bachelor'),
  mastermind: (s) => s.player.education.completedDegrees.some((d) => d.level === 'master'),
  doctorate_earned: (s) => s.player.education.completedDegrees.some((d) => d.level === 'doctorate'),

  first_business: (s) => s.businesses.length >= 1,
  first_employee: (s) => s.businesses.some((b) => b.employees.length >= 1),
  profitable_month: (s) => s.businesses.some((b) => {
    const last30 = b.financialHistory.slice(-30);
    return last30.length >= 28 && last30.reduce((sum, d) => sum + d.profit, 0) > 0;
  }),
  hundred_customers: (s) => s.player.statistics.customersServed >= 100,
  thousand_customers: (s) => s.player.statistics.customersServed >= 1_000,
  ten_thousand_customers: (s) => s.player.statistics.customersServed >= 10_000,
  business_worth_1m: (s) => s.businesses.some((b) => calculateBusinessValuation(b) >= 1_000_000),
  second_location: (s) => s.businesses.some((b) => b.locations.length >= 2),
  marketing_genius: (s) => s.businesses.some((b) => b.marketingCampaigns.some((c) => c.status === 'completed' && c.cost > 0 && ((c.revenueAttributed - c.cost) / c.cost) * 100 >= 200)),
  business_empire: (s) => s.businesses.length >= 5,
  hundred_employees: (s) => s.businesses.reduce((sum, b) => sum + b.employees.length, 0) >= 100,
  thousand_employees: (s) => s.businesses.reduce((sum, b) => sum + b.employees.length, 0) >= 1_000,
  regional_brand: (s) => s.businesses.some((b) => b.level >= 4),
  national_chain: (s) => s.businesses.some((b) => b.level >= 5),
  major_corporation: (s) => s.businesses.some((b) => b.level >= 6),
  five_star_reputation: (s) => s.businesses.some((b) => b.reputation >= 95),

  saved_100k: (s) => calculateNetWorth(s) >= 100_000,
  millionaire: (s) => calculateNetWorth(s) >= 1_000_000,
  multi_millionaire: (s) => calculateNetWorth(s) >= 10_000_000,
  hundred_million: (s) => calculateNetWorth(s) >= 100_000_000,
  billionaire: (s) => calculateNetWorth(s) >= 1_000_000_000,
  debt_free: (s) => s.player.statistics.loansTaken > 0 && calculateTotalDebt(s) === 0,

  first_home: (s) => s.player.properties.length >= 1,
  landlord: (s) => s.player.properties.some((p) => p.use === 'rental'),
  property_mogul: (s) => s.player.properties.length >= 5,
  mansion_owner: (s) => s.player.properties.some((p) => p.type === 'mansion' || p.type === 'estate' || p.type === 'private_island'),

  first_sports_car: (s) => s.player.vehicles.some((v) => v.category === 'sports'),
  supercar_owner: (s) => s.player.vehicles.some((v) => v.category === 'super' || v.category === 'hyper'),
  yacht_owner: (s) => s.player.boats.some((b) => b.category === 'yacht' || b.category === 'superyacht'),
  private_jet_owner: (s) => s.player.aircraft.some((a) => a.category === 'private_jet' || a.category === 'long_range_jet' || a.category === 'luxury_jet'),
  ultimate_collection: (s) => s.player.vehicles.length > 0 && s.player.boats.length > 0 && s.player.aircraft.length > 0 && s.player.luxuryItems.length > 0,

  in_love: (s) => s.player.relationship.status === 'exclusive' || s.player.relationship.status === 'engaged' || s.player.relationship.status === 'married',
  married: (s) => s.player.relationship.status === 'married',
  parent: (s) => s.player.family.some((f) => f.role === 'child'),
  growing_family: (s) => s.player.family.filter((f) => f.role === 'child').length >= 2,
};

export function checkAchievements(state: GameState): { unlockedIds: string[]; notifications: PendingNotification[] } {
  const unlockedIds: string[] = [];
  const notifications: PendingNotification[] = [];

  for (const achievement of state.player.achievements) {
    if (achievement.unlockedAt !== null) continue;
    const check = CHECKS[achievement.id];
    if (check && check(state)) {
      unlockedIds.push(achievement.id);
      const def = ACHIEVEMENT_DEFINITIONS.find((a) => a.id === achievement.id);
      notifications.push({
        title: 'Achievement Unlocked',
        message: def ? `${def.name} — ${def.description}` : achievement.id,
        severity: 'success',
        link: { page: 'achievements' },
      });
    }
  }

  return { unlockedIds, notifications };
}
