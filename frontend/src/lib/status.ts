/**
 * Single source of truth for mapping backend status enums to
 * human-readable labels, icons, and token colors.
 * Status ALWAYS displays: (1) color, (2) icon, and (3) words.
 */

export type ClaimStatus =
  | 'APPROVED_STP'
  | 'PENDING_HITL'
  | 'RESOLVED_APPROVE'
  | 'RESOLVED_OVERRIDE_PAYOUT'
  | 'RESOLVED_DENY'
  | 'RESOLVED_REFER_SIU'
  | 'SUBMITTED'
  | 'ANALYZING'
  | 'ERROR';

export interface StatusMeta {
  label: string;
  category: 'approved' | 'review' | 'denied' | 'siu' | 'processing';
  icon: 'check-circle' | 'alert-circle' | 'x-circle' | 'shield-alert' | 'loader';
  description: string;
}

export const STATUS_MAP: Record<ClaimStatus | string, StatusMeta> = {
  APPROVED_STP: {
    label: 'Auto-approved',
    category: 'approved',
    icon: 'check-circle',
    description: 'All governance rules passed without requiring human intervention.',
  },
  RESOLVED_APPROVE: {
    label: 'Approved by adjuster',
    category: 'approved',
    icon: 'check-circle',
    description: 'Reviewed and confirmed by a human adjuster.',
  },
  RESOLVED_OVERRIDE_PAYOUT: {
    label: 'Approved with override',
    category: 'approved',
    icon: 'check-circle',
    description: 'Adjuster modified the settlement payout amount.',
  },
  PENDING_HITL: {
    label: 'Needs review',
    category: 'review',
    icon: 'alert-circle',
    description: 'A governance rule or policy exclusion requires human sign-off.',
  },
  RESOLVED_DENY: {
    label: 'Denied',
    category: 'denied',
    icon: 'x-circle',
    description: 'Claim excluded under policy terms after adjuster confirmation.',
  },
  RESOLVED_REFER_SIU: {
    label: 'Sent to SIU',
    category: 'siu',
    icon: 'shield-alert',
    description: 'Referred to Special Investigation Unit for fraud examination.',
  },
  SUBMITTED: {
    label: 'Submitted',
    category: 'processing',
    icon: 'loader',
    description: 'First notice of loss received and queued for intake.',
  },
  ANALYZING: {
    label: 'Processing',
    category: 'processing',
    icon: 'loader',
    description: 'Multi-agent adjudication graph is currently executing.',
  },
  ERROR: {
    label: 'Processing error',
    category: 'denied',
    icon: 'x-circle',
    description: 'Workflow execution encountered an unexpected failure.',
  },
};

export function getStatusMeta(status: string | null | undefined): StatusMeta {
  if (!status) {
    return {
      label: 'Unknown',
      category: 'processing',
      icon: 'loader',
      description: 'Status unavailable.',
    };
  }
  return STATUS_MAP[status] || {
    label: status.replace(/_/g, ' ').toLowerCase(),
    category: 'processing',
    icon: 'loader',
    description: status,
  };
}

export function getSubrogationMeta(likelihood: string | null | undefined): {
  label: string;
  category: 'subro' | 'review' | 'processing';
} {
  const norm = (likelihood || '').toUpperCase();
  if (norm === 'HIGH') {
    return { label: 'High recovery', category: 'subro' };
  }
  if (norm === 'MEDIUM') {
    return { label: 'Medium recovery', category: 'review' };
  }
  return { label: 'None pursued', category: 'processing' };
}
