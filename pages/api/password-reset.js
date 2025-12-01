// pages/api/password-reset.js
import fs from "fs";
import path from "path";
import crypto from "crypto";
import nodemailer from "nodemailer";

const usersFile = path.join(process.cwd(), "users.json");

function readUsers() {
  try {
    const raw = fs.existsSync(usersFile) ? fs.readFileSync(usersFile, "utf8") : "[]";
    return JSON.parse(raw || "[]");
  } catch (err) {
    console.error("readUsers error:", err);
    return [];
  }
}

function writeUsers(users) {
  try {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  } catch (err) {
    console.error("writeUsers error:", err);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: "MISSING_EMAIL" });

  const users = readUsers();
  const user = users.find(u => u.email === email);

  // Do not reveal whether email exists in production — return generic success.
  if (!user) {
    return res.status(200).json({ message: "If that email exists, a reset link has been sent." });
  }

  // create secure token
  const resetToken = crypto.randomBytes(24).toString("hex");
  const resetExpires = Date.now() + 1000 * 60 * 60; // 1 hour

  user.resetToken = resetToken;
  user.resetExpires = resetExpires;

  writeUsers(users);

  const frontendBase = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";
  const link = `${frontendBase}/reset-password/new?token=${resetToken}`;

  // EMAIL HTML (kept same visual style as your signup/resend)
  const html = `
    <div style="background-color:#0f1216; padding:40px 0; font-family:Arial, sans-serif;">
      <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background:#1a1d21; border-radius:8px; padding:40px;">
        <tr>
          <td align="center" style="padding-bottom:30px;">
            <img src="mylogo0.jpg" alt="Logo" width="140" style="display:block;">
          </td>
        </tr>

        <tr>
          <td style="color:white; font-size:22px; font-weight:bold; padding-bottom:20px;">
            Reset your password
          </td>
        </tr>

        <tr>
          <td style="color:#c6c8cc; font-size:16px; line-height:24px; padding-bottom:30px;">
            We received a request to reset the password for your account.
            Click the button below to reset it. This link expires in 1 hour.
          </td>
        </tr>

        <tr>
          <td align="center" style="padding-bottom:40px;">
            <a href="${link}"
              style="background:#bfc3cc; color:#000; padding:12px 22px; font-size:15px; border-radius:6px; text-decoration:none; font-weight:bold; display:inline-block;">
              Reset Password
            </a>
          </td>
        </tr>

        <tr>
          <td style="color:#c6c8cc; font-size:15px; line-height:24px; padding-bottom:30px;">
            If you did not request this, you can safely ignore this email.<br><br>
            Regards,<br>
            M&K Jewelris
          </td>
        </tr>

        <tr>
          <td style="border-top:1px solid #333; padding-top:25px; color:#8a8d92; font-size:13px; line-height:20px;">
            If the button doesn't work, copy and paste this link into your browser:<br><br>
            <a href="${link}" style="color:#9bb0ff; word-break:break-all;">${link}</a>
          </td>
        </tr>
      </table>
    </div>
  `;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    await transporter.sendMail({
      to: email,
      subject: "Reset your M&K Jewelris password",
      html
    });
  } catch (err) {
    console.error("password-reset mail error:", err);
    // still return success so flow doesn't reveal presence of email
  }

  return res.status(200).json({ message: "If that email exists, a reset link has been sent." });
}
