import { Request, Response } from 'express';
import { AiDocumentService } from '../services/aiDocumentService.js';

export const extractAndVerifyDocument = async (req: Request, res: Response) => {
  try {
    const { docType, fileName, base64Data, mimeType, formData } = req.body;

    if (!docType || !fileName) {
      return res.status(400).json({ success: false, message: 'docType and fileName are required' });
    }

    // 1. AI OCR & Key-Value Extraction Layer (Gemini multimodal / Fallback)
    const extracted = await AiDocumentService.extractDocumentFields(
      docType,
      fileName,
      base64Data,
      mimeType
    );

    // 2. Deterministic Cross-Document Consistency Check
    const verification = AiDocumentService.verifyConsistency(extracted, formData || {});

    res.json({
      success: true,
      extracted,
      verification
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};
