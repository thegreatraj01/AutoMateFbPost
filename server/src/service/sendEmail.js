import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY,
});

// Helper to enforce required params
const required = (param) => {
  throw new Error(`${param} is required`);
};

/**
 * Send OTP email for password reset
 * @param {string} toEmail - Recipient's email
 * @param {string} toName - Recipient's name
 * @param {string} otp - One-time password (token)
 */
const sendOtpEmail = async (
  toEmail = required('toEmail'),
  toName = required('toName'),
  otp = required('otp')
) => {
  const sentFrom = new Sender('Raj@rajballavkumar.fun', 'Rajballav Kumar');
  const recipients = [new Recipient(toEmail, toName)];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject('Reset Your Password - OTP Code')
    .setText(`Hello ${toName}, your OTP code is: ${otp}. This code is valid for 10 minutes.`)
    .setHtml(`
      <p><strong>Hello ${toName},</strong></p>
      <p>You requested to reset your password. Use the OTP code below to proceed:</p>
      <h2 style="color:#007bff">${otp}</h2>
      <p>This code is valid for 10 minutes. If you didn’t request a password reset, please ignore this email.</p>
      <br>
      <p>Regards,<br>TheGreatRaj Team</p>
    `);

  try {
    const response = await mailerSend.email.send(emailParams);
    console.log('✅ OTP email sent!', response.statusCode);
  } catch (error) {
    console.error('❌ Failed to send OTP email:', error.message || error);
  }
};

/**
 * Send confirmation email after successful password change
 * @param {string} toEmail - Recipient's email
 * @param {string} toName - Recipient's name
 */
const sendPasswordChangedEmail = async (
  toEmail = required('toEmail'),
  toName = required('toName')
) => {
  const sentFrom = new Sender('Raj@rajballavkumar.fun', 'Rajballav Kumar');
  const recipients = [new Recipient(toEmail, toName)];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject('Your Password Was Changed')
    .setText(`Hello ${toName}, your account password has been successfully changed.`)
    .setHtml(`
      <p><strong>Hello ${toName},</strong></p>
      <p>We wanted to let you know that your password was successfully changed.</p>
      <p>If this wasn't you, please contact us immediately or reset your password again.</p>
      <br>
      <p>Regards,<br>TheGreatRaj Team</p>
    `);

  try {
    const response = await mailerSend.email.send(emailParams);
    console.log('✅ Password change email sent!', response.statusCode);
  } catch (error) {
    console.error('❌ Failed to send password change email:', error.message || error);
  }
};

export {
  sendOtpEmail,
  sendPasswordChangedEmail
};
