import { test, describe } from 'node:test';
import assert from 'node:assert';
import { RulesEngine } from '../src/services/rulesEngine.js';
import { Scheme } from '../src/types/index.js';

describe('RulesEngine Deterministic Eligibility Evaluation', () => {
  const preMatricScheme: Scheme = {
    id: 'scheme-pre-matric',
    code: 'BPVGK',
    name: 'Pre-Matric Scholarship',
    level: 'Class IX - X',
    description: 'Pre-Matric for ST',
    legacyPortal: 'dbttribal.gov.in',
    incomeCeiling: 250000,
    ageCeiling: null,
    academicThreshold: null,
    quotaType: 'UNCAPPED',
    totalSlots: null,
    selectionMethod: 'AUTO_GATE',
    reservationWaterfall: [],
    documentChecklist: [],
    verificationHierarchy: ['INO', 'STATE_NODAL'],
    disbursementFrequency: 'ANNUAL',
    isActive: true
  };

  const nosScheme: Scheme = {
    id: 'scheme-nos',
    code: 'AZKMI',
    name: 'National Overseas Scholarship',
    level: 'Master’s / Ph.D Abroad',
    description: 'NOS for ST',
    legacyPortal: 'overseas.tribal.gov.in',
    incomeCeiling: 600000,
    ageCeiling: 35,
    academicThreshold: 55,
    quotaType: 'FIXED_SLOTS',
    totalSlots: 20,
    selectionMethod: 'TIERED_PRIORITY',
    reservationWaterfall: [],
    documentChecklist: [],
    verificationHierarchy: ['MOTA_ADMIN', 'SELECTION_COMMITTEE'],
    disbursementFrequency: 'SEMESTER_FOREX',
    isActive: true
  };

  test('should pass eligible Pre-Matric applicant within income cap', () => {
    const result = RulesEngine.evaluateSchemeEligibility(preMatricScheme, {
      category: 'ST_OTHER',
      annualIncome: 180000,
      academicPercentage: 75,
      courseLevel: 'Class IX'
    });

    assert.strictEqual(result.isEligible, true);
    assert.strictEqual(result.matchScore, 100);
    assert.strictEqual(result.blockers.length, 0);
  });

  test('should block applicant when income exceeds statutory ceiling', () => {
    const result = RulesEngine.evaluateSchemeEligibility(preMatricScheme, {
      category: 'ST_OTHER',
      annualIncome: 300000, // Exceeds 2.5L cap
      academicPercentage: 75,
      courseLevel: 'Class IX'
    });

    assert.strictEqual(result.isEligible, false);
    assert.ok(result.blockers.some(b => b.includes('exceeds the ceiling limit')));
  });

  test('should block non-ST candidate', () => {
    const result = RulesEngine.evaluateSchemeEligibility(preMatricScheme, {
      category: 'GENERAL',
      annualIncome: 100000,
      academicPercentage: 80,
      courseLevel: 'Class IX'
    });

    assert.strictEqual(result.isEligible, false);
    assert.strictEqual(result.matchScore, 0);
    assert.ok(result.blockers.some(b => b.includes('Scheduled Tribe (ST)')));
  });

  test('should apply conditional QS Top 1000 mark waiver for NOS', () => {
    // NOS candidate has 52% (below 55% threshold), but holds admit from Oxford (Rank 3)
    const result = RulesEngine.evaluateSchemeEligibility(nosScheme, {
      category: 'FEMALE_ST',
      annualIncome: 450000,
      age: 28,
      academicPercentage: 52, // Under 55%
      courseLevel: 'Master’s Abroad',
      qsRank: 3 // Top 1000 waiver
    });

    assert.strictEqual(result.isEligible, true);
    assert.ok(result.reasons.some(r => r.includes('percentage waiver applied')));
  });

  test('should block NOS applicant when age exceeds ceiling', () => {
    const result = RulesEngine.evaluateSchemeEligibility(nosScheme, {
      category: 'PVTG',
      annualIncome: 300000,
      age: 39, // Max is 35
      academicPercentage: 65,
      courseLevel: 'Ph.D Abroad'
    });

    assert.strictEqual(result.isEligible, false);
    assert.ok(result.blockers.some(b => b.includes('exceeds maximum permissible age')));
  });
});
