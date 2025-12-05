import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL,
process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
const { token } = req.query;

if (!token) return res.status(400).json({ error: "MISSING_TOKEN" });

try {
// 1) Lookup token
const { data: pending, error: pvErr } = await supabase
.from("pending_verifications")
.select("*")
.eq("verification_token", token)
.maybeSingle();

if (pvErr) return res.status(500).json({ error: "DB_ERROR" });
if (!pending) return res.status(400).json({ error: "INVALID_VERIFY_TOKEN" });

// 2) Check expiration
if (new Date(pending.expires_at) < new Date()) {
  return res.status(400).json({ error: "TOKEN_EXPIRED" });
}

// 3) Mark user verified
const { error: verifyErr } = await supabase
  .from("users")
  .update({ verified: true })
  .eq("id", pending.user_id);

if (verifyErr) return res.status(500).json({ error: "VERIFY_FAILED" });

// 4) Delete used tokens
await supabase
  .from("pending_verifications")
  .delete()
  .eq("user_id", pending.user_id);

// 5) Redirect to auto-login page
return res.redirect(302, `/verify-success?token=${token}`);

} catch (err) {
console.error("verify error:", err);
return res.status(500).json({ error: "SERVER_ERROR" });
}
}
