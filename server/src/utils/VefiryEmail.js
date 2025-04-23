import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY,
});

export const sendVerificationEmail = async (toEmail, toName, verificationLink) => {
    if (!toEmail || !toName || !verificationLink) {
        throw new Error('Missing required parameters: toEmail, toName, verificationLink');
    }

  const sentFrom = new Sender('AuroMate@rajballavkumar.fun', 'Rajballav Kumar');
  const recipients = [new Recipient(toEmail, toName)];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject('Verify Your Email')
    .setHtml(`
      <p>Hi <strong>${toName}</strong>,</p>
      <p>Welcome! Please verify your email address by clicking the link below:</p>
      <p><a href="${verificationLink}" target="_blank" style="color: #007bff;">Verify Email</a></p>
      <p>This link is valid for 24 hours.</p>
      <br>
      <p>Thanks,<br>TheGreatRaj Team</p>
    `);

  try {
    const response = await mailerSend.email.send(emailParams);
    console.log('✅ Verification email sent!', response.statusCode);
  } catch (error) {
    console.error('❌ Failed to send verification email:', error.message || error);
  }
};
