import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types/index.js';

// Normalization map supporting both canonical role keys and demo persona IDs
const ROLE_MAP: Record<string, UserRole> = {
  // Canonical keys
  'APPLICANT': 'APPLICANT',
  'INO': 'INO',
  'STATE_NODAL': 'STATE_NODAL',
  'COMMITTEE': 'COMMITTEE',
  'MOTA_ADMIN': 'MOTA_ADMIN',

  // Demo persona identifiers
  'applicant-pooja': 'APPLICANT',
  'applicant-amitabh': 'APPLICANT',
  'applicant-sunita': 'APPLICANT',
  'ino-officer': 'INO',
  'state-nodal': 'STATE_NODAL',
  'committee-member': 'COMMITTEE',
  'mota-admin': 'MOTA_ADMIN'
};

export interface AuthenticatedRequest extends Request {
  userRole?: UserRole;
  personaId?: string;
}

/**
 * Extracts and normalizes the user's role from incoming request headers.
 * Defaults to APPLICANT if not explicitly supplied.
 */
export const extractRole = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const rawHeader = (req.headers['x-user-role'] || req.headers['x-persona-id'] || 'APPLICANT') as string;
  const normalized = ROLE_MAP[rawHeader] || 'APPLICANT';

  req.userRole = normalized;
  req.personaId = rawHeader;
  next();
};

/**
 * Middleware factory enforcing role-based clearance requirements.
 * MoTA_ADMIN has super-administrator override clearance across all endpoints.
 */
export const requireRoles = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const currentRole = req.userRole || 'APPLICANT';

    // Super Admin bypass: MoTA_ADMIN possesses global statutory governance authority
    if (currentRole === 'MOTA_ADMIN' || allowedRoles.includes(currentRole)) {
      next();
      return;
    }

    res.status(403).json({
      success: false,
      error: 'ACCESS_DENIED',
      message: `Access restricted by MoTA IAM Policy. Action requires clearance: [${allowedRoles.join(', ')}]. Current role: [${currentRole}].`,
      requiredRoles: allowedRoles,
      currentRole
    });
  };
};
