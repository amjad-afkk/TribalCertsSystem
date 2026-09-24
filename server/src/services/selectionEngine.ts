import { WaterfallTierConfig, SelectionRecord } from '../types/index.js';

export interface CandidateForSelection {
  applicantId: string;
  applicationId: string;
  name: string;
  category: 'DIVYANGJAN' | 'PVTG' | 'FEMALE_ST' | 'ST_OTHER';
  isPwD: boolean;
  isPVTG: boolean;
  gender: 'FEMALE' | 'MALE' | 'OTHER';
  meritScore: number; // Academic or research score
  qsRank?: number;
  university?: string;
  discipline?: 'STEM' | 'MANAGEMENT' | 'AGRI_MED' | 'HUMANITIES';
}

export interface SpilloverTransition {
  step: number;
  fromTier: string;
  toTier: string;
  slotsShifted: number;
  budgetShifted?: number;
  reason: string;
}

export interface TierBudgetSummary {
  tierName: string;
  sanctionedBudget: number;
  unitCost: number;
  budgetReceivedFromSpillover: number;
  effectiveBudget: number;
  committedExpenditure: number;
  budgetSpilledOverOut: number;
  unspentSurplus: number;
}

export interface WaterfallExecutionResult {
  schemeId: string;
  schemeCode: string;
  totalAvailableSlots: number;
  totalFilledSlots: number;
  unfilledSlots: number;
  totalSanctionedBudget: number;
  totalCommittedExpenditure: number;
  totalBudgetSurplus: number;
  isBudgetConstrained: boolean;
  tierSummary: Record<string, {
    tierName: string;
    originalQuota: number;
    spilloverReceived: number;
    finalQuota: number;
    selectedCount: number;
    spilloverOut: number;
  }>;
  tierBudgetSummary: Record<string, TierBudgetSummary>;
  transitions: SpilloverTransition[];
  allocatedSelections: {
    applicantId: string;
    applicationId: string;
    name: string;
    meritScore: number;
    originalCategory: string;
    allocatedTier: string;
    isSpillover: boolean;
    meritRank: number;
    allocatedAwardCost?: number;
  }[];
}

