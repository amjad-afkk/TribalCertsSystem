import { Request, Response } from 'express';
import { KioskService } from '../services/kioskService.js';

export const onboardKioskStudent = (req: Request, res: Response): void => {
  try {
    const origin = (req.headers['x-simulated-origin'] || req.headers['origin'] || 'https://kiosk.meeseva.gov.in') as string;
    const receipt = KioskService.onboardStudent(req.body, origin);

    res.status(201).json({
      success: true,
      message: `Student '${receipt.studentName}' successfully registered via MeeSeva Kiosk ${receipt.kioskCenterId}.`,
      receipt
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: 'KIOSK_ONBOARDING_FAILED',
      message: err.message
    });
  }
};

export const getKioskStats = (req: Request, res: Response): void => {
  try {
    const kioskCenterId = (req.query.kioskCenterId as string) || 'MS-TELANGANA-BHADRADRI-09';
    const stats = KioskService.getKioskStats(kioskCenterId);

    res.json({
      success: true,
      stats
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

export const verifyKioskUdid = (req: Request, res: Response): void => {
  try {
    const result = KioskService.verifyUdid(req.body);

    res.json({
      success: true,
      message: 'UDID card successfully verified against Central DEPwD Swavlamban registry.',
      data: result
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: 'UDID_VERIFICATION_FAILED',
      message: err.message
    });
  }
};

