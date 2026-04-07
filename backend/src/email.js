import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_ADDRESS = 'designfast@viola.engineering';

export function isEmailVerificationEnabled() {
  return !!resend;
}

export function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendVerificationEmail(to, code) {
  if (!resend) {
    console.warn('Email verification disabled: RESEND_API_KEY not configured');
    return false;
  }

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: 'Verify your DesignFast account',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 24px; color: #111;">Verify your email</h1>
        <p style="font-size: 16px; color: #444; margin-bottom: 24px;">
          Enter this code to verify your DesignFast account:
        </p>
        <div style="background: #f5f5f5; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <span style="font-family: monospace; font-size: 32px; font-weight: 700; letter-spacing: 4px; color: #111;">${code}</span>
        </div>
        <p style="font-size: 14px; color: #666;">
          This code expires in 10 minutes. If you didn't create an account, you can ignore this email.
        </p>
      </div>
    `,
  });

  if (error) {
    console.error('Failed to send verification email:', error);
    return false;
  }

  return true;
}
