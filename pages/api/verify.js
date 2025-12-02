// pages/api/verify.js
import { serialize } from "cookie";
import { v4 as uuid } from "uuid";
import { createClient } from "@supabase/supabase-js";

// Secure Supabase server client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // server-only
);

export default async function handler(req, res) {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: "MISSING_TOKEN" });
  }

  // 1️⃣ Fetch user by verify_token
  const { data: user, error: findErr } = await supabase
    .from("users")
    .select("*")
    .eq("verify_token", token)
    .single();

  if (!user) {
    return res.status(400).json({ error: "INVALID_VERIFY_TOKEN" });
  }

  // 2️⃣ Check if expired
  if (user.verify_expires && Date.now() > user.verify_expires) {
    return res.status(400).json({ error: "VERIFY_TOKEN_EXPIRED" });
  }

  // 3️⃣ Mark verified + clear fields
  const { error: updateErr } = await supabase
    .from("users")
    .update({
      verified: true,
      verify_token: null,
      verify_expires: null,
    })
    .eq("id", user.id);

  if (updateErr) {
    console.error("verify update error:", updateErr);
    return res.status(500).json({ error: "SAVE_FAILED" });
  }

  // 4️⃣ AUTO-LOGIN (same logic as your old session.json method)
  const sessionToken = uuid();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const { error: sessionErr } = await supabase
    .from("sessions")
    .insert([
      {
        session_token: sessionToken,
        user_id: user.id,
        expires: expiresAt,
      }
    ]);

  if (sessionErr) {
    console.error("session insert error:", sessionErr);
    // user is still verified, continue
  }

  // 5️⃣ Set NextAuth compatible cookie
  res.setHeader(
    "Set-Cookie",
    serialize("next-auth.session-token", sessionToken, {
      path: "/",
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60,
    })
  );

  return res.status(200).json({ success: true });
}
