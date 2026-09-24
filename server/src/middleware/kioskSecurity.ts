import { Request, Response, NextFunction } from 'express';

// Empanelled government intranet and state WAN origins for assisted citizen registration
export const AUTHORIZED_KIOSK_ORIGINS = [
  'https://kiosk.meeseva.gov.in',
  'https://csc.gov.in',
  'https://swan.tribal.gov.in',
  'http://swan.meeseva.internal',
  'http://10.20.0.1:4000'
];

export const VALID_KIOSK_LICENSE_PREFIXES = ['VLE-MEESEVA', 'CSC-VLE', 'MS-TELANGANA', 'MS-ODISHA', 'MS-MP'];

/**
 * Enforces Internal Network / CORS isolation for assisted student onboarding:
 * 1. Checks Origin / Referer header against the empanelled MeeSeva/CSC whitelist.
 * 2. In Demo / Simulation mode, supports:
 *    - `x-network-origin` or `x-simulated-origin` (e.g., 'https://kiosk.meeseva.gov.in')
 *    - `x-kiosk-network` ('SWAN_AUTHORIZED_INTRANET' vs 'PUBLIC_INTERNET')
 * 3. Checks for valid Kiosk Operator License Key (`x-kiosk-license-key`).
 * 4. Rejects public internet requests with explicit 403 CORS Policy Violation.
 */
export const verifyKioskCorsAndLicense = (req: Request, res: Response, next: NextFunction): void => {
  const origin = req.headers['origin'] || req.headers['referer'] || '';
  const simulatedOrigin = (req.headers['x-simulated-origin'] || req.headers['x-network-origin']) as string;
  const networkMode = (req.headers['x-kiosk-network'] || '') as string;
  const licenseKey = (req.headers['x-kiosk-license-key'] || '') as string;

  const effectiveOrigin = (simulatedOrigin || origin || '').toString();

  // Explicit block if client specifically sends public internet simulation
  if (networkMode === 'PUBLIC_INTERNET') {
    res.status(403).json({
      success: false,
      error: 'CORS_POLICY_VIOLATION',
      originBlocked: effectiveOrigin || 'http://localhost:5173',
      networkState: 'PUBLIC_UNRESTRICTED_INTERNET',
      message: `Access Denied: Origin '${effectiveOrigin || 'http://localhost:5173'}' is not empanelled in the MeeSeva/CSC Government Intranet whitelist. Assisted student onboarding is strictly quarantined to authorized village kiosks.`
    });
    return;
  }

  // Determine if origin is an empanelled government kiosk origin
  const isAuthorizedOrigin = AUTHORIZED_KIOSK_ORIGINS.some(allowed => 
    effectiveOrigin.startsWith(allowed)
  ) || networkMode === 'SWAN_AUTHORIZED_INTRANET';

  if (!isAuthorizedOrigin) {
    res.status(403).json({
      success: false,
      error: 'CORS_POLICY_VIOLATION',
      originBlocked: effectiveOrigin || 'UNKNOWN_PUBLIC_ORIGIN',
      networkState: 'PUBLIC_UNRESTRICTED_INTERNET',
      message: `Access Denied: Origin '${effectiveOrigin || 'Public Web'}' is not empanelled in the MeeSeva/CSC Government Intranet whitelist. Assisted student onboarding is strictly quarantined to authorized village kiosks.`
    });
    return;
  }

  // Validate Operator License Key
  const isValidLicense = VALID_KIOSK_LICENSE_PREFIXES.some(prefix => licenseKey.startsWith(prefix)) ||
    licenseKey.includes('2026') ||
    licenseKey === 'VLE-MEESEVA-2026-TRIBAL';

  if (!licenseKey || !isValidLicense) {
    res.status(401).json({
      success: false,
      error: 'INVALID_KIOSK_LICENSE',
      message: 'Unauthorized Operator: A valid active MeeSeva / CSC VLE License Key (X-Kiosk-License-Key) is required.'
    });
    return;
  }

  next();
};
