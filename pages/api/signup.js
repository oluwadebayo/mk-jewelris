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

  try {
    // 1) Check if email already exists in users table
    const { data: existingUser, error: existingErr } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (existingErr) {
      console.error("Supabase lookup error:", existingErr);
      return res.status(500).json({ error: "DB_LOOKUP_FAILED" });
    }

    // If user exists
    if (existingUser) {
      // If user exists and is not verified, tell client (you already used this flow)
      if (!existingUser.verified) {
        return res.status(400).json({ error: "UNVERIFIED_ACCOUNT" });
      }
      // Already verified -> email taken
      return res.status(400).json({ error: "EMAIL_TAKEN" });
    }

    // 2) Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // 3) Insert user into users table (no verify_token columns here)
    const { data: insertedUser, error: insertErr } = await supabase
      .from("users")
      .insert([
        {
          first_name: firstName,
          last_name: lastName,
          company,
          email,
          password_hash: hashedPassword,
          verified: false,
          role: "user",
        },
      ])
      .select()
      .single();

    if (insertErr || !insertedUser) {
      console.error("Supabase insert error:", insertErr);
      return res.status(500).json({ error: "SAVE_FAILED" });
    }

    // 4) Create verification token and save to pending_verifications table
    const verifyToken = crypto.randomBytes(20).toString("hex");
    const verifyExpires = Date.now() + 1000 * 60 * 60; // 1 hour expiry
    const expiresAt = new Date(verifyExpires).toISOString();

    // Attempt to insert into pending_verifications. Using column names that match your table.
    const { data: pvData, error: pvErr } = await supabase
      .from("pending_verifications")
      .insert([
        {
          user_id: insertedUser.id,
          email,
          verification_token: verifyToken,   // correct column name
          expires_at: expiresAt               // added column; only change
        },
      ])
      .select()
      .single();

    if (pvErr) {
      // Log but continue — user exists; you may want to clean up in a failure case
      console.error("pending_verifications insert error:", pvErr);
      // Optionally: delete the inserted user to keep DB consistent — left commented for safety
      // await supabase.from('users').delete().eq('id', insertedUser.id);
      // return res.status(500).json({ error: "SAVE_PENDING_VERIFICATION_FAILED" });
    }

    // 5) Build verification link using NEXT_PUBLIC_BASE_URL
    const base = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_VERCEL_URL || "";
    const link = `${base.replace(/\/$/, "")}/verify?token=${verifyToken}`;

    // 6) Send verification email — HTML preserved exactly as you provided
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const html = `
      <div style="background-color:#0f1216; padding:40px 0; font-family:Arial, sans-serif;">
        <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background:#1a1d21; border-radius:8px; padding:40px;">
          
          <tr>
            <td align="center" style="padding-bottom:30px;">
              <img src="https://www.onlinelogomaker.com/blog/wp-content/uploads/2017/09/jewelry-logo-design.jpg" alt="Logo" width="140" style="display:block;">
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
      // don't block success if mail fails — user row is created
    }

    return res.status(200).json({ message: "Account created. Verify your email." });
  } catch (err) {
    console.error("Unexpected signup error:", err);
    return res.status(500).json({ error: "UNKNOWN_ERROR" });
  }
}
