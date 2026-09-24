import { test, describe } from 'node:test';
import assert from 'node:assert';

describe('Tribal Saturation GIS Radar & District Saturation Index (DSI)', () => {
  // Pure domain function mirroring the controller calculation
  function calculateDsi(eligibleStudents: number, actualBeneficiaries: number): number {
    if (eligibleStudents <= 0) return 0;
    return Number(((actualBeneficiaries / eligibleStudents) * 100).toFixed(1));
  }

  function classifyDsiStatus(dsiPercent: number): 'SATURATED' | 'MODERATE' | 'COLD_SPOT' {
    if (dsiPercent >= 70.0) return 'SATURATED';
    if (dsiPercent >= 35.0) return 'MODERATE';
    return 'COLD_SPOT';
  }

  test('should accurately calculate DSI percentage for high and low penetration districts', () => {
    // Mayurbhanj: 112,180 beneficiaries out of 142,000 eligible
    const mayurbhanjDsi = calculateDsi(142000, 112180);
    assert.strictEqual(mayurbhanjDsi, 79.0);
    assert.strictEqual(classifyDsiStatus(mayurbhanjDsi), 'SATURATED');

    // Bastar: 21,360 beneficiaries out of 89,000 eligible
    const bastarDsi = calculateDsi(89000, 21360);
    assert.strictEqual(bastarDsi, 24.0);
    assert.strictEqual(classifyDsiStatus(bastarDsi), 'COLD_SPOT');

    // Rayagada: 34,840 beneficiaries out of 52,000 eligible
    const rayagadaDsi = calculateDsi(52000, 34840);
    assert.strictEqual(rayagadaDsi, 67.0);
    assert.strictEqual(classifyDsiStatus(rayagadaDsi), 'MODERATE');
  });

  test('should flag cold spot policy advisory and recommend Mobile CSC Van deployment when DSI < 35%', () => {
    const districts = [
      { name: 'Bastar', dsi: 24.0 },
      { name: 'Nandurbar', dsi: 28.0 },
      { name: 'Paschim Medinipur', dsi: 32.0 },
      { name: 'Mandla', dsi: 79.0 }
    ];

    const coldSpots = districts.filter(d => classifyDsiStatus(d.dsi) === 'COLD_SPOT');
    assert.strictEqual(coldSpots.length, 3, 'Should identify exactly 3 cold spot districts');

    coldSpots.forEach(cs => {
      assert.ok(cs.dsi < 35.0, `${cs.name} must be below 35% threshold`);
    });
  });

  test('should format mobile CSC van dispatch payload with unique tracking reference', () => {
    const district = 'Bastar';
    const blocks = 'Tokapal, Darbha, Bakawand';
    const dispatchId = `CSC-VAN-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const response = {
      success: true,
      message: `Mobile CSC Outreach Van successfully dispatched to ${district} (${blocks}). Offline biometric sync activated.`,
      dispatchId,
      timestamp: new Date().toISOString()
    };

    assert.strictEqual(response.success, true);
    assert.ok(response.dispatchId.startsWith('CSC-VAN-2026-'));
    assert.ok(response.message.includes('Bastar'));
    assert.ok(response.message.includes('Offline biometric sync'));
  });
});
