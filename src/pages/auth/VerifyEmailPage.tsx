import { useEffect, useState } from 'react';
import { Box, CircularProgress, Paper, Typography } from '@mui/material';
import { Link as RouterLink, Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/auth/useAuth';
import { ApiError } from '../../services/apiClient';

export function VerifyEmailPage() {
  const { verifyEmail } = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [state, setState] = useState<'verifying' | 'done' | 'error'>(token ? 'verifying' : 'error');
  const [error, setError] = useState<string | null>(token ? null : 'This verification link is missing its token.');

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    verifyEmail(token)
      .then(() => {
        if (!cancelled) setState('done');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
        setState('error');
      });
    return () => {
      cancelled = true;
    };
  }, [token, verifyEmail]);

  if (state === 'done') {
    return <Navigate to="/" replace />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        bgcolor: '#F5F5F5',
      }}
    >
      <Paper variant="outlined" sx={{ p: 4, width: '100%', maxWidth: 420, textAlign: 'center' }}>
        {state === 'verifying' ? (
          <>
            <CircularProgress size={28} sx={{ mb: 2 }} />
            <Typography variant="body1">Verifying your email...</Typography>
          </>
        ) : (
          <>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Verification failed
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {error}
            </Typography>
            <Box component={RouterLink} to="/login" sx={{ color: '#00A3E0', fontWeight: 600 }}>
              Back to sign in
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
}
