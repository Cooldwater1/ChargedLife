import { AIRCRAFT_DEPRECIATION_ANNUAL, BOAT_DEPRECIATION_ANNUAL, CONDITION_DECAY_PER_MONTH, MILEAGE_PER_DAY_AVG, VEHICLE_DEPRECIATION_ANNUAL } from '@/game/constants/balance';
import { clamp } from '@/lib/random';
import type { Aircraft, Boat, LuxuryItem, Vehicle } from '@/game/types';
import type { PendingTransaction } from '@/game/simulation/business';

const MONTHLY_FROM_ANNUAL = (annualRate: number) => annualRate / 12;

export function driftVehicleDaily(vehicle: Vehicle): Vehicle {
  const dailyRate = MONTHLY_FROM_ANNUAL(VEHICLE_DEPRECIATION_ANNUAL[vehicle.category] ?? -0.1) / 30;
  const currentValue = Math.max(vehicle.purchasePrice * 0.05, vehicle.currentValue * (1 + dailyRate));
  const mileage = vehicle.mileage + MILEAGE_PER_DAY_AVG;
  const condition = clamp(vehicle.condition - CONDITION_DECAY_PER_MONTH / 30, 10, 100);
  return { ...vehicle, currentValue: Math.round(currentValue), mileage: Math.round(mileage), condition };
}

export function driftBoatDaily(boat: Boat): Boat {
  const dailyRate = MONTHLY_FROM_ANNUAL(BOAT_DEPRECIATION_ANNUAL) / 30;
  const currentValue = Math.max(boat.purchasePrice * 0.1, boat.currentValue * (1 + dailyRate));
  const condition = clamp(boat.condition - CONDITION_DECAY_PER_MONTH / 30, 10, 100);
  return { ...boat, currentValue: Math.round(currentValue), condition };
}

export function driftAircraftDaily(aircraft: Aircraft): Aircraft {
  const dailyRate = MONTHLY_FROM_ANNUAL(AIRCRAFT_DEPRECIATION_ANNUAL) / 30;
  const currentValue = Math.max(aircraft.purchasePrice * 0.15, aircraft.currentValue * (1 + dailyRate));
  const condition = clamp(aircraft.condition - CONDITION_DECAY_PER_MONTH / 30, 10, 100);
  return { ...aircraft, currentValue: Math.round(currentValue), condition };
}

export function driftLuxuryDaily(item: LuxuryItem): LuxuryItem {
  const dailyRate = item.appreciationAnnual / 365;
  const currentValue = Math.max(item.purchasePrice * 0.2, item.currentValue * (1 + dailyRate));
  return { ...item, currentValue: Math.round(currentValue) };
}

/** Charges monthly insurance/maintenance/marina/hangar/crew costs for every owned lifestyle asset. */
export function runMonthlyAssetCosts(
  vehicles: Vehicle[],
  boats: Boat[],
  aircraft: Aircraft[],
): { transactions: PendingTransaction[] } {
  const transactions: PendingTransaction[] = [];

  for (const v of vehicles) {
    const total = v.insuranceMonthly + v.maintenanceMonthly;
    if (total > 0) transactions.push({ amount: -total, category: 'vehicle_expense', description: `${v.brand} ${v.model} — insurance & maintenance` });
  }
  for (const b of boats) {
    const total = b.maintenanceMonthly + b.marinaFeeMonthly + b.crewCostMonthly;
    if (total > 0) transactions.push({ amount: -total, category: 'boat_expense', description: `${b.name} — marina, maintenance & crew` });
  }
  for (const a of aircraft) {
    const total = a.operatingCostMonthly + a.crewCostMonthly + a.hangarCostMonthly;
    if (total > 0) transactions.push({ amount: -total, category: 'aircraft_expense', description: `${a.name} — operating, crew & hangar` });
  }

  return { transactions };
}
