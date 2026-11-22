import React from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Tabs,
  Tab,
  Badge,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';

interface NavbarProps {
  activeTab: number;
  setActiveTab: (tab: number) => void;
  pendingHITLCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, pendingHITLCount }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
      <Toolbar sx={{ maxWidth: 1200, mx: 'auto', width: '100%', px: { xs: 2, md: 3 }, minHeight: 60 }}>
        {/* Brand */}
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 1.2, cursor: 'pointer', mr: 4 }}
          onClick={() => setActiveTab(0)}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldOutlinedIcon sx={{ fontSize: 18, color: '#fff' }} />
          </Box>
          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            ClaimFlow
          </Typography>
        </Box>

        {/* Navigation Tabs */}
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons="auto"
          sx={{
            minHeight: 48,
            flexGrow: 1,
            '& .MuiTab-root': {
              minHeight: 48,
              py: 0,
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#64748B',
              '&.Mui-selected': {
                color: 'primary.main',
              },
            },
          }}
        >
          <Tab icon={<AddCircleIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Claims" />
          <Tab icon={<AccountTreeOutlinedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Workflow" />
          <Tab
            icon={<FactCheckOutlinedIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label={
              <Badge badgeContent={pendingHITLCount} color="warning" sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem' } }}>
                <span>Review</span>
              </Badge>
            }
          />
          <Tab icon={<InsightsOutlinedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Analytics" />
        </Tabs>
      </Toolbar>
    </AppBar>
  );
};
