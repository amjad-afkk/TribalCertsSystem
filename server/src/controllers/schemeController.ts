import { Request, Response } from 'express';
import { getDb } from '../db/connection.js';
import { Scheme } from '../types/index.js';
import { uid } from '../services/uid.js';

export function parseSchemeRow(row: any): Scheme {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    level: row.level,
    description: row.description,
    legacyPortal: row.legacy_portal,
    incomeCeiling: row.income_ceiling,
    ageCeiling: row.age_ceiling,
    academicThreshold: row.academic_threshold,
    quotaType: row.quota_type,
    totalSlots: row.total_slots,
    selectionMethod: row.selection_method,
    reservationWaterfall: JSON.parse(row.reservation_waterfall || '[]'),
    documentChecklist: JSON.parse(row.document_checklist || '[]'),
    verificationHierarchy: JSON.parse(row.verification_hierarchy || '[]'),
    disbursementFrequency: row.disbursement_frequency,
    isActive: Boolean(row.is_active)
  };
}

export const getAllSchemes = (req: Request, res: Response) => {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM schemes WHERE is_active = 1 ORDER BY code ASC').all();
    const schemes = rows.map(parseSchemeRow);
    res.json({ success: true, count: schemes.length, data: schemes });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getSchemeById = (req: Request, res: Response) => {
  try {
    const db = getDb();
    const row = db.prepare('SELECT * FROM schemes WHERE id = ? OR code = ?').get(req.params.id, req.params.id);
    if (!row) {
      return res.status(404).json({ success: false, message: 'Scheme not found' });
    }
    res.json({ success: true, data: parseSchemeRow(row) });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const createScheme = (req: Request, res: Response) => {
  try {
    const db = getDb();
    const body = req.body;

    if (!body.code || !body.name || !body.level) {
      return res.status(400).json({
        success: false,
        message: 'Required fields missing: code, name, and level are mandatory for scheme creation.'
      });
    }

    const id = uid(`scheme-${body.code.toLowerCase()}`);
    const insert = db.prepare(`
      INSERT INTO schemes (
        id, code, name, level, description, legacy_portal,
        income_ceiling, age_ceiling, academic_threshold, quota_type, total_slots,
        selection_method, reservation_waterfall, document_checklist,
        verification_hierarchy, disbursement_frequency, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);

    insert.run(
      id,
      body.code,
      body.name,
      body.level,
      body.description || 'Configured through MoTA No-Code Scheme Editor',
      body.legacyPortal || 'Consolidated MoTA Portal',
      body.incomeCeiling ?? null,
      body.ageCeiling ?? null,
      body.academicThreshold ?? null,
      body.quotaType || 'UNCAPPED',
      body.totalSlots ?? null,
      body.selectionMethod || 'AUTO_GATE',
      JSON.stringify(body.reservationWaterfall || []),
      JSON.stringify(body.documentChecklist || []),
      JSON.stringify(body.verificationHierarchy || ['INO', 'STATE_NODAL']),
      body.disbursementFrequency || 'ANNUAL'
    );

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (id, entity_type, entity_id, actor, action, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      uid('audit'),
      'SCHEME',
      id,
      `Super Administrator (Role: ${(req as any).userRole || 'MOTA_ADMIN'})`,
      'NO_CODE_SCHEME_CREATED',
      `New scheme "${body.name}" (${body.code}) configured without code deployment.`
    );

    const created = db.prepare('SELECT * FROM schemes WHERE id = ?').get(id);
    res.status(201).json({ success: true, data: parseSchemeRow(created) });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
};
