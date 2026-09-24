import { Request, Response, NextFunction } from 'express';

export interface FieldRule {
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
  oneOf?: readonly (string | number)[];
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

export type ValidationSchema = Record<string, FieldRule>;

/**
 * Express middleware generator that validates `req.body` against a schema.
 * Rejects invalid payloads with 400 Bad Request and structured error details.
 */
export function validateBody(schema: ValidationSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const body = req.body || {};
    const errors: string[] = [];

    for (const [field, rule] of Object.entries(schema)) {
      const val = body[field];

      if (rule.required && (val === undefined || val === null || val === '')) {
        errors.push(`Field '${field}' is required.`);
        continue;
      }

      if (val !== undefined && val !== null && val !== '') {
        if (rule.type) {
          if (rule.type === 'array') {
            if (!Array.isArray(val)) {
              errors.push(`Field '${field}' must be an array.`);
            }
          } else if (rule.type === 'number') {
            if (typeof val !== 'number' || isNaN(val)) {
              errors.push(`Field '${field}' must be a valid number.`);
            }
          } else if (typeof val !== rule.type) {
            errors.push(`Field '${field}' must be of type ${rule.type}.`);
          }
        }

        if (rule.oneOf && !rule.oneOf.includes(val)) {
          errors.push(`Field '${field}' must be one of: [${rule.oneOf.join(', ')}].`);
        }

        if (rule.minLength !== undefined && typeof val === 'string' && val.length < rule.minLength) {
          errors.push(`Field '${field}' must have at least ${rule.minLength} characters.`);
        }

        if (rule.maxLength !== undefined && typeof val === 'string' && val.length > rule.maxLength) {
          errors.push(`Field '${field}' cannot exceed ${rule.maxLength} characters.`);
        }

        if (rule.min !== undefined && typeof val === 'number' && val < rule.min) {
          errors.push(`Field '${field}' cannot be less than ${rule.min}.`);
        }

        if (rule.max !== undefined && typeof val === 'number' && val > rule.max) {
          errors.push(`Field '${field}' cannot be greater than ${rule.max}.`);
        }
      }
    }

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Request payload failed validation requirements.',
        details: errors
      });
      return;
    }

    next();
  };
}

// Pre-defined validation schemas for API routes
export const schemas = {
  sendOtp: {
    identifier: { required: true, type: 'string', minLength: 3 }
  },
  verifyOtp: {
    sessionId: { required: true, type: 'string' },
    otp: { required: true }
  },
  officerLogin: {
    pin: { required: true, type: 'string' }
  },
  submitJoining: {
    fellowshipId: { required: true, type: 'string' },
    joiningDate: { required: true, type: 'string' }
  },
  submitContinuation: {
    fellowshipId: { required: true, type: 'string' },
    quarterNumber: { required: true, type: 'number', min: 1, max: 20 },
    academicYear: { required: true, type: 'string' }
  },
  submitThesis: {
    fellowshipId: { required: true, type: 'string' },
    thesisTitle: { required: true, type: 'string', minLength: 3 }
  },
  createScheme: {
    code: { required: true, type: 'string' },
    name: { required: true, type: 'string', minLength: 3 },
    level: { required: true, type: 'string' }
  },
  simulatorMatch: {
    category: { required: true, type: 'string' },
    annualIncome: { required: true, type: 'number' }
  },
  submitApplication: {
    applicantId: { required: true, type: 'string' },
    schemeId: { required: true, type: 'string' }
  },
  reviewApplication: {
    action: { required: true, type: 'string', oneOf: ['APPROVED', 'FLAGGED_DEFICIENCY', 'REJECTED'] }
  },
  reviewDocument: {
    status: { required: true, type: 'string', oneOf: ['ACCEPTED', 'REJECTED', 'FLAGGED'] }
  },
  documentExtract: {
    fileBase64: { required: true, type: 'string' }
  },
  chatbot: {
    message: { required: true, type: 'string', minLength: 1 }
  },
  waterfall: {
    academicYear: { required: false, type: 'string' },
    schemeCode: { required: false, type: 'string' }
  },
  selectionSignOff: {
    applicationId: { required: false, type: 'string' },
    schemeId: { required: false, type: 'string' },
    committeeMember: { required: false, type: 'string' },
    comments: { required: false, type: 'string' },
    academicYear: { required: false, type: 'string' },
    officerDesignation: { required: false, type: 'string' }
  },
  kioskOnboardStudent: {
    studentName: { required: true, type: 'string', minLength: 2 },
    category: { required: true, type: 'string' },
    annualIncome: { required: true, type: 'number' },
    schemeCode: { required: true, type: 'string' },
    kioskCenterId: { required: true, type: 'string' },
    vleOperatorId: { required: true, type: 'string' }
  },
  kioskVerifyUdid: {
    udidNumber: { required: true, type: 'string', minLength: 4 },
    studentName: { required: false, type: 'string' }
  }
} as const;

