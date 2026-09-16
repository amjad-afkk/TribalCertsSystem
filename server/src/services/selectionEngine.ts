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
  reason: string;
}

export interface WaterfallExecutionResult {
  schemeId: string;
  schemeCode: string;
  totalAvailableSlots: number;
  totalFilledSlots: number;
  unfilledSlots: number;
  tierSummary: Record<string, {
    tierName: string;
    originalQuota: number;
    spilloverReceived: number;
    finalQuota: number;
    selectedCount: number;
    spilloverOut: number;
  }>;
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
  }[];
}

export class SelectionEngine {
  /**
   * Executes the 4-tier NFST Reservation Waterfall with auditable automatic spillover.
   * Priority: Divyangjan (PwD) -> PVTG -> Female ST -> ST Others
   */
  static runNfstWaterfall(
    candidates: CandidateForSelection[],
    customTiers?: WaterfallTierConfig[]
  ): WaterfallExecutionResult {
    const defaultTiers: WaterfallTierConfig[] = [
      { tier: 'DIVYANGJAN', label: 'Divyangjan (PwD ≥ 40%)', priority: 1, allocatedSlots: 38, spilloverTargetTier: 'PVTG' },
      { tier: 'PVTG', label: 'Particularly Vulnerable Tribal Groups (PVTG)', priority: 2, allocatedSlots: 75, spilloverTargetTier: 'FEMALE_ST' },
      { tier: 'FEMALE_ST', label: 'Female ST (30% Sub-quota)', priority: 3, allocatedSlots: 225, spilloverTargetTier: 'ST_GENERAL' },
      { tier: 'ST_GENERAL', label: 'Open Scheduled Tribe (ST Others)', priority: 4, allocatedSlots: 412 }
    ];

    const tiers = customTiers && customTiers.length > 0 ? customTiers : defaultTiers;
    const totalSlots = tiers.reduce((acc, t) => acc + (t.allocatedSlots || 0), 0);

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
    const transitions: SpilloverTransition[] = [];
    const selections: WaterfallExecutionResult['allocatedSelections'] = [];

    let carriedSpillover = 0;
    let stepCount = 1;

    for (const t of tiers) {
      const origQuota = t.allocatedSlots || 0;
      const effectiveQuota = origQuota + carriedSpillover;
      const candidatesInTier = pools[t.tier] || [];

      const selectCount = Math.min(effectiveQuota, candidatesInTier.length);
      const selectedForThisTier = candidatesInTier.slice(0, selectCount);
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
          isSpillover: carriedSpillover > 0 && idx >= origQuota,
          meritRank: selections.length + 1
        });
      });

      const spilloverToNext = effectiveQuota - selectCount;

      tierSummary[t.tier] = {
        tierName: t.label,
        originalQuota: origQuota,
        spilloverReceived: carriedSpillover,
        finalQuota: effectiveQuota,
        selectedCount: selectCount,
        spilloverOut: spilloverToNext
      };

      if (spilloverToNext > 0 && t.spilloverTargetTier) {
        transitions.push({
          step: stepCount++,
          fromTier: t.tier,
          toTier: t.spilloverTargetTier,
          slotsShifted: spilloverToNext,
          reason: `${t.label} had only ${selectCount} eligible applicants for ${effectiveQuota} available slots. Automatically cascading ${spilloverToNext} unfilled slots to ${t.spilloverTargetTier}.`
        });
        carriedSpillover = spilloverToNext;
      } else {
        carriedSpillover = 0;
      }
    }

    return {
      schemeId: 'scheme-nfst',
      schemeCode: 'ARG45',
      totalAvailableSlots: totalSlots,
      totalFilledSlots: selections.length,
      unfilledSlots: totalSlots - selections.length,
      tierSummary,
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
