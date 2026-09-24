import { describe, test } from 'node:test';
import assert from 'node:assert';
import { SelectionEngine, CandidateForSelection } from '../src/services/selectionEngine.js';
import { WaterfallTierConfig } from '../src/types/index.js';

describe('SelectionEngine Dual-Constraint Budget & Slot Waterfall', () => {
  test('should re-appropriate unspent budget and transfer slots across tiers under GFR virement', () => {
    // Custom tier setup with explicit budgets
    const customTiers: WaterfallTierConfig[] = [
      {
        tier: 'DIVYANGJAN',
        label: 'Divyangjan ST',
        priority: 1,
        allocatedSlots: 10,
        allocatedBudget: 5040000, // 10 * 504k
        unitCostPerAwardee: 504000,
        spilloverTargetTier: 'PVTG'
      },
      {
        tier: 'PVTG',
        label: 'PVTG Scholars',
        priority: 2,
        allocatedSlots: 20,
        allocatedBudget: 10320000, // 20 * 516k
        unitCostPerAwardee: 516000,
        spilloverTargetTier: 'ST_GENERAL'
      },
      {
        tier: 'ST_GENERAL',
        label: 'General ST',
        priority: 3,
        allocatedSlots: 30,
        allocatedBudget: 14400000, // 30 * 480k
        unitCostPerAwardee: 480000
      }
    ];

    // Only 2 Divyangjan applicants available (8 unfilled slots to cascade)
    const candidates: CandidateForSelection[] = [
      {
        applicantId: 'div-1',
        applicationId: 'app-div-1',
        name: 'Karan Maravi',
        category: 'DIVYANGJAN',
        isPwD: true,
        isPVTG: false,
        gender: 'MALE',
        meritScore: 88
      },
      {
        applicantId: 'div-2',
        applicationId: 'app-div-2',
        name: 'Rita Boro',
        category: 'DIVYANGJAN',
        isPwD: true,
        isPVTG: false,
        gender: 'FEMALE',
        meritScore: 82
      },
      // 5 PVTG applicants available (fills 5, cascades 20 + 8 - 5 = 23 to General)
      ...Array.from({ length: 5 }, (_, i) => ({
        applicantId: `pvtg-${i}`,
        applicationId: `app-pvtg-${i}`,
        name: `PVTG Candidate ${i}`,
        category: 'PVTG' as const,
        isPwD: false,
        isPVTG: true,
        gender: 'MALE' as const,
        meritScore: 75 + i
      })),
      // 60 General ST applicants available
      ...Array.from({ length: 60 }, (_, i) => ({
        applicantId: `gen-${i}`,
        applicationId: `app-gen-${i}`,
        name: `General ST ${i}`,
        category: 'ST_OTHER' as const,
        isPwD: false,
        isPVTG: false,
        gender: 'MALE' as const,
        meritScore: 70 + (i % 20)
      }))
    ];

    const result = SelectionEngine.runNfstWaterfall(candidates, customTiers);

    // Divyangjan should select 2 candidates and cascade 8 slots
    assert.strictEqual(result.tierSummary['DIVYANGJAN'].selectedCount, 2);
    assert.strictEqual(result.tierSummary['DIVYANGJAN'].spilloverOut, 8);
    // Unspent budget should be 5,040,000 - (2 * 504,000) = 4,032,000
    assert.strictEqual(result.tierBudgetSummary['DIVYANGJAN'].committedExpenditure, 1008000);
    assert.strictEqual(result.tierBudgetSummary['DIVYANGJAN'].budgetSpilledOverOut, 4032000);

    // PVTG received 8 slots and 4,032,000 INR from Divyangjan
    assert.strictEqual(result.tierSummary['PVTG'].spilloverReceived, 8);
    assert.strictEqual(result.tierSummary['PVTG'].finalQuota, 28);
    assert.strictEqual(result.tierBudgetSummary['PVTG'].budgetReceivedFromSpillover, 4032000);
    assert.strictEqual(result.tierSummary['PVTG'].selectedCount, 5);

    // Overall total expenditure should never exceed total sanctioned budget
    assert.ok(result.totalCommittedExpenditure <= result.totalSanctionedBudget);
    assert.strictEqual(result.totalSanctionedBudget, 5040000 + 10320000 + 14400000);
    assert.ok(result.transitions.length >= 2);
    assert.ok(result.transitions[0].budgetShifted! > 0);
  });

  test('should enforce fiscal ceiling and flag budget constrained when tier budget is exhausted', () => {
    // Starved budget tier setup
    const customTiers: WaterfallTierConfig[] = [
      {
        tier: 'DIVYANGJAN',
        label: 'Divyangjan ST',
        priority: 1,
        allocatedSlots: 10,
        allocatedBudget: 1008000, // Only enough for 2 scholars!
        unitCostPerAwardee: 504000,
        spilloverTargetTier: 'PVTG'
      },
      {
        tier: 'PVTG',
        label: 'PVTG Scholars',
        priority: 2,
        allocatedSlots: 10,
        allocatedBudget: 516000, // Only enough for 1 scholar!
        unitCostPerAwardee: 516000,
        spilloverTargetTier: 'ST_GENERAL'
      },
      {
        tier: 'ST_GENERAL',
        label: 'General ST',
        priority: 3,
        allocatedSlots: 10,
        allocatedBudget: 960000, // Only enough for 2 scholars!
        unitCostPerAwardee: 480000
      }
    ];

    // Plenty of candidates
    const candidates: CandidateForSelection[] = Array.from({ length: 30 }, (_, i) => ({
      applicantId: `cand-${i}`,
      applicationId: `app-${i}`,
      name: `Candidate ${i}`,
      category: i < 10 ? 'DIVYANGJAN' : i < 20 ? 'PVTG' : 'ST_OTHER',
      isPwD: i < 10,
      isPVTG: i >= 10 && i < 20,
      gender: 'MALE',
      meritScore: 80 + (i % 10)
    }));

    const result = SelectionEngine.runNfstWaterfall(candidates, customTiers);

    // Even though 10 slots were requested, only 2 could be funded in Divyangjan
    assert.strictEqual(result.tierSummary['DIVYANGJAN'].selectedCount, 2);
    assert.ok(result.isBudgetConstrained);
    assert.ok(result.totalCommittedExpenditure <= result.totalSanctionedBudget);
  });
});
