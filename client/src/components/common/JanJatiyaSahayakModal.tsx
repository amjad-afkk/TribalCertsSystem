import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Volume2,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle,
  Clock,
  PhoneCall,
  X,
  Languages,
  RefreshCw
} from 'lucide-react';

interface JanJatiyaSahayakModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicantName: string;
  deficiencyReason: string;
  onOpenResubmit?: () => void;
}

export const JanJatiyaSahayakModal: React.FC<JanJatiyaSahayakModalProps> = ({
  isOpen,
  onClose,
  applicantName,
  deficiencyReason,
  onOpenResubmit
}) => {
  const [selectedLang, setSelectedLang] = useState<'hi' | 'en' | 'or' | 'bn' | 'sat'>('hi');
  const [guidance, setGuidance] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
      return;
    }

    const fetchGuidance = async () => {
      setLoading(true);
      try {
        const resp = await api.getSahayakGuidance({
          deficiencyText: deficiencyReason,
          applicantName,
          language: selectedLang
        });
        if (resp && resp.success) {
          setGuidance(resp.data);
        }
      } catch (err) {
        console.error('Failed to load Sahayak guidance:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGuidance();
  }, [isOpen, selectedLang, deficiencyReason, applicantName]);

  const handleToggleSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    if (!guidance?.audioScript) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(guidance.audioScript);
    utterance.lang = selectedLang === 'hi' ? 'hi-IN' :
                     selectedLang === 'bn' ? 'bn-IN' :
                     selectedLang === 'or' ? 'or-IN' :
                     selectedLang === 'sat' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.92; // Slightly slower, clear cadence for accessibility

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(10, 37, 64, 0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        maxWidth: '680px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2), 0 10px 10px -5px rgba(0,0,0,0.08)',
        borderTop: '6px solid #E06D14' // MoTA Saffron accent
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Volume2 size={20} style={{ color: '#E06D14' }} />
              <h3 style={{ fontSize: '1.15rem', color: '#0A2540', margin: 0, fontWeight: 700 }}>
                Jan-Jatiya Sahayak • Bilingual Audio Guidance
              </h3>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>
              Explainable Deficiency Resolver for First-Generation Tribal Learners
            </p>
          </div>

          <button
            onClick={() => {
              if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
              }
              onClose();
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748B',
              padding: '0.25rem'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Language Selector */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
            backgroundColor: '#F8FAFC',
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            border: '1px solid #E2E8F0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', color: '#1E293B', fontWeight: 600 }}>
              <Languages size={16} style={{ color: '#1A4D8F' }} />
              Choose Native Dialect / Language:
              {loading && <RefreshCw size={12} className="animate-spin" style={{ color: '#64748B', marginLeft: '4px' }} />}
            </div>

            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {[
                { code: 'hi', label: 'हिंदी (Hindi)' },
                { code: 'en', label: 'English' },
                { code: 'or', label: 'ଓଡ଼ିଆ (Odia)' },
                { code: 'bn', label: 'বাংলা (Bengali)' },
                { code: 'sat', label: 'ᱥᱟᱱᱛᱟᱲᱤ (Santhali)' }
              ].map(l => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setSelectedLang(l.code as any)}
                  style={{
                    padding: '0.3rem 0.65rem',
                    fontSize: '0.75rem',
                    borderRadius: '4px',
                    border: '1px solid',
                    borderColor: selectedLang === l.code ? '#1A4D8F' : '#CBD5E1',
                    backgroundColor: selectedLang === l.code ? '#1A4D8F' : '#FFFFFF',
                    color: selectedLang === l.code ? '#FFFFFF' : '#334155',
                    cursor: 'pointer',
                    fontWeight: selectedLang === l.code ? 700 : 500
                  }}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Audio Player Bar */}
          <div style={{
            backgroundColor: isPlaying ? '#FEF3C7' : '#EFF6FF',
            border: `1px solid ${isPlaying ? '#FCD34D' : '#BFDBFE'}`,
            borderRadius: '8px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              <button
                type="button"
                onClick={handleToggleSpeech}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: '#E06D14',
                  border: 'none',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px -1px rgba(224, 109, 20, 0.4)'
                }}
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: '2px' }} />}
              </button>

              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0A2540' }}>
                  {isPlaying ? 'Playing Audio Explanation...' : 'Listen to Spoken Instructions'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  Bilingual AI Voice synthesized in {guidance?.languageName || 'selected language'}
                </div>
              </div>
            </div>

            {isPlaying && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ height: '16px', width: '3px', backgroundColor: '#E06D14', animation: 'pulse 0.8s infinite' }} />
                <span style={{ height: '24px', width: '3px', backgroundColor: '#E06D14', animation: 'pulse 0.6s infinite' }} />
                <span style={{ height: '12px', width: '3px', backgroundColor: '#E06D14', animation: 'pulse 1.1s infinite' }} />
              </div>
            )}
          </div>

          {/* Plain Language Explanation */}
          {guidance && (
            <div style={{
              backgroundColor: '#FFF5F5',
              borderLeft: '4px solid #C53030',
              padding: '1rem 1.25rem',
              borderRadius: '4px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#C53030', fontWeight: 700, fontSize: '0.8125rem', marginBottom: '0.35rem' }}>
                <AlertTriangle size={15} /> What Needs Correction:
              </div>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#742A2A', lineHeight: 1.5 }}>
                {guidance.plainLanguageExplanation}
              </p>
            </div>
          )}

          {/* Step-by-Step Fix Actions */}
          {guidance && (
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0A2540', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle size={15} style={{ color: '#16A34A' }} /> Recommended Steps to Clear This Deficiency:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {guidance.prescribedAction.map((act: string, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.5rem',
                      fontSize: '0.8125rem',
                      color: '#334155',
                      backgroundColor: '#F8FAFC',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '4px',
                      border: '1px solid #E2E8F0'
                    }}
                  >
                    <span style={{
                      backgroundColor: '#1A4D8F',
                      color: '#FFFFFF',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      flexShrink: 0
                    }}>
                      {idx + 1}
                    </span>
                    <span>{act}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Statutory Cure Window & Helpline */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            paddingTop: '0.5rem',
            borderTop: '1px solid #E2E8F0',
            fontSize: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#9A3412', fontWeight: 600 }}>
              <Clock size={14} /> Statutory Cure Window: 15 Days from notification
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1E40AF', fontWeight: 600 }}>
              <PhoneCall size={14} /> Helpline: 1800-11-7777 (MoTA Toll-Free)
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '1rem 1.5rem',
          backgroundColor: '#F8FAFC',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.75rem'
        }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
              }
              onClose();
            }}
          >
            Close Guidance
          </button>
          {onOpenResubmit && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                }
                onClose();
                onOpenResubmit();
              }}
            >
              Upload Corrected Document Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
