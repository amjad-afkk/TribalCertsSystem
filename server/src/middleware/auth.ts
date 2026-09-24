import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types/index.js';
import { getDb } from '../db/connection.js';

// Normalization map supporting both canonical role keys and demo persona IDs
const ROLE_MAP: Record<string, UserRole> = {
  // Canonical keys
  'APPLICANT': 'APPLICANT',
  'INO': 'INO',
  'STATE_NODAL': 'STATE_NODAL',
  'COMMITTEE': 'COMMITTEE',
  'MOTA_ADMIN': 'MOTA_ADMIN',
  'KIOSK_OPERATOR': 'KIOSK_OPERATOR',

  // Demo persona identifiers
  'applicant-pooja': 'APPLICANT',
  'applicant-amitabh': 'APPLICANT',
  'applicant-sunita': 'APPLICANT',
  'ino-officer': 'INO',
  'state-nodal': 'STATE_NODAL',
  'committee-member': 'COMMITTEE',
  'mota-admin': 'MOTA_ADMIN',
  'kiosk-operator': 'KIOSK_OPERATOR'
};

export interface AuthenticatedRequest extends Request {
  userRole?: UserRole;
  personaId?: string;
  userId?: string;
}

/**
 * Extracts and verifies the user's role:
 * 1. Checks `Authorization: Bearer <token>` in `auth_sessions` table.
 * 2. If valid session found, binds role and user identity to request.
 * 3. If in DEMO_MODE, allows fallback to `x-user-role` / `x-persona-id` header for rapid persona switching.
 * 4. Defaults to APPLICANT (least privilege) if unauthenticated.
 */
export const extractRole = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  let bearerToken: string | null = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    bearerToken = authHeader.slice(7).trim();
  }

  // 1. Validate bearer token against database sessions if provided
  if (bearerToken) {
    try {
      const db = getDb();
      const session = db.prepare('SELECT * FROM auth_sessions WHERE token = ? AND verified = 1').get(bearerToken) as any;
      if (session) {
        // Check session expiration if set
        const notExpired = !session.expires_at || new Date(session.expires_at) > new Date();
        if (notExpired) {
          req.userRole = (session.role as UserRole) || 'APPLICANT';
          req.userId = session.applicant_id;
          req.personaId = session.role;
          return next();
        }
      }
    } catch {
      // In case DB is not yet available or in mock context, proceed to fallback
    }
  }

  // 2. Fallback to demo headers if DEMO_MODE is active
  const isDemoMode = process.env.DEMO_MODE !== 'false';
  if (isDemoMode) {
    const rawHeader = (req.headers['x-user-role'] || req.headers['x-persona-id']) as string;
    if (rawHeader) {
      const normalized = ROLE_MAP[rawHeader] || 'APPLICANT';
      req.userRole = normalized;
      req.personaId = rawHeader;
      return next();
    }
  }

  // 3. Default to lowest privilege APPLICANT
  req.userRole = 'APPLICANT';
  req.personaId = 'APPLICANT';
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
