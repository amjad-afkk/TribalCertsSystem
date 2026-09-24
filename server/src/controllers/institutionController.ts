import { Request, Response } from 'express';
import { AisheService } from '../services/aisheService.js';
import { DeficiencyVoiceService } from '../services/deficiencyVoiceService.js';

export const searchInstitutes = (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string) || '';
    const results = AisheService.searchInstitutes(q);
    res.json({ success: true, count: results.length, data: results });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const validateAisheCode = (req: Request, res: Response) => {
  try {
    const { aisheCode } = req.body;
    if (!aisheCode) {
      return res.status(400).json({ success: false, message: 'aisheCode is required' });
    }
    const result = AisheService.validateAisheCode(aisheCode);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const calculateEscrowPlan = (req: Request, res: Response) => {
  try {
    const { schemeCode, totalAwardAmount, aisheCode, aadhaarMasked } = req.body;
    const plan = AisheService.calculateDualEscrowRouting(
      schemeCode || 'ARG43',
      Number(totalAwardAmount) || 200000,
      aisheCode || 'U-0108',
      aadhaarMasked || 'XXXX-XXXX-4123'
    );
    res.json({ success: true, data: plan });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getSahayakGuidance = (req: Request, res: Response) => {
  try {
    const { deficiencyText, applicantName, language } = req.body;
    const guidance = DeficiencyVoiceService.getGuidance(
      deficiencyText || 'Document clarification required',
      applicantName || 'Applicant',
      language || 'hi'
    );
    res.json({ success: true, data: guidance });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};
