import { createTheme, alpha } from '@mui/material/styles';

// ClaimFlow AI — Professional Dark Theme for ValueMomentum
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2563EB',      // Blue-600
      light: '#3B82F6',     // Blue-500
      dark: '#1D4ED8',      // Blue-700
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#06B6D4',      // Cyan-500
      light: '#22D3EE',
      dark: '#0891B2',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
    },
    warning: {
      main: '#F59E0B',
      light: '#FBBF24',
      dark: '#D97706',
    },
    error: {
      main: '#EF4444',
      light: '#F87171',
      dark: '#DC2626',
    },
    info: {
      main: '#6366F1',
      light: '#818CF8',
      dark: '#4F46E5',
    },
    background: {
      default: '#0B1120',
      paper: '#111827',
    },
    text: {
      primary: '#F1F5F9',
      secondary: '#94A3B8',
      disabled: '#475569',
    },
    divider: '#1E293B',
    action: {
      hover: 'rgba(37, 99, 235, 0.08)',
      selected: 'rgba(37, 99, 235, 0.16)',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
    h4: {
      fontWeight: 800,
      letterSpacing: '-0.02em',
    },
    h5: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    subtitle1: {
      fontWeight: 600,
      fontSize: '0.95rem',
    },
    subtitle2: {
      fontWeight: 600,
      fontSize: '0.8rem',
      color: '#94A3B8',
    },
    body2: {
      fontSize: '0.825rem',
      color: '#CBD5E1',
    },
    caption: {
      fontSize: '0.7rem',
      color: '#64748B',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
    overline: {
      fontSize: '0.65rem',
      fontWeight: 700,
      letterSpacing: '0.08em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0B1120',
          '&::-webkit-scrollbar': { width: '6px', height: '6px' },
          '&::-webkit-scrollbar-track': { background: '#0B1120' },
          '&::-webkit-scrollbar-thumb': { background: '#334155', borderRadius: '3px' },
          '&::-webkit-scrollbar-thumb:hover': { background: '#475569' },
        },
        '*::-webkit-scrollbar': { width: '6px', height: '6px' },
        '*::-webkit-scrollbar-track': { background: '#111827' },
        '*::-webkit-scrollbar-thumb': { background: '#334155', borderRadius: '3px' },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid #1E293B',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid #1E293B',
          '&:hover': {
            borderColor: '#334155',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '8px 20px',
          fontSize: '0.8rem',
        },
        contained: {
          boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.25)',
          '&:hover': {
            boxShadow: '0 6px 20px 0 rgba(37, 99, 235, 0.35)',
          },
        },
        outlined: {
          borderColor: '#334155',
          '&:hover': {
            borderColor: '#2563EB',
            backgroundColor: 'rgba(37, 99, 235, 0.08)',
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
          borderBottom: '1px solid #1E293B',
          fontSize: '0.8rem',
        },
        head: {
          fontWeight: 700,
          fontSize: '0.7rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: '#64748B',
          backgroundColor: '#0F172A',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#111827',
          border: '1px solid #1E293B',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#334155',
            },
            '&:hover fieldset': {
              borderColor: '#2563EB',
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
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: '3px 3px 0 0',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#0F172A',
          borderBottom: '1px solid #1E293B',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#1E293B',
          color: '#E2E8F0',
          fontSize: '0.75rem',
          border: '1px solid #334155',
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
