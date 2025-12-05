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

    if (pvErr) {
      console.error("Token lookup error:", pvErr);
      return res.status(500).json({ error: "DB_ERROR" });
    }

    if (!pending) {
      return res.status(400).json({ error: "INVALID_VERIFY_TOKEN" });
    }

    // 2️⃣ Check expiration
    if (pending.expires_at && new Date(pending.expires_at) < new Date()) {
      return res.status(400).json({ error: "TOKEN_EXPIRED" });
    }

    // 3️⃣ Mark user verified
    const { error: verifyErr } = await supabase
      .from("users")
      .update({ verified: true })
      .eq("id", pending.user_id);

    if (verifyErr) {
      console.error("Verify update error:", verifyErr);
      return res.status(500).json({ error: "VERIFY_FAILED" });
    }

    // 4️⃣ Remove tokens for this user
    await supabase
      .from("pending_verifications")
      .delete()
      .eq("user_id", pending.user_id);

    // 5️⃣ Auto-login by redirecting to NextAuth credentials callback
    const base =
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.NEXTAUTH_URL ||
      process.env.NEXT_PUBLIC_VERCEL_URL ||
      "";

    const redirect = `${String(base).replace(
      /\/$/,
      ""
    )}/api/auth/callback/credentials?email=${encodeURIComponent(
      pending.email
    )}&verified=true&auto=true`;

    return res.redirect(302, redirect);
  } catch (err) {
    console.error("verify handler error:", err);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
}
