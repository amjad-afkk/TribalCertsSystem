import { test, describe } from 'node:test';
import assert from 'node:assert';
import { SelectionEngine, CandidateForSelection } from '../src/services/selectionEngine.js';

describe('SelectionEngine NFST Waterfall and Dynamic Spillover', () => {
  test('should cascade unfilled slots from Divyangjan -> PVTG -> Female ST -> General ST', () => {
    // 38 Divyangjan slots, 75 PVTG slots, 225 Female ST slots, 412 General ST slots (Total 750)
    // Setup a small controlled pool:
    // Only 2 PwD candidates (36 slots should spill over to PVTG)
    // Only 5 PVTG candidates (remaining slots should spill over to Female ST)
    const customTiers = [
      { tier: 'DIVYANGJAN', label: 'PwD Tier', priority: 1, allocatedSlots: 10, spilloverTargetTier: 'PVTG' },
      { tier: 'PVTG', label: 'PVTG Tier', priority: 2, allocatedSlots: 10, spilloverTargetTier: 'FEMALE_ST' },
      { tier: 'FEMALE_ST', label: 'Female ST', priority: 3, allocatedSlots: 20, spilloverTargetTier: 'ST_GENERAL' },
      { tier: 'ST_GENERAL', label: 'General ST', priority: 4, allocatedSlots: 20 }
    ];

    const candidates: CandidateForSelection[] = [
      // 2 PwD
      { applicantId: 'pwd-1', applicationId: 'app-pwd-1', name: 'PwD Candidate 1', category: 'DIVYANGJAN', isPwD: true, isPVTG: false, gender: 'MALE', meritScore: 85 },
      { applicantId: 'pwd-2', applicationId: 'app-pwd-2', name: 'PwD Candidate 2', category: 'DIVYANGJAN', isPwD: true, isPVTG: false, gender: 'FEMALE', meritScore: 80 },
      // 3 PVTG
      { applicantId: 'pvtg-1', applicationId: 'app-pvtg-1', name: 'PVTG Candidate 1', category: 'PVTG', isPwD: false, isPVTG: true, gender: 'MALE', meritScore: 78 },
      { applicantId: 'pvtg-2', applicationId: 'app-pvtg-2', name: 'PVTG Candidate 2', category: 'PVTG', isPwD: false, isPVTG: true, gender: 'FEMALE', meritScore: 75 },
      { applicantId: 'pvtg-3', applicationId: 'app-pvtg-3', name: 'PVTG Candidate 3', category: 'PVTG', isPwD: false, isPVTG: true, gender: 'MALE', meritScore: 72 }
    ];

    // Add 25 female candidates
    for (let i = 1; i <= 25; i++) {
      candidates.push({
        applicantId: `fem-${i}`,
        applicationId: `app-fem-${i}`,
        name: `Female Candidate ${i}`,
        category: 'FEMALE_ST',
        isPwD: false,
        isPVTG: false,
        gender: 'FEMALE',
        meritScore: 70 + i
      });
    }

    const result = SelectionEngine.runNfstWaterfall(candidates, customTiers);

    // Divyangjan: 10 slots - 2 selected = 8 spillover to PVTG
    assert.strictEqual(result.tierSummary['DIVYANGJAN'].selectedCount, 2);
    assert.strictEqual(result.tierSummary['DIVYANGJAN'].spilloverOut, 8);

    // PVTG: 10 quota + 8 spillover = 18 effective quota.
    // 3 candidates selected -> 15 spillover to Female ST
    assert.strictEqual(result.tierSummary['PVTG'].finalQuota, 18);
    assert.strictEqual(result.tierSummary['PVTG'].selectedCount, 3);
    assert.strictEqual(result.tierSummary['PVTG'].spilloverOut, 15);

    // Female ST: 20 quota + 15 spillover = 35 effective quota.
    // Has 25 candidates -> all 25 selected! 10 spillover to General ST
    assert.strictEqual(result.tierSummary['FEMALE_ST'].finalQuota, 35);
    assert.strictEqual(result.tierSummary['FEMALE_ST'].selectedCount, 25);
    assert.strictEqual(result.tierSummary['FEMALE_ST'].spilloverOut, 10);

    // Transitions recorded in order
    assert.strictEqual(result.transitions.length, 3);
    assert.strictEqual(result.transitions[0].fromTier, 'DIVYANGJAN');
    assert.strictEqual(result.transitions[0].toTier, 'PVTG');
    assert.strictEqual(result.transitions[0].slotsShifted, 8);
  });
});
