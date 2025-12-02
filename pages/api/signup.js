// pages/api/signup.js
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // server-only
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { firstName = "", lastName = "", company = "", email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "MISSING_FIELDS" });
  }

  // 1️⃣ Check if email already exists
  const { data: existingUser, error: existingErr } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (existingUser) {
    if (!existingUser.verified) {
      return res.status(400).json({ error: "UNVERIFIED_ACCOUNT" });
    }
    return res.status(400).json({ error: "EMAIL_TAKEN" });
  }

  // 2️⃣ Hash password
  const hashedPassword = bcrypt.hashSync(password, 10);

  // 3️⃣ Generate verify token + expiry
  const verifyToken = crypto.randomBytes(20).toString("hex");
  const verifyExpires = Date.now() + 1000 * 60 * 60; // 1 hour

  // 4️⃣ Insert user into Supabase
  const { data: newUser, error: insertErr } = await supabase
    .from("users")
    .insert([
      {
        first_name: firstName,
        last_name: lastName,
        company,
        email,
        password_hash: hashedPassword,
        verified: false,
        verify_token: verifyToken,
        verify_expires: verifyExpires,
        role: "user",
      }
    ])
    .select()
    .single();

  if (insertErr) {
    console.error("Supabase insert error:", insertErr);
    return res.status(500).json({ error: "SAVE_FAILED" });
  }

  // 5️⃣ Prepare verify link (same as before)
  const link = `http://localhost:3001/verify?token=${verifyToken}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 6️⃣ Your original HTML (unchanged)
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
    console.error("mail send error:", err);
    // continue, user is still created
  }

  return res.status(200).json({ message: "Account created. Verify your email." });
}
