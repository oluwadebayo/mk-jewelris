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

const { email } = req.body || {};
if (!email) return res.status(400).json({ error: "MISSING_EMAIL" });

try {
// 1) Lookup user
const { data: user } = await supabase
.from("users")
.select("*")
.eq("email", email)
.maybeSingle();

if (!user) return res.status(400).json({ error: "USER_NOT_FOUND" });
if (user.verified) return res.status(400).json({ error: "ALREADY_VERIFIED" });

// 2) Delete old tokens
await supabase
  .from("pending_verifications")
  .delete()
  .eq("user_id", user.id);

// 3) Create new token
const token = crypto.randomBytes(20).toString("hex");
const expiresAt = new Date(Date.now() + 1000 * 60 * 60).toISOString();

await supabase.from("pending_verifications").insert([
  {
    user_id: user.id,
    email,
    verification_token: token,
    expires_at: expiresAt
  }
]);

// 4) Build link
const base =
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.NEXTAUTH_URL ||
  process.env.NEXT_PUBLIC_VERCEL_URL ||
  "";
const link = `${String(base).replace(/\/$/, "")}/verify-success?token=${token}`;

// 5) Send styled email
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

await transporter.sendMail({
  to: email,
  subject: "Resend Email Verification — M&K Jewelris",
  html: `
    <div style="background:#0f1216;padding:40px 0;font-family:Arial">
      <table align="center" style="max-width:600px;background:#1a1d21;border-radius:8px;padding:40px;">
        <tr><td align="center" style="padding-bottom:30px;">
          <img src="mylogo0.jpg" width="140">
        </td></tr>

        <tr><td style="color:white;font-size:22px;font-weight:bold;padding-bottom:20px;">
          Hello ${user.first_name || ""}!
        </td></tr>

        <tr><td style="color:#c6c8cc;font-size:16px;line-height:24px;padding-bottom:30px;">
          Please verify your email again by clicking below:
        </td></tr>

        <tr><td align="center" style="padding-bottom:40px;">
          <a href="${link}" style="background:#bfc3cc;color:#000;padding:12px 22px;border-radius:6px;font-weight:bold;text-decoration:none;">Verify Email</a>
        </td></tr>
      </table>
    </div>
  `
});

return res.status(200).json({ message: "Verification email resent." });

} catch (err) {
console.error("resend error:", err);
return res.status(500).json({ error: "SERVER_ERROR" });
}
}
