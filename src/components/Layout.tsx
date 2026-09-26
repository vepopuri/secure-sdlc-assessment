import { AppBar, Box, Container, Tab, Tabs, Toolbar, Typography } from '@mui/material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/' },
  { label: 'Assessment', path: '/assessment' },
  { label: 'Evidence Library', path: '/evidence' },
  { label: 'Reports', path: '/reports' },
];

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentIndex = Math.max(
    0,
    NAV_ITEMS.findIndex((item) => item.path === location.pathname),
  );

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: '1px solid rgba(11,11,11,0.10)' }}>
        <Toolbar sx={{ gap: 2 }}>
          <ShieldOutlinedIcon color="primary" />
          <Typography variant="h6" component="div" sx={{ fontWeight: 600, mr: 3 }}>
            Secure SDLC Assessment
          </Typography>
          <Tabs
            value={currentIndex}
            onChange={(_event, index) => navigate(NAV_ITEMS[index].path)}
            sx={{ minHeight: 48 }}
          >
            {NAV_ITEMS.map((item) => (
              <Tab key={item.path} label={item.label} sx={{ minHeight: 48, textTransform: 'none' }} />
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
