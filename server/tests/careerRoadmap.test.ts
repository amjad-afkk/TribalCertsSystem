import { describe, test } from 'node:test';
import assert from 'node:assert';
import { CareerRoadmapService } from '../src/services/careerRoadmapService.js';

describe('CareerRoadmapService Tribal Academic & Reservation Pathway Engine', () => {
  test('should generate academic milestones and statutory quotas for UG ST candidate', () => {
    const roadmap = CareerRoadmapService.generateRoadmap({
      category: 'PVTG',
      courseLevel: 'UG',
      academicPercentage: 74,
      annualIncome: 180000,
      age: 21,
      isPwD: false,
      isPVTG: true
    });

    assert.ok(roadmap.candidateSummary.categoryLabel.includes('PVTG'));
    assert.strictEqual(roadmap.candidateSummary.levelLabel, 'UG');
    assert.ok(roadmap.academicPath.length >= 2);
    // Should include NFST fellowship and Top Class
    const nfstStep = roadmap.academicPath.find(m => m.schemeAlignment.includes('NFST'));
    assert.ok(nfstStep);
    assert.ok(nfstStep.estimatedFinancialSupport.includes('4,80,000'));

    // Should include 7.5% Central Govt quota and PM-JANMAN for PVTG
    const quota = roadmap.statutoryEntitlements.find(e => e.title.includes('7.5%'));
    assert.ok(quota);
    const pvtgMission = roadmap.statutoryEntitlements.find(e => e.title.includes('PM-JANMAN'));
    assert.ok(pvtgMission);

    // Should include unlimited attempts in UPSC
    const attempts = roadmap.statutoryEntitlements.find(e => e.title.includes('Unlimited Attempts'));
    assert.ok(attempts);
  });

  test('should include RPwD 4% horizontal reservation and assistive checklist for Divyangjan candidate', () => {
    const roadmap = CareerRoadmapService.generateRoadmap({
      category: 'DIVYANGJAN',
      courseLevel: 'Class XI-XII',
      academicPercentage: 68,
      annualIncome: 120000,
      age: 18,
      isPwD: true
    });

    const pwdEntitlement = roadmap.statutoryEntitlements.find(e => e.title.includes('4% Horizontal Reservation'));
    assert.ok(pwdEntitlement);
    const udidDoc = roadmap.documentationChecklist.find(d => d.includes('UDID'));
    assert.ok(udidDoc);
  });
});