export class SelectionEngine {
  /**
   * Executes the 4-tier NFST Reservation Waterfall with auditable automatic spillover
   * and dual-constraint (Slot Quota + Fiscal Ceiling GFR Virement) validation.
   * Priority: Divyangjan (PwD) -> PVTG -> Female ST -> ST Others
   */
  static runNfstWaterfall(
    candidates: CandidateForSelection[],
    customTiers?: WaterfallTierConfig[]
  ): WaterfallExecutionResult {
    const defaultTiers: WaterfallTierConfig[] = [
      { tier: 'DIVYANGJAN', label: 'Divyangjan (PwD ≥ 40%)', priority: 1, allocatedSlots: 38, spilloverTargetTier: 'PVTG', allocatedBudget: 19152000, unitCostPerAwardee: 504000 },
      { tier: 'PVTG', label: 'Particularly Vulnerable Tribal Groups (PVTG)', priority: 2, allocatedSlots: 75, spilloverTargetTier: 'FEMALE_ST', allocatedBudget: 38700000, unitCostPerAwardee: 516000 },
      { tier: 'FEMALE_ST', label: 'Female ST (30% Sub-quota)', priority: 3, allocatedSlots: 225, spilloverTargetTier: 'ST_GENERAL', allocatedBudget: 108000000, unitCostPerAwardee: 480000 },
      { tier: 'ST_GENERAL', label: 'Open Scheduled Tribe (ST Others)', priority: 4, allocatedSlots: 412, allocatedBudget: 197760000, unitCostPerAwardee: 480000 }
    ];

    const tiers = (customTiers && customTiers.length > 0 ? customTiers : defaultTiers).map(t => {
      const unitCost = t.unitCostPerAwardee || 480000;
      const budget = t.allocatedBudget || ((t.allocatedSlots || 0) * unitCost);
      return {
        ...t,
        unitCostPerAwardee: unitCost,
        allocatedBudget: budget
      };
    });

    const totalSlots = tiers.reduce((acc, t) => acc + (t.allocatedSlots || 0), 0);
    const totalSanctionedBudget = tiers.reduce((acc, t) => acc + (t.allocatedBudget || 0), 0);

    // Filter candidate pools
    const pools: Record<string, CandidateForSelection[]> = {
      DIVYANGJAN: candidates.filter(c => c.isPwD).sort((a, b) => b.meritScore - a.meritScore),
      PVTG: candidates.filter(c => c.isPVTG && !c.isPwD).sort((a, b) => b.meritScore - a.meritScore),
      FEMALE_ST: candidates.filter(c => c.gender === 'FEMALE' && !c.isPwD && !c.isPVTG).sort((a, b) => b.meritScore - a.meritScore),
      ST_GENERAL: candidates.filter(c => !c.isPwD && !c.isPVTG && c.gender !== 'FEMALE').sort((a, b) => b.meritScore - a.meritScore)
    };

    // Candidates can also compete in general pool if not selected in sub-quota
    const fallbackGeneralPool: CandidateForSelection[] = [];

    const tierSummary: WaterfallExecutionResult['tierSummary'] = {};
    const tierBudgetSummary: Record<string, TierBudgetSummary> = {};
    const transitions: SpilloverTransition[] = [];
    const selections: WaterfallExecutionResult['allocatedSelections'] = [];

    let carriedSpilloverSlots = 0;
    let carriedSpilloverBudget = 0;
    let stepCount = 1;
    let isBudgetConstrained = false;

    for (const t of tiers) {
      const origQuota = t.allocatedSlots || 0;
      const origBudget = t.allocatedBudget || 0;
      const unitCost = t.unitCostPerAwardee || 480000;

      const effectiveQuota = origQuota + carriedSpilloverSlots;
      const effectiveBudget = origBudget + carriedSpilloverBudget;
      const candidatesInTier = pools[t.tier] || [];

      let tierCommitted = 0;
      const selectedForThisTier: CandidateForSelection[] = [];

      for (const cand of candidatesInTier) {
        if (selectedForThisTier.length >= effectiveQuota) break;
        if (tierCommitted + unitCost <= effectiveBudget) {
          selectedForThisTier.push(cand);
          tierCommitted += unitCost;
        } else {
          isBudgetConstrained = true;
          break;
        }
      }

      const selectCount = selectedForThisTier.length;
      const unselectedInThisTier = candidatesInTier.slice(selectCount);

      // Add unselected to general pool for open merit competition
      fallbackGeneralPool.push(...unselectedInThisTier);

      selectedForThisTier.forEach((c, idx) => {
        selections.push({
          applicantId: c.applicantId,
          applicationId: c.applicationId,
          name: c.name,
          meritScore: c.meritScore,
          originalCategory: c.category,
          allocatedTier: t.tier,
          isSpillover: carriedSpilloverSlots > 0 && idx >= origQuota,
          meritRank: selections.length + 1,
          allocatedAwardCost: unitCost
        });
      });

      const spilloverSlotsToNext = effectiveQuota - selectCount;
      const spilloverBudgetToNext = Math.max(0, effectiveBudget - tierCommitted);

      tierSummary[t.tier] = {
        tierName: t.label,
        originalQuota: origQuota,
        spilloverReceived: carriedSpilloverSlots,
        finalQuota: effectiveQuota,
        selectedCount: selectCount,
        spilloverOut: spilloverSlotsToNext
      };

      tierBudgetSummary[t.tier] = {
        tierName: t.label,
        sanctionedBudget: origBudget,
        unitCost: unitCost,
        budgetReceivedFromSpillover: carriedSpilloverBudget,
        effectiveBudget: effectiveBudget,
        committedExpenditure: tierCommitted,
        budgetSpilledOverOut: spilloverBudgetToNext,
        unspentSurplus: effectiveBudget - tierCommitted
      };

      if ((spilloverSlotsToNext > 0 || spilloverBudgetToNext > 0) && t.spilloverTargetTier) {
        const budgetFormatted = (spilloverBudgetToNext / 100000).toFixed(2);
        transitions.push({
          step: stepCount++,
          fromTier: t.tier,
          toTier: t.spilloverTargetTier,
          slotsShifted: spilloverSlotsToNext,
          budgetShifted: spilloverBudgetToNext,
          reason: `${t.label} had ${selectCount} eligible applicants for ${effectiveQuota} seats. Automatically cascading ${spilloverSlotsToNext} unfilled seats and ₹${budgetFormatted} Lakhs re-appropriated budget (GFR Virement) to ${t.spilloverTargetTier}.`
        });
        carriedSpilloverSlots = spilloverSlotsToNext;
        carriedSpilloverBudget = spilloverBudgetToNext;
      } else {
        carriedSpilloverSlots = 0;
        carriedSpilloverBudget = 0;
      }
    }

    // Consume fallback general pool: candidates not selected in their sub-quota
    // can compete on open merit for any remaining unfilled slots within remaining budget
    const totalFilledSoFar = selections.length;
    const remainingSlots = totalSlots - totalFilledSoFar;
    const currentTotalCommitted = selections.reduce((sum, s) => sum + (s.allocatedAwardCost || 480000), 0);
    let remainingBudget = totalSanctionedBudget - currentTotalCommitted;

    if (remainingSlots > 0 && fallbackGeneralPool.length > 0 && remainingBudget >= 480000) {
      // Remove already-selected candidates from fallback pool
      const selectedIds = new Set(selections.map(s => s.applicantId));
      const eligibleFallback = fallbackGeneralPool
        .filter(c => !selectedIds.has(c.applicantId))
        .sort((a, b) => b.meritScore - a.meritScore);

      const promotedCandidates: CandidateForSelection[] = [];
      for (const c of eligibleFallback) {
        if (promotedCandidates.length >= remainingSlots) break;
        if (remainingBudget >= 480000) {
          promotedCandidates.push(c);
          remainingBudget -= 480000;
        } else {
          isBudgetConstrained = true;
          break;
        }
      }

      promotedCandidates.forEach((c) => {
        selections.push({
          applicantId: c.applicantId,
          applicationId: c.applicationId,
          name: c.name,
          meritScore: c.meritScore,
          originalCategory: c.category,
          allocatedTier: 'ST_GENERAL_FALLBACK',
          isSpillover: true,
          meritRank: selections.length + 1,
          allocatedAwardCost: 480000
        });
      });

      if (promotedCandidates.length > 0) {
        transitions.push({
          step: stepCount++,
          fromTier: 'FALLBACK_POOL',
          toTier: 'ST_GENERAL_FALLBACK',
          slotsShifted: promotedCandidates.length,
          budgetShifted: promotedCandidates.length * 480000,
          reason: `${promotedCandidates.length} candidates from unfilled sub-quota tiers promoted to open merit pool under available GFR fiscal buffer.`
        });
      }
    }

    const finalCommitted = selections.reduce((sum, s) => sum + (s.allocatedAwardCost || 480000), 0);

    return {
      schemeId: 'scheme-nfst',
      schemeCode: 'ARG45',
      totalAvailableSlots: totalSlots,
      totalFilledSlots: selections.length,
      unfilledSlots: totalSlots - selections.length,
      totalSanctionedBudget,
      totalCommittedExpenditure: finalCommitted,
      totalBudgetSurplus: totalSanctionedBudget - finalCommitted,
      isBudgetConstrained,
      tierSummary,
      tierBudgetSummary,
      transitions,
      allocatedSelections: selections
    };
  }

