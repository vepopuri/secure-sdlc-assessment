import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { theme } from './theme';
import { AppDataProvider } from './context/AppDataContext';
import { AuthProvider } from './context/auth/AuthContext';
import { RequireAuth } from './routes/RequireAuth';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { HomePage } from './pages/HomePage';
import { AssessmentPage } from './pages/AssessmentPage';
import { EvidencePage } from './pages/EvidencePage';
import { ReportsPage } from './pages/ReportsPage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppDataProvider>
          <BrowserRouter>
            <Routes>
              <Route path="login" element={<LoginPage />} />
              <Route path="signup" element={<SignupPage />} />
              <Route element={<RequireAuth />}>
                <Route element={<Layout />}>
                  <Route index element={<HomePage />} />
                  {/* Scope is now part of Home; keep the old bookmark working. */}
                  <Route path="scope" element={<Navigate to="/" replace />} />
                  <Route path="assessment" element={<AssessmentPage />} />
                  <Route path="evidence" element={<EvidencePage />} />
                  <Route path="reports" element={<ReportsPage />} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </AppDataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
