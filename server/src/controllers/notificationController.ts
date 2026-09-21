import { Request, Response } from 'express';
import { getDb } from '../db/connection.js';
import { uid } from '../services/uid.js';

export const getNotifications = (req: Request, res: Response): void => {
  try {
    const db = getDb();
    const recipientId = (req.query.recipientId || req.params.recipientId) as string;

    let rows: any[] = [];
    if (recipientId) {
      rows = db.prepare(`
        SELECT * FROM notifications
        WHERE recipient_id = ?
        ORDER BY created_at DESC
      `).all(recipientId) as any[];
    } else {
      rows = db.prepare(`
        SELECT * FROM notifications
        ORDER BY created_at DESC
        LIMIT 20
      `).all() as any[];
    }

    const unreadCount = rows.filter(r => !r.is_read).length;

    res.json({
      success: true,
      count: rows.length,
      unreadCount,
      data: rows.map(r => ({
        id: r.id,
        recipientId: r.recipient_id,
        channel: r.channel,
        title: r.title,
        message: r.message,
        actionUrl: r.action_url,
        isRead: Boolean(r.is_read),
        createdAt: r.created_at
      }))
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const markNotificationRead = (req: Request, res: Response): void => {
  try {
    const db = getDb();
    const notifId = req.params.id;

    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(notifId);

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const sendTestNudge = (req: Request, res: Response): void => {
  try {
    const db = getDb();
    const { recipientId, channel = 'WHATSAPP', title, message } = req.body;

    const id = uid('notif');
    db.prepare(`
      INSERT INTO notifications (id, recipient_id, channel, title, message, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, 0, datetime('now'))
    `).run(
      id,
      recipientId || 'app-user-01',
      channel,
      title || 'MoTA Status Nudge',
      message || 'Your scholarship document scrutiny is currently in progress.'
    );

    res.status(201).json({
      success: true,
      message: `${channel} nudge dispatched successfully.`,
      notificationId: id
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};
