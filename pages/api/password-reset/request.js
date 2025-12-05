// pages/api/password-reset/request.js
import crypto from "crypto";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { email } = req.body;

  if (!email) return res.status(400).json({ error: "EMAIL_REQUIRED" });

  // Check for user
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (!user)
    return res.status(200).json({ message: "RESET_SENT" }); 
  // Always return success (for security)

  // Generate token
  const resetToken = crypto.randomBytes(20).toString("hex");
  const resetExpires = Date.now() + 1000 * 60 * 30; // 30 minutes

  await supabase
    .from("users")
    .update({
      reset_token: resetToken,
      reset_expires: resetExpires
    })
    .eq("email", email);

  // Reset link
  const link = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const html = `
    <div style="background-color:#0f1216; padding:40px 0; font-family:Arial,sans-serif;">
      <table align="center" width="100%" cellpadding="0" cellspacing="0"
        style="max-width:600px; background:#1a1d21; border-radius:8px; padding:40px;">
        
        <tr><td align="center" style="padding-bottom:30px;">
          <img src="mylogo0.jpg" width="140">
        </td></tr>

        <tr><td style="color:white; font-size:22px; font-weight:bold; padding-bottom:20px;">
          Reset Your Password
        </td></tr>

        <tr><td style="color:#c6c8cc; font-size:16px; line-height:24px; padding-bottom:30px;">
          Click the button below to reset your password.
        </td></tr>

        <tr><td align="center" style="padding-bottom:40px;">
          <a href="${link}" 
             style="background:#bfc3cc; color:#000; padding:12px 22px; border-radius:6px;
                    text-decoration:none; font-weight:bold;">
            Reset Password
          </a>
        </td></tr>

        <tr><td style="color:#c6c8cc; font-size:15px; line-height:24px;">
          If you didn’t request a password reset, ignore this email.
        </td></tr>
      </table>
    </div>
  `;

  try {
    await transporter.sendMail({
      to: email,
      subject: "Reset Your M&K Jewelris Password",
      html
    });
  } catch (err) {
    console.log("email error", err);
  }

  return res.status(200).json({ message: "RESET_SENT" });
}
