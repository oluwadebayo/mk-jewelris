// pages/api/verify.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: "MISSING_TOKEN" });
  }

  try {
    // 1️⃣ Find token
    const { data: pending, error: pvErr } = await supabase
      .from("pending_verifications")
      .select("*")
      .eq("verification_token", token)
      .maybeSingle();

    if (pvErr) return res.status(500).json({ error: "DB_ERROR" });
    if (!pending) return res.status(400).json({ error: "INVALID_VERIFY_TOKEN" });

    // 2️⃣ Mark user verified
    await supabase
      .from("users")
      .update({ verified: true })
      .eq("id", pending.user_id);

    // 3️⃣ Remove ALL previous tokens for this user
    await supabase
      .from("pending_verifications")
      .delete()
      .eq("user_id", pending.user_id);

    // 4️⃣ Build redirect URL for frontend auto-login
    const base =
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.NEXTAUTH_URL ||
      process.env.NEXT_PUBLIC_VERCEL_URL ||
      "";

    const redirect = `${String(base).replace(/\/$/, "")}/login?verifyToken=${encodeURIComponent(
      token
    )}`;

    return res.redirect(302, redirect);
  } catch (err) {
    console.error("verify handler error:", err);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
}
