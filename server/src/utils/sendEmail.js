// Email helper that sends real SMTP mail when configured and logs previews during local development.
import nodemailer from 'nodemailer';

// Build an SMTP transport only when mail credentials are configured.
function buildTransport() {
  if (!process.env.SMTP_HOST) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

// Send a transactional email or log a local preview when SMTP is unavailable.
export async function sendEmail({ to, subject, html }) {
  const transport = buildTransport();

  if (!transport) {
    console.log('EMAIL PREVIEW');
    console.log({ to, subject, html });
    return;
  }

  await transport.sendMail({
    from: process.env.MAIL_FROM || 'noreply@garnish-demo.com',
    to,
    subject,
    html
  });
}
