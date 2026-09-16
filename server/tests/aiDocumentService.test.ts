import { test, describe } from 'node:test';
import assert from 'node:assert';
import { AiDocumentService, ExtractedDocumentData } from '../src/services/aiDocumentService.js';

describe('AiDocumentService Consistency Check and Explainable Deficiency Generator', () => {
  test('should detect high severity income mismatch and statutory cap breach', () => {
    const extractedData: ExtractedDocumentData = {
      documentType: 'INCOME_CERT',
      candidateName: 'Amitabh Gond',
      annualIncome: 280000, // Document says 2.8L
      rawConfidence: 98.2,
      extractionMethod: 'HEURISTIC_PARSER_FALLBACK'
    };

    // Form claims 2.4L, Scheme ceiling is 2.5L
    const formData = {
      candidateName: 'Amitabh Gond',
      annualIncome: 240000,
      incomeCeiling: 250000
    };

    const result = AiDocumentService.verifyConsistency(extractedData, formData);

    assert.strictEqual(result.hasDiscrepancy, true);
    assert.ok(result.confidenceScore < 60);
    assert.strictEqual(result.discrepancies.length, 1);
    assert.strictEqual(result.discrepancies[0].severity, 'HIGH');
    assert.ok(result.discrepancies[0].explanation.includes('exceeds the statutory scheme ceiling'));
    assert.ok(result.explainableDeficiencyReason?.includes('[HIGH DEFICIENCY]'));
  });

  test('should detect candidate name mismatch across form and certificate', () => {
    const extractedData: ExtractedDocumentData = {
      documentType: 'CASTE_CERT',
      candidateName: 'Rajesh Kumar Singh',
      casteCategory: 'Gond',
      rawConfidence: 95.0,
      extractionMethod: 'HEURISTIC_PARSER_FALLBACK'
    };

    const formData = {
      candidateName: 'Pooja Maravi' // Divergent name
    };

    const result = AiDocumentService.verifyConsistency(extractedData, formData);

    assert.strictEqual(result.hasDiscrepancy, true);
    assert.ok(result.discrepancies.some(d => d.field === 'candidateName'));
    assert.ok(result.discrepancies[0].explanation.includes('diverges substantially'));
  });

  test('should return verified clean status for consistent document', () => {
    const extractedData: ExtractedDocumentData = {
      documentType: 'INCOME_CERT',
      candidateName: 'Pooja Maravi',
      annualIncome: 140000,
      rawConfidence: 99.0,
      extractionMethod: 'HEURISTIC_PARSER_FALLBACK'
    };

    const formData = {
      candidateName: 'Pooja Maravi',
      annualIncome: 140000,
      incomeCeiling: 250000
    };

    const result = AiDocumentService.verifyConsistency(extractedData, formData);

    assert.strictEqual(result.hasDiscrepancy, false);
    assert.strictEqual(result.confidenceScore, 98);
    assert.strictEqual(result.discrepancies.length, 0);
    assert.strictEqual(result.explainableDeficiencyReason, null);
  });
});
