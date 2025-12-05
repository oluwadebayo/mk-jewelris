// pages/api/password-reset/confirm.js
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: "Missing token or password" });
  }

  try {
    // 1. Find user by token
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("reset_token", token)
      .single();

    if (error || !user) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // 2. Check expiry
    if (Date.now() > user.reset_expires) {
      return res.status(400).json({ error: "Token has expired" });
    }

    // 3. Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Save new password & remove reset fields
    await supabase
      .from("users")
      .update({
        password: hashedPassword,
        reset_token: null,
        reset_expires: null,
      })
      .eq("id", user.id);

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
}
