import { Resend } from 'resend';

function getClient() {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }

  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendEmail({ to, subject, html }) {
  const client = getClient();

  if (!client) {
    console.log('EMAIL PREVIEW', { to, subject });
    return;
  }

  const from = process.env.MAIL_FROM;

  if (!from) {
    console.error('MAIL_FROM is not set');
    return;
  }

  try {
    const response = await client.emails.send({
      from,
      to,
      subject,
      html
    });

    if (response.error) {
      console.error('Resend API error:', response.error);
    }

    return response;
  } catch (err) {
    console.error('Resend sendEmail failed:', err.message);
  }
}