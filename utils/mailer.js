// lib/mailer.js
import nodemailer from "nodemailer";

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  // Read env vars: configure .env.local with SMTP settings
  // process.env.EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) : 587,
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  return transporter;
}

async function sendMail({ to, subject, html, text }) {
  const t = getTransporter();
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;
  const info = await t.sendMail({
    from,
    to,
    subject,
    text: text || undefined,
    html: html || undefined,
  });
  return info;
}

export { sendMail };
