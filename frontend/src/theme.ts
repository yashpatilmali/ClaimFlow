import { createTheme } from '@mui/material/styles';

// ClaimFlow AI — Executive Light Theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1D4ED8',      // Blue-700
      light: '#3B82F6',     // Blue-500
      dark: '#1E3A8A',      // Blue-900
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#0284C7',      // Sky-600
      light: '#38BDF8',
      dark: '#0369A1',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#059669',      // Emerald-600
      light: '#10B981',
      dark: '#047857',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#D97706',      // Amber-600
      light: '#F59E0B',
      dark: '#B45309',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#DC2626',      // Red-600
      light: '#EF4444',
      dark: '#B91C1C',
      contrastText: '#FFFFFF',
    },
    info: {
      main: '#4F46E5',      // Indigo-600
      light: '#6366F1',
      dark: '#4338CA',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F8FAFC',   // Slate-50 clean background
      paper: '#FFFFFF',     // Pure white cards & panels
    },
    text: {
      primary: '#0F172A',   // Slate-900 crisp typography
      secondary: '#475569', // Slate-600 readable subtext
      disabled: '#94A3B8',  // Slate-400
    },
    divider: '#E2E8F0',     // Slate-200 clean borders
    action: {
      hover: 'rgba(29, 78, 216, 0.04)',
      selected: 'rgba(29, 78, 216, 0.08)',
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h4: {
      fontWeight: 800,
      letterSpacing: '-0.025em',
      color: '#0F172A',
    },
    h5: {
      fontWeight: 700,
      letterSpacing: '-0.015em',
      color: '#0F172A',
    },
    h6: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
      color: '#0F172A',
    },
    subtitle1: {
      fontWeight: 600,
      fontSize: '0.95rem',
      color: '#1E293B',
    },
    subtitle2: {
      fontWeight: 600,
      fontSize: '0.8rem',
      color: '#475569',
    },
    body1: {
      fontSize: '0.875rem',
      color: '#1E293B',
    },
    body2: {
      fontSize: '0.825rem',
      color: '#475569',
    },
    caption: {
      fontSize: '0.72rem',
      color: '#64748B',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
    overline: {
      fontSize: '0.68rem',
      fontWeight: 700,
      letterSpacing: '0.08em',
      color: '#64748B',
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#F8FAFC',
          color: '#0F172A',
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            borderColor: '#BFDBFE',
            boxShadow: '0 10px 25px -5px rgba(29, 78, 216, 0.08), 0 8px 10px -6px rgba(29, 78, 216, 0.04)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '8px 18px',
          fontSize: '0.8rem',
        },
        contained: {
          boxShadow: '0 1px 3px 0 rgba(29, 78, 216, 0.2)',
          '&:hover': {
            boxShadow: '0 4px 12px 0 rgba(29, 78, 216, 0.3)',
          },
        },
        outlined: {
          borderColor: '#CBD5E1',
          color: '#1E293B',
          '&:hover': {
            borderColor: '#1D4ED8',
            backgroundColor: 'rgba(29, 78, 216, 0.04)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.7rem',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #F1F5F9',
          fontSize: '0.8rem',
          color: '#1E293B',
        },
        head: {
          fontWeight: 700,
          fontSize: '0.7rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: '#475569',
          backgroundColor: '#F8FAFC',
          borderBottom: '1px solid #E2E8F0',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#FFFFFF',
            '& fieldset': {
              borderColor: '#CBD5E1',
            },
            '&:hover fieldset': {
              borderColor: '#1D4ED8',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#1D4ED8',
            },
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.85rem',
          minHeight: '48px',
          color: '#64748B',
          '&.Mui-selected': {
            color: '#1D4ED8',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: '3px 3px 0 0',
          backgroundColor: '#1D4ED8',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
          color: '#0F172A',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#0F172A',
          color: '#F8FAFC',
          fontSize: '0.72rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
        },
      },
    },
  },
});

export default theme;
