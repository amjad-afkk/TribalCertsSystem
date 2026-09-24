import { describe, test } from 'node:test';
import assert from 'node:assert';
import { AisheService } from '../src/services/aisheService.js';
import { DeficiencyVoiceService } from '../src/services/deficiencyVoiceService.js';

describe('AisheService & DeficiencyVoiceService Shield', () => {
  test('AisheService should validate verified Top Class empanelled institutes', () => {
    const valid = AisheService.validateAisheCode('U-0108'); // JNU
    assert.strictEqual(valid.isValid, true);
    assert.strictEqual(valid.institute?.name.includes('Jawaharlal Nehru University'), true);
    assert.strictEqual(valid.institute?.isTopClassEmpanelled, true);
    assert.strictEqual(valid.institute?.escrowAccountMapped, true);
    assert.strictEqual(valid.warnings.length, 0);
  });

  test('AisheService should flag unaccredited or missing institute codes to prevent fraud', () => {
    const invalid = AisheService.validateAisheCode('INVALID-CODE-999');
    assert.strictEqual(invalid.isValid, false);
    assert.strictEqual(invalid.institute, null);
    assert.ok(invalid.warnings[0].includes('not registered'));

    const blacklisted = AisheService.validateAisheCode('C-9999');
    assert.strictEqual(blacklisted.isValid, false);
    assert.ok(blacklisted.warnings.some(w => w.includes('UNACCREDITED')));
  });

  test('AisheService should calculate dual escrow disbursement plan with student DBT split', () => {
    const plan = AisheService.calculateDualEscrowRouting('ARG43', 250000, 'U-0053'); // IIT Delhi Top Class
    assert.strictEqual(plan.totalSanctionedGrant, 250000);
    // 70% tuition to institute, 30% living/hardware to student
    assert.strictEqual(plan.institutionalEscrowAmount, 175000);
    assert.strictEqual(plan.studentDbtDirectAmount, 75000);
    assert.strictEqual(plan.instituteRecipient.aisheCode, 'U-0053');
    assert.ok(plan.instituteRecipient.pfmsTreasuryCode.length > 0);
    assert.strictEqual(plan.fraudRiskScore, 5); // Low risk
  });

  test('DeficiencyVoiceService should generate actionable fix cards and dialect audio scripts', () => {
    const guidanceHi = DeficiencyVoiceService.getGuidance(
      'Annual income certificate from 2021 uploaded, requires 2025-26 revenue endorsement',
      'Pooja Maravi',
      'hi'
    );

    assert.strictEqual(guidanceHi.language, 'hi');
    assert.ok(guidanceHi.plainLanguageExplanation.includes('आय प्रमाण पत्र'));
    assert.ok(guidanceHi.audioScript.includes('नमस्ते Pooja Maravi'));
    assert.strictEqual(guidanceHi.statutoryCureDeadlineDays, 15);
    assert.ok(guidanceHi.prescribedAction.length >= 2);

    // Santhali dialect test
    const guidanceSat = DeficiencyVoiceService.getGuidance(
      'Caste certificate stamp unclear',
      'Sunita Soren',
      'sat'
    );
    assert.strictEqual(guidanceSat.language, 'sat');
    assert.ok(guidanceSat.audioScript.includes('Johar Sunita Soren'));
  });
});
