import { useState } from 'react';
import { Alert, Box, Button, Paper, Typography } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/auth/useAuth';

export function CheckEmailPage() {
  const { resendVerification } = useAuth();
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email ?? null;
  const [resent, setResent] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleResend() {
    if (!email) return;
    setSending(true);
    try {
      await resendVerification(email);
      setResent(true);
    } finally {
      setSending(false);
    }
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
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          Check your email
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {email
            ? `We sent a verification link to ${email}. Click it to finish creating your account.`
            : 'We sent a verification link to your email. Click it to finish creating your account.'}
        </Typography>

        {resent && (
          <Alert severity="success" sx={{ mb: 2, textAlign: 'left' }}>
            Verification email sent again.
          </Alert>
        )}

        {email && (
          <Button variant="outlined" onClick={handleResend} disabled={sending} sx={{ mb: 2 }}>
            Resend verification email
          </Button>
        )}

        <Typography variant="body2" color="text.secondary">
          <Box component={RouterLink} to="/login" sx={{ color: '#00A3E0', fontWeight: 600 }}>
            Back to sign in
          </Box>
        </Typography>
      </Paper>
    </Box>
  );
}
