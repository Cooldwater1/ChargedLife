import { DIVORCE_RISK_DAILY_CHANCE, DIVORCE_RISK_RELATIONSHIP_THRESHOLD, SERIOUS_RELATIONSHIP_MIN_DAYS } from '@/game/constants/balance';
import type { FamilyMember, RelationshipState } from '@/game/types';

/** Automatic exclusive -> serious promotion once the couple has actually been together a while. Purely a label/gate change. */
export function advanceRelationshipStage(relationship: RelationshipState, partner: FamilyMember | undefined, currentDay: number): RelationshipState {
  if (relationship.status !== 'exclusive' || relationship.exclusiveAt === null) return relationship;
  const daysSinceExclusive = currentDay - relationship.exclusiveAt;
  if (daysSinceExclusive >= SERIOUS_RELATIONSHIP_MIN_DAYS && (partner?.relationship ?? 0) >= 35) {
    return { ...relationship, status: 'serious', seriousAt: currentDay };
  }
  return relationship;
}

/** A struggling marriage doesn't collapse silently — it surfaces as a life event the player actually decides on. */
export function rollDivorceRisk(relationship: RelationshipState, partner: FamilyMember | undefined, rng: () => number): boolean {
  if (relationship.status !== 'married' || !partner) return false;
  if (partner.relationship > DIVORCE_RISK_RELATIONSHIP_THRESHOLD) return false;
  return rng() < DIVORCE_RISK_DAILY_CHANCE;
}