  /**
   * Executes NOS Multi-Priority Tiered Selection:
   * Priority 1: Enrolled / Offer in QS Top 1000
   * Priority 2: Conditional offer letter
   * Priority 3: Interview / entrance ranking
   */
  static runNosSelection(
    candidates: (CandidateForSelection & { hasOfferLetter?: boolean; hasUnconditionalAdmit?: boolean })[],
    totalSlots: number = 20
  ) {
    const tier1: typeof candidates = [];
    const tier2: typeof candidates = [];
    const tier3: typeof candidates = [];

    for (const c of candidates) {
      if (c.qsRank && c.qsRank <= 1000 && c.hasUnconditionalAdmit) {
        tier1.push(c);
      } else if (c.hasOfferLetter) {
        tier2.push(c);
      } else {
        tier3.push(c);
      }
    }

    // Sort within tiers by QS Rank (lower is better) then merit score (higher is better)
    const sortByMerit = (a: typeof candidates[0], b: typeof candidates[0]) => {
      if (a.qsRank && b.qsRank && a.qsRank !== b.qsRank) return a.qsRank - b.qsRank;
      return b.meritScore - a.meritScore;
    };

    tier1.sort(sortByMerit);
    tier2.sort(sortByMerit);
    tier3.sort(sortByMerit);

    const selections: (typeof candidates[0] & { priorityTier: number; meritRank: number })[] = [];
    let rank = 1;

    for (const c of [...tier1, ...tier2, ...tier3]) {
      if (selections.length >= totalSlots) break;
      const priorityTier = tier1.includes(c) ? 1 : tier2.includes(c) ? 2 : 3;
      selections.push({
        ...c,
        priorityTier,
        meritRank: rank++
      });
    }

    return {
      schemeId: 'scheme-nos',
      schemeCode: 'AZKMI',
      totalSlots,
      selectedCount: selections.length,
      tier1Selected: selections.filter(s => s.priorityTier === 1).length,
      tier2Selected: selections.filter(s => s.priorityTier === 2).length,
      tier3Selected: selections.filter(s => s.priorityTier === 3).length,
      selections
    };
  }
}
