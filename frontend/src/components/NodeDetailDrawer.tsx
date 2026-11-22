import React from 'react';
import {
  Box,
  Drawer,
  Typography,
  IconButton,
  Chip,
  Divider,
  Paper,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CodeIcon from '@mui/icons-material/Code';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CalculateIcon from '@mui/icons-material/Calculate';
import SendIcon from '@mui/icons-material/Send';

interface NodeDetailDrawerProps {
  selectedNodeId: string | null;
  agentOutputs: Record<string, any>;
  onClose: () => void;
}

export const NodeDetailDrawer: React.FC<NodeDetailDrawerProps> = ({ selectedNodeId, agentOutputs, onClose }) => {
  if (!selectedNodeId) return null;

  const getAgentData = () => {
    switch (selectedNodeId) {
      case 'intake_agent':
        return { title: '1. Intake Agent', description: 'Reads mechanic invoice and claimant narrative, masks PII (SSN, phone, email), and verifies invoice line-item math.', data: agentOutputs['intake'] || { status: 'Awaiting execution' } };
      case 'policy_agent':
        return { title: '2. Policy Agent (RAG)', description: 'Validates active policy dates, searches policy clauses for coverage and exclusions, and returns verbatim citations.', data: agentOutputs['policy'] || { status: 'Awaiting execution' } };
      case 'fraud_agent':
        return { title: '3. Fraud Agent (ML)', description: 'Uses machine learning and business rules to evaluate risk factors and computes a 0–100 fraud probability score.', data: agentOutputs['fraud'] || { status: 'Awaiting execution' } };
      case 'subrogation_agent':
        return { title: '4. Subrogation Agent', description: 'Identifies at-fault third parties from police citations and narrative cues, and drafts a recovery referral brief.', data: agentOutputs['subrogation'] || { status: 'Awaiting execution' } };
      case 'estimator_agent':
        return { title: '5. Estimator Agent (Math)', description: 'Calculates exact payout using strict Python math: max(0, min(approved, limit) − deductible). No LLM arithmetic.', data: agentOutputs['estimator'] || { status: 'Awaiting execution' } };
      case 'adjudicator_agent':
        return { title: '6. Decision Agent', description: 'Applies governance rules to auto-approve or pause the claim for human adjuster review in durable checkpoint state.', data: agentOutputs['adjudication'] || { status: 'Awaiting execution' } };
      default:
        return { title: 'Agent Inspector', description: 'Select an agent node to inspect.', data: {} };
    }
  };

  const info = getAgentData();

  return (
    <Drawer
      anchor="right"
      open={!!selectedNodeId}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: { width: { xs: '100%', sm: 480 }, bgcolor: '#0F172A', borderLeft: '1px solid #1E293B' },
        },
      }}
    >
      {/* Header */}
      <Box sx={{ p: 3, borderBottom: '1px solid #1E293B', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <CodeIcon sx={{ color: 'secondary.main', fontSize: 20 }} />
            <Typography variant="h6" sx={{ fontSize: '1rem' }}>{info.title}</Typography>
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.78rem', lineHeight: 1.6 }}>{info.description}</Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Content */}
      <Box sx={{ p: 3, overflow: 'auto', flexGrow: 1 }}>
        {/* Policy Citations */}
        {selectedNodeId === 'policy_agent' && info.data.citations && (
          <Paper sx={{ p: 2, mb: 2.5, bgcolor: '#111827' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.5 }}>
              <MenuBookIcon sx={{ fontSize: 16, color: 'success.main' }} />
              <Typography variant="overline" sx={{ color: 'success.main' }}>Policy Citations (RAG)</Typography>
            </Box>
            {info.data.citations.map((c: any, i: number) => (
              <Box key={i} sx={{ p: 1.5, mb: 1, bgcolor: '#0B1120', borderRadius: 2, borderLeft: '3px solid #10B981' }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#E2E8F0', mb: 0.3 }}>{c.section_ref} (Page {c.page_num})</Typography>
                <Typography sx={{ fontSize: '0.72rem', fontStyle: 'italic', color: '#94A3B8', lineHeight: 1.5 }}>"{c.quote}"</Typography>
              </Box>
            ))}
          </Paper>
        )}

        {/* Fraud Risk Drivers */}
        {selectedNodeId === 'fraud_agent' && info.data.risk_drivers && (
          <Paper sx={{ p: 2, mb: 2.5, bgcolor: '#111827' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.5 }}>
              <WarningAmberIcon sx={{ fontSize: 16, color: 'error.main' }} />
              <Typography variant="overline" sx={{ color: 'error.main' }}>Detected Risk Factors</Typography>
            </Box>
            {info.data.risk_drivers.map((d: string, i: number) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.8 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'error.main', mt: 0.8, flexShrink: 0 }} />
                <Typography sx={{ fontSize: '0.75rem', color: '#CBD5E1' }}>{d}</Typography>
              </Box>
            ))}
          </Paper>
        )}

        {/* Estimator Formula */}
        {selectedNodeId === 'estimator_agent' && info.data.formula_log && (
          <Paper sx={{ p: 2, mb: 2.5, bgcolor: '#111827' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1 }}>
              <CalculateIcon sx={{ fontSize: 16, color: 'warning.main' }} />
              <Typography variant="overline" sx={{ color: 'warning.main' }}>Deterministic Math Formula</Typography>
            </Box>
            <Box sx={{ p: 1.5, bgcolor: '#0B1120', borderRadius: 2, border: '1px solid #1E293B' }}>
              <Typography sx={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#FBBF24', lineHeight: 1.6 }}>{info.data.formula_log}</Typography>
            </Box>
          </Paper>
        )}

        {/* Guidewire Payload */}
        {selectedNodeId === 'adjudicator_agent' && info.data.guidewire_payload && (
          <Paper sx={{ p: 2, mb: 2.5, bgcolor: '#111827' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1 }}>
              <SendIcon sx={{ fontSize: 16, color: 'info.main' }} />
              <Typography variant="overline" sx={{ color: 'info.main' }}>Guidewire ClaimCenter Payload</Typography>
            </Box>
            <Box sx={{ p: 1.5, bgcolor: '#0B1120', borderRadius: 2, border: '1px solid #1E293B', maxHeight: 200, overflow: 'auto' }}>
              <pre style={{ margin: 0, fontSize: '0.68rem', fontFamily: 'monospace', color: '#C4B5FD', whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(info.data.guidewire_payload, null, 2)}
              </pre>
            </Box>
          </Paper>
        )}

        {/* Full JSON Data */}
        <Divider sx={{ my: 2 }} />
        <Typography variant="overline" sx={{ color: 'text.disabled', mb: 1, display: 'block' }}>Structured Output (JSON)</Typography>
        <Box sx={{ p: 2, bgcolor: '#0B1120', borderRadius: 2, border: '1px solid #1E293B', maxHeight: 400, overflow: 'auto' }}>
          <pre style={{ margin: 0, fontSize: '0.68rem', fontFamily: 'monospace', color: '#22D3EE', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
            {JSON.stringify(info.data, null, 2)}
          </pre>
        </Box>
      </Box>
    </Drawer>
  );
};
