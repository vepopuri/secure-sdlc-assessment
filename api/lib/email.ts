import { Resend } from 'resend';

function appBaseUrl(): string {
  if (process.env.APP_BASE_URL) return process.env.APP_BASE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:5173';
}

export interface SendVerificationResult {
  sent: boolean;
  verifyUrl: string;
}

export async function sendVerificationEmail(email: string, token: string): Promise<SendVerificationResult> {
  const verifyUrl = `${appBaseUrl()}/verify-email?token=${token}`;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Mirrors api/generate-report.ts's pattern: don't crash the request just
    // because an optional-at-first integration isn't configured yet. The
    // caller surfaces `verifyUrl` directly in the API response in this case,
    // so signup/resend still work end-to-end without Resend configured.
    console.warn('RESEND_API_KEY is not set; skipping verification email send.');
    return { sent: false, verifyUrl };
  }

  const resend = new Resend(apiKey);
  const from = process.env.EMAIL_FROM ?? 'Secure SDLC Assessment <onboarding@resend.dev>';

  const { error } = await resend.emails.send({
    from,
    to: email,
    subject: 'Verify your email to finish creating your account',
    html: `
      <p>Welcome to Secure SDLC Assessment.</p>
      <p>Click the link below to verify your email and finish creating your account. This link expires in 24 hours.</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
    `,
  });

  if (error) {
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
  return { sent: true, verifyUrl };
}
