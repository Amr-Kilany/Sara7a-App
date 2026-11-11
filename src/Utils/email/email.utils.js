import nodemailer from "nodemailer";
import { USER_EMAIL, USER_PASS } from "./../../../config/config.service.js";

export async function sendEmail({ to, subject, text, html, cc, bcc, attachments }) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: USER_EMAIL,
      pass: USER_PASS,
    },
  });

  const mailOptions = {
    from: `Route Academy <${USER_EMAIL}>`,
    to,
    subject,
    text,
    html,
    cc,
    bcc,
    attachments,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

export const emailSubjects = {
  WELCOME: "Welcome to Route Academy",
  PASSWORD_RESET: "Password Reset Request",
  ACCOUNT_VERIFICATION: "Account Verification",
  CONFIRMATION: "Confirmation Email",
  CONTACT_US: "Contact Us",
};
