import type { AchievementDefinition } from '@/game/types';

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  // Life
  { id: 'new_beginning', name: 'A New Beginning', description: 'Complete your first day.', category: 'life' },
  { id: 'independent', name: 'Independent', description: 'Move into your first home.', category: 'life' },
  { id: 'relocated', name: 'Fresh Start', description: 'Relocate to a new city.', category: 'life' },

  // Career
  { id: 'first_paycheck', name: 'First Paycheck', description: 'Receive your first salary payment.', category: 'career' },
  { id: 'career_climber', name: 'Career Climber', description: 'Get promoted for the first time.', category: 'career' },
  { id: 'executive', name: 'Executive', description: 'Reach an executive-tier job title.', category: 'career' },
  { id: 'ceo_title', name: 'CEO', description: 'Reach the top of a career ladder.', category: 'career' },

  // Education
  { id: 'graduate', name: 'Graduate', description: 'Earn your first degree or certification.', category: 'education' },
  { id: 'bachelor_earned', name: 'Bachelor', description: "Earn a Bachelor's degree.", category: 'education' },
  { id: 'mastermind', name: 'Mastermind', description: "Earn a Master's degree.", category: 'education' },
  { id: 'doctorate_earned', name: 'Doctorate', description: 'Earn a Doctorate.', category: 'education' },

  // Business
  { id: 'first_business', name: 'Entrepreneur', description: 'Start your first business.', category: 'business' },
  { id: 'first_employee', name: 'First Hire', description: 'Hire your first employee.', category: 'business' },
  { id: 'profitable_month', name: 'In The Black', description: 'Finish a month with positive business profit.', category: 'business' },
  { id: 'hundred_customers', name: 'Word Is Spreading', description: 'Serve 100 total customers.', category: 'business' },
  { id: 'thousand_customers', name: 'Local Favorite', description: 'Serve 1,000 total customers.', category: 'business' },
  { id: 'ten_thousand_customers', name: 'Household Name', description: 'Serve 10,000 total customers.', category: 'business' },
  { id: 'business_worth_1m', name: 'Seven Figures', description: 'Own a business valued at $1,000,000 or more.', category: 'business' },
  { id: 'second_location', name: 'Expansion', description: 'Open a second business location.', category: 'business' },
  { id: 'marketing_genius', name: 'Marketing Genius', description: 'Achieve a marketing campaign with 200%+ ROI.', category: 'business' },
  { id: 'business_empire', name: 'Empire Builder', description: 'Own 5 businesses at once.', category: 'business' },
  { id: 'hundred_employees', name: '100 Employees', description: 'Employ 100 people across your businesses.', category: 'business' },
  { id: 'thousand_employees', name: '1,000 Employees', description: 'Employ 1,000 people across your businesses.', category: 'business' },
  { id: 'regional_brand', name: 'Regional Brand', description: 'Grow a business to Level 4 — Regional Brand.', category: 'progression' },
  { id: 'national_chain', name: 'National Chain', description: 'Grow a business to Level 5 — National Chain.', category: 'progression' },
  { id: 'major_corporation', name: 'Major Corporation', description: 'Grow a business to Level 6 — Major Corporation.', category: 'progression' },
  { id: 'five_star_reputation', name: 'Five Stars', description: 'Reach 95+ reputation on a business.', category: 'business' },

  // Wealth
  { id: 'saved_100k', name: '$100K Net Worth', description: 'Reach $100,000 net worth.', category: 'wealth' },
  { id: 'millionaire', name: 'Millionaire', description: 'Reach $1,000,000 net worth.', category: 'wealth' },
  { id: 'multi_millionaire', name: 'Multi-Millionaire', description: 'Reach $10,000,000 net worth.', category: 'wealth' },
  { id: 'hundred_million', name: '$100 Million', description: 'Reach $100,000,000 net worth.', category: 'wealth' },
  { id: 'billionaire', name: 'Billionaire', description: 'Reach $1,000,000,000 net worth.', category: 'wealth' },
  { id: 'debt_free', name: 'Debt Free', description: 'Pay off all personal and business loans.', category: 'wealth' },

  // Property
  { id: 'first_home', name: 'First Home', description: 'Purchase your first property.', category: 'property' },
  { id: 'landlord', name: 'Landlord', description: 'Own a rental property.', category: 'property' },
  { id: 'property_mogul', name: 'Property Mogul', description: 'Own 5 properties.', category: 'property' },
  { id: 'mansion_owner', name: 'Mansion Owner', description: 'Own a mansion or larger estate.', category: 'property' },

  // Luxury
  { id: 'first_sports_car', name: 'First Sports Car', description: 'Purchase your first sports car.', category: 'luxury' },
  { id: 'supercar_owner', name: 'Supercar Owner', description: 'Purchase a supercar or hypercar.', category: 'luxury' },
  { id: 'yacht_owner', name: 'Yacht Owner', description: 'Purchase a yacht.', category: 'luxury' },
  { id: 'private_jet_owner', name: 'Private Jet', description: 'Purchase a private jet.', category: 'luxury' },
  { id: 'ultimate_collection', name: 'Ultimate Collection', description: 'Own a car, a boat, an aircraft, and a luxury item at the same time.', category: 'luxury' },

  // Family
  { id: 'in_love', name: 'In Love', description: 'Enter an exclusive relationship.', category: 'family' },
  { id: 'married', name: 'Married', description: 'Get married.', category: 'family' },
  { id: 'parent', name: 'Parent', description: 'Have your first child.', category: 'family' },
  { id: 'growing_family', name: 'Growing Family', description: 'Have two or more children.', category: 'family' },
];
