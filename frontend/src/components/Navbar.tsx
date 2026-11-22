import React from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Tabs,
  Tab,
  Badge,
  Chip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import ScienceIcon from '@mui/icons-material/Science';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import GroupsIcon from '@mui/icons-material/Groups';
import BarChartIcon from '@mui/icons-material/BarChart';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

interface NavbarProps {
  activeTab: number;
  setActiveTab: (tab: number) => void;
  pendingHITLCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, pendingHITLCount }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar sx={{ maxWidth: 1280, mx: 'auto', width: '100%', px: { xs: 2, md: 3 }, gap: 2 }}>
        {/* Brand */}
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', flexShrink: 0 }}
          onClick={() => setActiveTab(0)}
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #2563EB 0%, #6366F1 50%, #06B6D4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
            }}
          >
            <SecurityIcon sx={{ fontSize: 22, color: '#fff' }} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" sx={{ fontSize: '1.05rem', fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
                ClaimFlow{' '}
                <Box component="span" sx={{ color: 'primary.main' }}>AI</Box>
              </Typography>
              <Chip
                label="VALUEMOMENTUM"
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.55rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  bgcolor: 'rgba(29,78,216,0.08)',
                  color: 'primary.dark',
                  border: '1px solid rgba(29,78,216,0.2)',
                }}
              />
            </Box>
            {!isMobile && (
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem' }}>
                Multi-Agent P&C Claims Orchestrator
              </Typography>
            )}
          </Box>
        </Box>

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Navigation Tabs */}
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons="auto"
          sx={{
            minHeight: 44,
            '& .MuiTab-root': {
              minHeight: 44,
              py: 0,
              fontSize: '0.78rem',
            },
          }}
        >
          <Tab icon={<ScienceIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Test Lab" />
          <Tab icon={<AccountTreeIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Agent Pipeline" />
          <Tab
            icon={<GroupsIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label={
              <Badge badgeContent={pendingHITLCount} color="warning" sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', fontWeight: 700 } }}>
                <span>Adjuster Queue</span>
              </Badge>
            }
          />
          <Tab icon={<BarChartIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Operations" />
        </Tabs>

        {/* Engine Status */}
        {!isMobile && (
          <Chip
            icon={<FiberManualRecordIcon sx={{ fontSize: 10, color: '#10B981 !important', animation: 'pulse 2s ease-in-out infinite' }} />}
            label="Engine Active"
            variant="outlined"
            size="small"
            sx={{
              borderColor: '#E2E8F0',
              bgcolor: '#F8FAFC',
              color: 'text.secondary',
              fontSize: '0.7rem',
              height: 28,
              ml: 1,
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.4 },
              },
            }}
          />
        )}
      </Toolbar>
    </AppBar>
  );
};
