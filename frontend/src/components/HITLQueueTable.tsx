import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  AlertTitle,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { HITLQueueItem } from '../types/claim';

interface HITLQueueTableProps {
  queue: HITLQueueItem[];
  onSubmitDecision: (claimNumber: string, decision: string, auditNote: string, overrideAmount?: number) => Promise<void>;
  isLoading: boolean;
}

const PRESET_NOTES: Record<string, string> = {
  APPROVE: 'Reviewed mechanic estimate and coverage terms. Approved settlement payout per policy terms.',
  DENY: 'Confirmed policy exclusion under Section 3.B. Denial affirmed after reviewing cited clauses.',
  REFER_SIU: 'Referred to Special Investigation Unit (SIU) due to high fraud probability score and narrative/invoice mismatch.',
  OVERRIDE_PAYOUT: 'Adjusted payout amount per senior adjuster re-inspection of damage.',
};

export const HITLQueueTable: React.FC<HITLQueueTableProps> = ({ queue, onSubmitDecision, isLoading }) => {
  const [selectedClaim, setSelectedClaim] = useState<HITLQueueItem | null>(null);
  const [decision, setDecision] = useState<string>('APPROVE');
  const [auditNote, setAuditNote] = useState('');
  const [overrideAmount, setOverrideAmount] = useState<number | ''>('');

  const handleOpen = (claim: HITLQueueItem) => {
    setSelectedClaim(claim);
    // Smart default
    if (claim.pause_reasons?.some(r => r.toLowerCase().includes('exclusion') || r.toLowerCase().includes('racing'))) {
      setDecision('DENY');
      setAuditNote(PRESET_NOTES['DENY']);
    } else if (claim.fraud_risk_score >= 60) {
      setDecision('REFER_SIU');
      setAuditNote(PRESET_NOTES['REFER_SIU']);
    } else {
      setDecision('APPROVE');
      setAuditNote(PRESET_NOTES['APPROVE']);
    }
    setOverrideAmount(claim.calculated_net_payout);
  };

  const handleDecisionChange = (_: any, newDec: string | null) => {
    if (newDec) {
      setDecision(newDec);
      setAuditNote(PRESET_NOTES[newDec] || '');
    }
  };

  const handleConfirm = async () => {
    if (!selectedClaim || !auditNote.trim()) return;
    await onSubmitDecision(
      selectedClaim.claim_number,
      decision,
      auditNote,
      decision === 'OVERRIDE_PAYOUT' && overrideAmount !== '' ? Number(overrideAmount) : undefined
    );
    setSelectedClaim(null);
  };

  const getFraudChipColor = (score: number): 'success' | 'warning' | 'error' => {
    if (score >= 60) return 'error';
    if (score >= 30) return 'warning';
    return 'success';
  };

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto', py: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GroupsIcon sx={{ color: 'warning.main' }} />
            Review Queue
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
            Claims requiring manual adjuster review and sign-off.
          </Typography>
        </Box>
        <Chip label={`${queue.length} Pending`} color="warning" variant="outlined" sx={{ fontWeight: 700, mt: { xs: 1, sm: 0 } }} />
      </Box>

      {/* Table or Empty State */}
      {queue.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <CheckCircleIcon sx={{ fontSize: 56, color: 'success.main', mb: 2 }} />
          <Typography variant="h6">No Pending Claims</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            All claims are processed. Run a flagged test claim to view it here.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Claim #</TableCell>
                <TableCell>Policy</TableCell>
                <TableCell>Incident</TableCell>
                <TableCell align="right">Claimed / Net</TableCell>
                <TableCell align="center">Fraud</TableCell>
                <TableCell align="center">Subrogation</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {queue.map((item) => (
                <TableRow key={item.claim_number} hover sx={{ '&:hover': { bgcolor: 'rgba(29,78,216,0.03)' } }}>
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main', fontSize: '0.78rem' }}>
                    {item.claim_number}
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{item.policy_number}</TableCell>
                  <TableCell sx={{ fontSize: '0.78rem' }}>{item.incident_date}</TableCell>
                  <TableCell align="right">
                    <Typography sx={{ fontSize: '0.72rem', color: 'text.disabled', textDecoration: 'line-through' }}>
                      ${item.claimed_amount?.toLocaleString()}
                    </Typography>
                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: 'success.main', fontFamily: 'monospace' }}>
                      ${item.calculated_net_payout?.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={`${item.fraud_risk_score}/100`} size="small" color={getFraudChipColor(item.fraud_risk_score)} variant="outlined" sx={{ fontSize: '0.65rem', fontWeight: 700 }} />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={item.subrogation_likelihood}
                      size="small"
                      variant={item.subrogation_likelihood === 'HIGH' ? 'filled' : 'outlined'}
                      color={item.subrogation_likelihood === 'HIGH' ? 'info' : 'default'}
                      sx={{ fontSize: '0.65rem', fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 200, fontSize: '0.72rem', color: 'warning.main', fontWeight: 500 }}>
                    <Tooltip title={item.pause_reasons?.join(' | ') || ''}>
                      <Typography noWrap sx={{ fontSize: 'inherit', color: 'inherit' }}>
                        {item.pause_reasons?.[0] || 'Governance rule triggered'}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="right">
                    <Button variant="contained" size="small" onClick={() => handleOpen(item)} sx={{ fontSize: '0.72rem' }}>
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Decision Dialog */}
      <Dialog open={!!selectedClaim} onClose={() => setSelectedClaim(null)} maxWidth="md" fullWidth>
        {selectedClaim && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6" sx={{ fontSize: '1.05rem', color: '#0F172A' }}>Review Claim</Typography>
                  <Chip label={selectedClaim.claim_number} size="small" color="primary" variant="outlined" sx={{ fontFamily: 'monospace', fontSize: '0.68rem', fontWeight: 700 }} />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Policy: {selectedClaim.policy_number} · Loss Date: {selectedClaim.incident_date}
                </Typography>
              </Box>
              <IconButton onClick={() => setSelectedClaim(null)} size="small" sx={{ color: 'text.secondary' }}><CloseIcon /></IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ bgcolor: '#FFFFFF' }}>
              {/* Financial Summary */}
              <Grid container spacing={2} sx={{ mb: 2.5 }}>
                {[
                  { label: 'Claimed', value: `$${selectedClaim.claimed_amount?.toLocaleString()}`, color: 'text.primary' },
                  { label: 'Disallowed', value: `-$${selectedClaim.disallowed_amount?.toLocaleString()}`, color: 'error.main' },
                  { label: 'Deductible', value: `-$${selectedClaim.deductible?.toLocaleString()}`, color: 'text.secondary' },
                  { label: 'Net Payout', value: `$${selectedClaim.calculated_net_payout?.toLocaleString()}`, color: 'success.main' },
                ].map((m) => (
                  <Grid size={{ xs: 6, sm: 3 }} key={m.label}>
                    <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                      <Typography variant="overline">{m.label}</Typography>
                      <Typography sx={{ fontWeight: 800, fontFamily: 'monospace', color: m.color, fontSize: '1rem' }}>{m.value}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              {/* Pause Reasons */}
              <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ mb: 2 }}>
                <AlertTitle sx={{ fontSize: '0.82rem' }}>Why This Claim Was Paused</AlertTitle>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {selectedClaim.pause_reasons.map((r, i) => (
                    <li key={i}><Typography variant="body2" sx={{ fontSize: '0.78rem' }}>{r}</Typography></li>
                  ))}
                </ul>
              </Alert>

              {/* Citations */}
              {selectedClaim.citations?.length > 0 && (
                <Paper sx={{ p: 2, mb: 2.5, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1 }}>
                    <MenuBookIcon sx={{ fontSize: 16, color: 'success.main' }} />
                    <Typography variant="overline" sx={{ color: 'success.dark' }}>Policy Citations</Typography>
                  </Box>
                  {selectedClaim.citations.map((c, i) => (
                    <Box key={i} sx={{ pl: 1.5, mb: 1, borderLeft: '3px solid #059669' }}>
                      <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A' }}>{c.section_ref}</Typography>
                      <Typography sx={{ fontSize: '0.75rem', fontStyle: 'italic', color: '#475569' }}>"{c.quote}"</Typography>
                    </Box>
                  ))}
                </Paper>
              )}

              <Divider sx={{ my: 2 }} />

              {/* Decision Selector */}
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.primary' }}>Adjuster Decision</Typography>
              <ToggleButtonGroup value={decision} exclusive onChange={handleDecisionChange} fullWidth size="small" sx={{ mb: 2 }}>
                <ToggleButton value="APPROVE" sx={{ fontSize: '0.72rem', fontWeight: 700 }} color="success">
                  Approve (${selectedClaim.calculated_net_payout?.toLocaleString()})
                </ToggleButton>
                <ToggleButton value="OVERRIDE_PAYOUT" sx={{ fontSize: '0.72rem', fontWeight: 700 }} color="primary">
                  Override Payout
                </ToggleButton>
                <ToggleButton value="DENY" sx={{ fontSize: '0.72rem', fontWeight: 700 }} color="warning">
                  Deny Claim
                </ToggleButton>
                <ToggleButton value="REFER_SIU" sx={{ fontSize: '0.72rem', fontWeight: 700 }} color="error">
                  Refer to SIU
                </ToggleButton>
              </ToggleButtonGroup>

              {decision === 'OVERRIDE_PAYOUT' && (
                <TextField
                  fullWidth size="small" label="Override Payout Amount ($)" type="number"
                  value={overrideAmount} onChange={(e) => setOverrideAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  slotProps={{
                    input: { sx: { fontFamily: 'monospace' } },
                  }}
                  sx={{ mb: 2 }}
                />
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>Justification Note (Required)</Typography>
                <Button size="small" startIcon={<AutoFixHighIcon sx={{ fontSize: 14 }} />} onClick={() => setAuditNote(PRESET_NOTES[decision] || '')} sx={{ fontSize: '0.65rem' }}>
                  Auto-fill
                </Button>
              </Box>
              <TextField
                fullWidth multiline rows={3} value={auditNote} onChange={(e) => setAuditNote(e.target.value)}
                placeholder="Record formal adjudication rationale…"
                slotProps={{
                  input: { sx: { fontSize: '0.82rem' } },
                }}
              />
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2, bgcolor: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
              <Button onClick={() => setSelectedClaim(null)} sx={{ color: 'text.secondary' }}>Cancel</Button>
              <Button variant="contained" onClick={handleConfirm} disabled={isLoading || !auditNote.trim()} sx={{ px: 3 }}>
                {isLoading ? 'Resuming…' : 'Sign-Off & Resume Workflow'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};
