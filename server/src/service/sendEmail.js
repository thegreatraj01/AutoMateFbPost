import nodemailer from 'nodemailer';

// Create a transporter object using SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  }
});

const sendEmail = async (to, subject = "Otp Verification Email", otp, text = 'Otp for verify your email') => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject,
    // text,
    html: `<p>
    Your OTP is: <strong>${otp}</strong> verify it within 10 min 
          </p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  } finally {
    transporter.close();
  }
}

export default sendEmail;

