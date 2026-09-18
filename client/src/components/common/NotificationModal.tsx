import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Bell, MessageSquare, Smartphone, X, Send
} from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId: string;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  recipientId
}) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [testMessage, setTestMessage] = useState('');
  const [testChannel, setTestChannel] = useState<'SMS' | 'WHATSAPP'>('WHATSAPP');
  const [sendingNudge, setSendingNudge] = useState(false);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const resp = await api.getNotifications(recipientId);
      if (resp.success) {
        setNotifications(resp.data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, recipientId]);

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      console.error('Error marking read:', err);
    }
  };

  const handleSendTestNudge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testMessage.trim()) return;
    setSendingNudge(true);
    try {
      const resp = await api.sendTestNudge({
        recipientId,
        channel: testChannel,
        title: testChannel === 'WHATSAPP' ? 'MoTA WhatsApp Guidance Nudge' : 'MoTA SMS Status Alert',
        message: testMessage.trim()
      });
      if (resp.success) {
        setTestMessage('');
        await loadNotifications();
      }
    } catch (err) {
      console.error('Error sending test nudge:', err);
    } finally {
      setSendingNudge(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(10, 37, 64, 0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1100, padding: '1rem', backdropFilter: 'blur(3px)'
    }}>
      <div className="gov-card" style={{
        maxWidth: '580px', width: '100%', maxHeight: '85vh',
        overflowY: 'auto', borderTop: '5px solid #1A4D8F',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.85rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={20} style={{ color: '#1A4D8F' }} />
            <h3 style={{ fontSize: '1.125rem', color: '#0A2540', margin: 0 }}>
              Multi-Channel Communications & Nudges (FR-4.6, §6.8)
            </h3>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.5rem' }}>
            <X size={16} />
          </button>
        </div>

        {/* Info banner */}
        <div style={{ backgroundColor: '#F8FAFC', padding: '0.75rem', borderRadius: '4px', border: '1px solid #E2E8F0', fontSize: '0.75rem', color: '#4A5568', marginBottom: '1rem' }}>
          Real-time logs of SMS status dispatches and automated WhatsApp conversational nudges delivered to rural ST scholars.
        </div>

        {/* Notifications list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#718096' }}>Loading alerts...</div>
          ) : notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#718096' }}>No active notifications found.</div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: '0.85rem',
                  borderRadius: '6px',
                  border: n.isRead ? '1px solid #E2E8F0' : '1px solid #BCD4F0',
                  backgroundColor: n.isRead ? '#FFFFFF' : '#F0F7FF',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    backgroundColor: n.channel === 'WHATSAPP' ? '#DCFCE7' : '#E0E7FF',
                    color: n.channel === 'WHATSAPP' ? '#166534' : '#3730A3',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    {n.channel === 'WHATSAPP' ? <MessageSquare size={12} /> : <Smartphone size={12} />}
                    {n.channel} ALERT
                  </span>

                  <span style={{ fontSize: '0.6875rem', color: '#718096' }}>
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0A2540' }}>{n.title}</div>
                <div style={{ fontSize: '0.8125rem', color: '#334155', lineHeight: 1.4 }}>{n.message}</div>

                {!n.isRead && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    style={{ alignSelf: 'flex-end', background: 'none', border: 'none', color: '#1A4D8F', fontSize: '0.6875rem', cursor: 'pointer', fontWeight: 600 }}
                  >
                    ✓ Mark as Read
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Test nudge dispatcher form */}
        <form onSubmit={handleSendTestNudge} style={{ borderTop: '1px dashed #CBD5E1', paddingTop: '1rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0A2540', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
            SIH Evaluator Sandbox: Dispatch Custom Nudge
          </span>

          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: '0.5rem', alignItems: 'center' }}>
            <select
              className="form-select"
              value={testChannel}
              onChange={(e) => setTestChannel(e.target.value as any)}
              style={{ fontSize: '0.75rem', padding: '0.4rem' }}
            >
              <option value="WHATSAPP">WhatsApp</option>
              <option value="SMS">SMS Gateway</option>
            </select>

            <input
              type="text"
              className="form-input"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Type simulated message to citizen..."
              style={{ fontSize: '0.8125rem', padding: '0.4rem 0.6rem' }}
              required
            />

            <button
              type="submit"
              disabled={sendingNudge}
              className="btn btn-primary btn-sm"
            >
              <Send size={13} /> Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
