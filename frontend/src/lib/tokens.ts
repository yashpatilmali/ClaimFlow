/**
 * ClaimFlow Design System Tokens
 * Used in Tailwind CSS and programmatically in visual components (e.g. Recharts).
 */

export const colors = {
  ink: '#18304F',
  paper: '#F4F6F8',
  surface: '#FFFFFF',
  rule: '#D5DBE3',
  fieldBorder: '#7D8A9C',
  muted: '#5B6B82',
  highlighter: '#FFE58A',
  
  status: {
    approved: {
      text: '#1E7B4F',
      bg: '#E8F5E9',
    },
    review: {
      text: '#9A5B00',
      bg: '#FEF3C7',
    },
    denied: {
      text: '#B42318',
      bg: '#FEE4E2',
    },
    siu: {
      text: '#5B3FA0',
      bg: '#F4EBFF',
    },
    subro: {
      text: '#0E7C7B',
      bg: '#E0F2F1',
    },
    processing: {
      text: '#2457C5',
      bg: '#EFF4FE',
    },
  },
} as const;

export const chartColors = [
  '#2457C5', // Primary processing blue
  '#1E7B4F', // Approved green
  '#9A5B00', // Review amber
  '#0E7C7B', // Subro teal
  '#5B3FA0', // SIU purple
  '#B42318', // Denied red
] as const;
