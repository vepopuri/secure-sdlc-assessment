import { AppBar, Box, Container, Tab, Tabs, Toolbar, Typography } from '@mui/material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/' },
  { label: 'Scope', path: '/scope' },
  { label: 'Assessment', path: '/assessment' },
  { label: 'Evidence Library', path: '/evidence' },
  { label: 'Reports', path: '/reports' },
];

const DARK_SURFACE = '#282728';
const NEON_GREEN = '#86EB22';

function BrandMark() {
  return (
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #86BC25, #86EB22)',
        flexShrink: 0,
      }}
      aria-hidden
    />
  );
}

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentIndex = Math.max(
    0,
    NAV_ITEMS.findIndex((item) => item.path === location.pathname),
  );

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Deloitte brand signature: 4px green top bar */}
      <Box sx={{ height: 4, background: 'linear-gradient(90deg, #86BC25, #86EB22)' }} />
      {/* Dark professional header, per Deloitte's dark-theme guidance (neon green on dark) */}
      <AppBar position="static" elevation={0} sx={{ bgcolor: DARK_SURFACE }}>
        <Toolbar sx={{ gap: 2 }}>
          <BrandMark />
          <Typography variant="h6" component="div" sx={{ fontWeight: 700, mr: 3, color: '#FFFFFF' }}>
            Secure SDLC Assessment
          </Typography>
          <Tabs
            value={currentIndex}
            onChange={(_event, index) => navigate(NAV_ITEMS[index].path)}
            sx={{
              minHeight: 48,
              '& .MuiTabs-indicator': { backgroundColor: NEON_GREEN, height: 3 },
            }}
          >
            {NAV_ITEMS.map((item) => (
              <Tab
                key={item.path}
                label={item.label}
                sx={{
                  minHeight: 48,
                  textTransform: 'none',
                  color: 'rgba(255,255,255,0.75)',
                  '&.Mui-selected': { color: NEON_GREEN, fontWeight: 700 },
                }}
              />
            ))}
          </Tabs>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ flex: 1, py: 3 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
