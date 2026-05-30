require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Bank Ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

async function sendRegistrationEmail(userEmail, name) {
  const subject = "Welcome to Bank Ledger"
  const text = `Hello ${name}, \n\n Thank you for registering with Bank Ledger. We're excited to have you on board! \n\n Best regards, \n The Bank Ledger Team`
  const html = `<p>Hello ${name},</p><p>Thank you for registering with Bank Ledger. We're excited to have you on board!</p><p>Best regards,<br>The Bank Ledger Team</p>`
  await sendEmail(userEmail, subject, text, html)
}

async function sendTransactionEmail(userEmail, name, amount, toAccount) {
  const subject = "Transaction Alert from Bank Ledger"
  const text = `Hello ${name}, \n\n A transaction of $${amount} has been made to account ${toAccount}. If you did not authorize this transaction, please contact our support team immediately. \n\n Best regards, \n The Bank Ledger Team`
  const html = `<p>Hello ${name},</p><p>A transaction of $${amount} has been made to account ${toAccount}. If you did not authorize this transaction, please contact our support team immediately.</p><p>Best regards,<br>The Bank Ledger Team</p>`
  await sendEmail(userEmail, subject, text, html)
}

async function sendTransactionFailureEmail(userEmail, name, amount, toAccount) {
  const subject = "Transaction Failure Alert from Bank Ledger"
  const text = `Hello ${name}, \n\n We attempted to process a transaction of $${amount} to account ${toAccount}, but it failed. Please check your account balance and try again. If you need assistance, please contact our support team. \n\n Best regards, \n The Bank Ledger Team`
  const html = `<p>Hello ${name},</p><p>We attempted to process a transaction of $${amount} to account ${toAccount}, but it failed. Please check your account balance and try again. If you need assistance, please contact our support team.</p><p>Best regards,<br>The Bank Ledger Team</p>`
  await sendEmail(userEmail, subject, text, html)
}

module.exports = {
  sendRegistrationEmail,
  sendTransactionEmail,
  sendTransactionFailureEmail
};