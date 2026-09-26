import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { theme } from './theme';
import { AppDataProvider } from './context/AppDataContext';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { ScopePage } from './pages/ScopePage';
import { AssessmentPage } from './pages/AssessmentPage';
import { EvidencePage } from './pages/EvidencePage';
import { ReportsPage } from './pages/ReportsPage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppDataProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<DashboardPage />} />
              <Route path="scope" element={<ScopePage />} />
              <Route path="assessment" element={<AssessmentPage />} />
              <Route path="evidence" element={<EvidencePage />} />
              <Route path="reports" element={<ReportsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppDataProvider>
    </ThemeProvider>
  );
}

export default App;
