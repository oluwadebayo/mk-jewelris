import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL,
process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
if (req.method !== "POST") {
return res.status(405).json({ error: "Method not allowed" });
}

const { firstName = "", lastName = "", company = "", email, password } = req.body || {};

if (!email || !password) {
return res.status(400).json({ error: "MISSING_FIELDS" });
}

try {
// 1) Check if user exists
const { data: existingUser, error: lookupErr } = await supabase
.from("users")
.select("*")
.eq("email", email)
.maybeSingle();

if (lookupErr) {
  console.error("DB lookup error:", lookupErr);
  return res.status(500).json({ error: "DB_ERROR" });
}

if (existingUser) {
  if (!existingUser.verified) {
    return res.status(400).json({ error: "UNVERIFIED_ACCOUNT" });
  }
  return res.status(400).json({ error: "EMAIL_TAKEN" });
}

// 2) Hash password
const hashedPassword = bcrypt.hashSync(password, 10);

// 3) Create new user
const { data: user, error: insertErr } = await supabase
  .from("users")
  .insert([
    {
      first_name: firstName,
      last_name: lastName,
      company,
      email,
      password_hash: hashedPassword,
      verified: false,
      role: "user"
    }
  ])
  .select()
  .single();

if (insertErr || !user) {
  console.error("User insert error:", insertErr);
  return res.status(500).json({ error: "SAVE_FAILED" });
}

// 4) Create verification token
const token = crypto.randomBytes(20).toString("hex");
const expiresAt = new Date(Date.now() + 1000 * 60 * 60).toISOString(); // 1 hour

const { error: pvErr } = await supabase
  .from("pending_verifications")
  .insert([
    {
      user_id: user.id,
      email,
      verification_token: token,
      expires_at: expiresAt
    }
  ]);

if (pvErr) {
  console.error("pending_verifications error:", pvErr);
}

// 5) Build verification link
const base =
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.NEXT_PUBLIC_VERCEL_URL ||
  "";
const link = `${base.replace(/\/$/, "")}/verify-success?token=${token}`;

// 6) Send styled email (unchanged)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

const html = `
  <div style="background-color:#0f1216; padding:40px 0; font-family:Arial, sans-serif;">
    <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background:#1a1d21; border-radius:8px; padding:40px;">
      <tr>
        <td align="center" style="padding-bottom:30px;">
          <img src="https://www.onlinelogomaker.com/blog/wp-content/uploads/2017/09/jewelry-logo-design.jpg" alt="Logo" width="140">
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
          <a href="${link}" style="background:#bfc3cc; color:#000; padding:12px 22px; font-size:15px; border-radius:6px; text-decoration:none; font-weight:bold; display:inline-block;">
            Verify Email Address
          </a>
        </td>
      </tr>

      <tr>
        <td style="color:#c6c8cc; font-size:15px; line-height:24px; padding-bottom:30px;">
          If you did not create an account, no further action is required.<br><br>
          Regards,<br>M&K Jewelris
        </td>
      </tr>
    </table>
  </div>
`;

try {
  await transporter.sendMail({
    to: email,
    subject: "Verify your M&K Jewelris Account",
    html
  });
} catch (err) {
  console.error("Mail error:", err);
}

return res.status(200).json({ message: "Account created. Verify your email." });

} catch (err) {
console.error("Unexpected signup error:", err);
return res.status(500).json({ error: "UNKNOWN_ERROR" });
}
}
