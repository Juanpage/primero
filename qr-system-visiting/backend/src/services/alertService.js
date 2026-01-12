import nodemailer from 'nodemailer';

const buildTransport = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: { rejectUnauthorized: false }
  });
};

export const sendAlertEmail = async ({ vesselName, feedback }) => {
  const transporter = buildTransport();
  const fromName = process.env.NOTIFY_FROM_NAME || 'Feedback Alerts';
  const toEmail = process.env.NOTIFY_TO_EMAIL;

  if (!toEmail) {
    console.warn('NOTIFY_TO_EMAIL is not configured');
    return;
  }

  const adminUrl = process.env.ADMIN_URL || '';
  const createdAt = new Date(feedback.created_at).toISOString();

  const subject = `Alert: ${vesselName} rating ${feedback.rating}`;
  const text = `New feedback alert\n\nVessel: ${vesselName}\nRating: ${feedback.rating}\nComment: ${feedback.comment || 'N/A'}\nEmail: ${feedback.email || 'N/A'}\nDate (UTC): ${createdAt}\nFeedback ID: ${feedback.id}\nAdmin: ${adminUrl}`;

  await transporter.sendMail({
    from: `"${fromName}" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject,
    text
  });
};
