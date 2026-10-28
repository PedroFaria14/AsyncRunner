import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: { main: '#2457a7', dark: '#173e7d' },
    background: { default: '#f4f6fa', paper: '#ffffff' },
    text: { primary: '#18243b', secondary: '#526179' },
    divider: '#e1e7ef',
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h4: { fontWeight: 750, letterSpacing: '-0.035em', fontSize: 'clamp(1.7rem, 3vw, 2.125rem)' },
    h6: { fontWeight: 650, fontSize: '1.0625rem' },
    button: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { textTransform: 'none', minHeight: 44 } },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: { outlined: { borderColor: '#e1e7ef' } },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 650, color: '#526179', backgroundColor: '#f8fafc' },
        root: { padding: '16px 20px' },
      },
    },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
  },
});
