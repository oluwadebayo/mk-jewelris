// pages/api/signup.js
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";

const usersFile = path.join(process.cwd(), "users.json");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { firstName = "", lastName = "", company = "", email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "MISSING_FIELDS" });
  }

  // read users safely
  let users = [];
  try {
    const raw = fs.existsSync(usersFile) ? fs.readFileSync(usersFile, "utf8") : "[]";
    users = JSON.parse(raw || "[]");
  } catch (err) {
    console.error("read users error:", err);
    users = [];
  }

  const existing = users.find(u => u.email === email);

  if (existing) {
    if (!existing.verified) {
      return res.status(400).json({ error: "UNVERIFIED_ACCOUNT" });
    }
    return res.status(400).json({ error: "EMAIL_TAKEN" });
  }

  // hash password (you requested hashed passwords)
  const hashedPassword = bcrypt.hashSync(password, 10);

  const verifyToken = crypto.randomBytes(20).toString("hex");
  const verifyExpires = Date.now() + 1000 * 60 * 60; // 1 hour

  const newUser = {
    id: String(Date.now()),
    firstName,
    lastName,
    company,
    email,
    passwordHash: hashedPassword, // fixed variable name
    verified: false,
    verifyToken,
    verifyExpires,
    role: "user",
  };

  users.push(newUser);

  try {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  } catch (err) {
    console.error("write users error:", err);
    return res.status(500).json({ error: "SAVE_FAILED" });
  }

  // FRONTEND VERIFY PAGE (so it can auto-login by calling signIn with verifyToken)
  // kept your original link host/port
  const link = `http://localhost:3001/verify?token=${verifyToken}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // <-- ORIGINAL EMAIL HTML (kept exactly, minor whitespace preserved) -->
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
            Hello!
          </td>
        </tr>

        <tr>
          <td style="color:#c6c8cc; font-size:16px; line-height:24px; padding-bottom:30px;">
            Please click the button below to verify your email address.
          </td>
        </tr>

        <tr>
          <td align="center" style="padding-bottom:40px;">
            <a href="${link}"
              style="background:#bfc3cc; color:#000; padding:12px 22px; font-size:15px; border-radius:6px; text-decoration:none; font-weight:bold; display:inline-block;">
              Verify Email Address
            </a>
          </td>
        </tr>

        <tr>
          <td style="color:#c6c8cc; font-size:15px; line-height:24px; padding-bottom:30px;">
            If you did not create an account, no further action is required.<br><br>
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
      subject: "Verify your M&K Jewelris Account",
      html,
    });
  } catch (err) {
    // log but continue (user created)
    console.error("mail send error:", err);
  }

  return res.status(200).json({ message: "Account created. Verify your email." });
}
