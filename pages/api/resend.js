// pages/api/resend.js
import fs from "fs";
import path from "path";
import crypto from "crypto";
import nodemailer from "nodemailer";

const usersFile = path.join(process.cwd(), "users.json");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body || {};

  if (!email) return res.status(400).json({ error: "MISSING_EMAIL" });

  // SAFELY read users
  let users = [];
  try {
    const raw = fs.existsSync(usersFile) ? fs.readFileSync(usersFile, "utf8") : "[]";
    users = JSON.parse(raw || "[]");
  } catch (err) {
    console.error("read users error:", err);
    return res.status(500).json({ error: "READ_FAILED" });
  }

  const user = users.find(u => u.email === email);

  if (!user) {
    return res.status(400).json({ error: "USER_NOT_FOUND" });
  }

  if (user.verified) {
    return res.status(400).json({ error: "ALREADY_VERIFIED" });
  }

  // Generate NEW token
  user.verifyToken = crypto.randomBytes(20).toString("hex");
  user.verifyExpires = Date.now() + 1000 * 60 * 60; // 1 hour

  try {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  } catch (err) {
    console.error("write users error:", err);
    return res.status(500).json({ error: "SAVE_FAILED" });
  }

  // keep original link host/port
  const link = `http://localhost:3001/verify?token=${user.verifyToken}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // --- ORIGINAL HTML TEMPLATE (kept) ---
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
            Hello ${user.firstName || ""}!
          </td>
        </tr>

        <tr>
          <td style="color:#c6c8cc; font-size:16px; line-height:24px; padding-bottom:30px;">
            You requested to resend your email verification.  
            Please click the button below to verify your email address.
          </td>
        </tr>

        <tr>
          <td align="center" style="padding-bottom:40px;">
            <a href="${link}"
              style="background:#bfc3cc; color:#000; padding:12px 22px; font-size:15px; border-radius:6px; 
                     text-decoration:none; font-weight:bold; display:inline-block;">
              Verify Email Address
            </a>
          </td>
        </tr>

        <tr>
          <td style="color:#c6c8cc; font-size:15px; line-height:24px; padding-bottom:30px;">
            If you did not request this email, you can safely ignore it.<br><br>
            Regards,<br>
            M&K Jewelris
          </td>
        </tr>

        <tr>
          <td style="border-top:1px solid #333; padding-top:25px; color:#8a8d92; font-size:13px; line-height:20px;">
            If you're having trouble clicking the "Verify Email Address" button,
            right-click the button, select "Copy Link Address",
            and then paste that address into your browser:<br><br>
            <a href="${link}" style="color:#9bb0ff; word-break:break-all;">${link}</a>
          </td>
        </tr>

      </table>
    </div>
  `;

  try {
    await transporter.sendMail({
      to: email,
      subject: "Resend Email Verification — M&K Jewelris",
      html,
    });
  } catch (err) {
    console.error("resend mail error:", err);
  }

  return res.json({ message: "Verification email resent!" });
}
