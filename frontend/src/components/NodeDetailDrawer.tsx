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
        return { title: '1. Intake', description: 'Extracts invoice line items, masks PII, and verifies arithmetic.', data: agentOutputs['intake'] || { status: 'Awaiting execution' } };
      case 'policy_agent':
        return { title: '2. Policy RAG', description: 'Verifies coverage dates, limits, and deductible against policy documents.', data: agentOutputs['policy'] || { status: 'Awaiting execution' } };
      case 'fraud_agent':
        return { title: '3. Fraud Detection', description: 'Evaluates risk score (0–100) using ML model and rule checks.', data: agentOutputs['fraud'] || { status: 'Awaiting execution' } };
      case 'subrogation_agent':
        return { title: '4. Subrogation', description: 'Identifies third-party liability and recovery likelihood.', data: agentOutputs['subrogation'] || { status: 'Awaiting execution' } };
      case 'estimator_agent':
        return { title: '5. Estimator', description: 'Calculates approved payout: max(0, min(approved, limit) − deductible).', data: agentOutputs['estimator'] || { status: 'Awaiting execution' } };
      case 'adjudicator_agent':
        return { title: '6. Decision', description: 'Determines auto-approval or routes to review queue.', data: agentOutputs['adjudication'] || { status: 'Awaiting execution' } };
      default:
        return { title: 'Agent Details', description: 'Select an agent to inspect details.', data: {} };
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
          sx: { width: { xs: '100%', sm: 500 }, bgcolor: '#FFFFFF', borderLeft: '1px solid #E2E8F0', boxShadow: '-10px 0 30px rgba(0,0,0,0.06)' },
        },
      }}
    >
      {/* Header */}
      <Box sx={{ p: 3, borderBottom: '1px solid #E2E8F0', bgcolor: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <CodeIcon sx={{ color: 'primary.main', fontSize: 20 }} />
            <Typography variant="h6" sx={{ fontSize: '1rem', color: '#0F172A' }}>{info.title}</Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.78rem', lineHeight: 1.6 }}>{info.description}</Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: '#64748B' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Content */}
      <Box sx={{ p: 3, overflow: 'auto', flexGrow: 1, bgcolor: '#FFFFFF' }}>
        {/* Policy Citations */}
        {selectedNodeId === 'policy_agent' && info.data.citations && (
          <Paper sx={{ p: 2, mb: 2.5, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.5 }}>
              <MenuBookIcon sx={{ fontSize: 16, color: 'success.main' }} />
              <Typography variant="overline" sx={{ color: 'success.dark' }}>Policy Citations (RAG)</Typography>
            </Box>
            {info.data.citations.map((c: any, i: number) => (
              <Box key={i} sx={{ p: 1.5, mb: 1, bgcolor: '#FFFFFF', borderRadius: 2, border: '1px solid #E2E8F0', borderLeft: '3px solid #059669' }}>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A', mb: 0.3 }}>{c.section_ref} (Page {c.page_num})</Typography>
                <Typography sx={{ fontSize: '0.75rem', fontStyle: 'italic', color: '#475569', lineHeight: 1.5 }}>"{c.quote}"</Typography>
              </Box>
            ))}
          </Paper>
        )}

        {/* Fraud Risk Drivers */}
        {selectedNodeId === 'fraud_agent' && info.data.risk_drivers && (
          <Paper sx={{ p: 2, mb: 2.5, bgcolor: '#FEF2F2', border: '1px solid #FEE2E2' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.5 }}>
              <WarningAmberIcon sx={{ fontSize: 16, color: 'error.main' }} />
              <Typography variant="overline" sx={{ color: 'error.dark' }}>Detected Risk Factors</Typography>
            </Box>
            {info.data.risk_drivers.map((d: string, i: number) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.8 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'error.main', mt: 0.8, flexShrink: 0 }} />
                <Typography sx={{ fontSize: '0.78rem', color: '#991B1B', fontWeight: 500 }}>{d}</Typography>
              </Box>
            ))}
          </Paper>
        )}

        {/* Estimator Formula */}
        {selectedNodeId === 'estimator_agent' && info.data.formula_log && (
          <Paper sx={{ p: 2, mb: 2.5, bgcolor: '#FFFBEB', border: '1px solid #FEF3C7' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1 }}>
              <CalculateIcon sx={{ fontSize: 16, color: 'warning.main' }} />
              <Typography variant="overline" sx={{ color: 'warning.dark' }}>Deterministic Math Formula</Typography>
            </Box>
            <Box sx={{ p: 1.5, bgcolor: '#FFFFFF', borderRadius: 2, border: '1px solid #FDE68A' }}>
              <Typography sx={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#92400E', fontWeight: 600, lineHeight: 1.6 }}>{info.data.formula_log}</Typography>
            </Box>
          </Paper>
        )}

        {/* Guidewire Payload */}
        {selectedNodeId === 'adjudicator_agent' && info.data.guidewire_payload && (
          <Paper sx={{ p: 2, mb: 2.5, bgcolor: '#EEF2FF', border: '1px solid #E0E7FF' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1 }}>
              <SendIcon sx={{ fontSize: 16, color: 'info.main' }} />
              <Typography variant="overline" sx={{ color: 'info.dark' }}>Guidewire ClaimCenter Payload</Typography>
            </Box>
            <Box sx={{ p: 1.5, bgcolor: '#FFFFFF', borderRadius: 2, border: '1px solid #C7D2FE', maxHeight: 200, overflow: 'auto' }}>
              <pre style={{ margin: 0, fontSize: '0.7rem', fontFamily: 'monospace', color: '#3730A3', whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(info.data.guidewire_payload, null, 2)}
              </pre>
            </Box>
          </Paper>
        )}

        {/* Full JSON Data */}
        <Divider sx={{ my: 2 }} />
        <Typography variant="overline" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>Structured Output (JSON)</Typography>
        <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0', maxHeight: 400, overflow: 'auto' }}>
          <pre style={{ margin: 0, fontSize: '0.7rem', fontFamily: 'monospace', color: '#0369A1', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
            {JSON.stringify(info.data, null, 2)}
          </pre>
        </Box>
      </Box>
    </Drawer>
  );
};
