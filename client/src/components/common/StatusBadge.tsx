import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, ArrowUpRight } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'SELECTED':
    case 'DISBURSED':
    case 'CONFIRMED':
    case 'APPROVED':
    case 'OCR_VERIFIED':
    case 'ACCEPTED':
      return (
        <span className="badge badge-approved">
          <CheckCircle2 size={12} /> {status.replace('_', ' ')}
        </span>
      );

    case 'DEFICIENCY_FLAGGED':
    case 'RESUBMISSION_PENDING':
    case 'REJECTED':
      return (
        <span className="badge badge-rejected">
          <AlertTriangle size={12} /> {status.replace('_', ' ')}
        </span>
      );

    case 'UNDER_SCRUTINY':
    case 'RESUBMITTED':
    case 'SUBMITTED':
    case 'PENDING_OCR':
    case 'INO_SCRUTINY':
    case 'STATE_SCRUTINY':
    case 'COMMITTEE_REVIEW':
      return (
        <span className="badge badge-pending">
          <Clock size={12} /> {status.replace('_', ' ')}
        </span>
      );

    case 'SHORTLISTED':
    case 'SELECTION_FINALIZED':
      return (
        <span className="badge badge-info">
          <ArrowUpRight size={12} /> {status.replace('_', ' ')}
        </span>
      );

    default:
      return (
        <span className="badge" style={{ backgroundColor: '#EDF2F7', color: '#4A5568' }}>
          {status}
        </span>
      );
  }
};
