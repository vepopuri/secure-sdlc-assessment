import { createTheme } from '@mui/material/styles';

// Light-only theme (v1 ships light-only per spec — no unvalidated automatic dark flip).
// Colors and type follow the Deloitte "Together makes progress" digital brand guidance.
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#86BC25', dark: '#75A521', contrastText: '#FFFFFF' },
    secondary: { main: '#00A3E0' },
    background: { default: '#F5F5F5', paper: '#FFFFFF' },
    text: { primary: '#282728', secondary: '#555555' },
    success: { main: '#86BC25' },
    info: { main: '#00A3E0' },
    warning: { main: '#E8A317' },
    error: { main: '#DA291C' },
    divider: '#E6E6E6',
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: '"Open Sans", system-ui, -apple-system, "Segoe UI", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 700, borderRadius: 6 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
  },
});
