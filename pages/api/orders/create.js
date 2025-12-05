// pages/api/orders/create.js
import { supabaseServer } from "../../../lib/supabase";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { user_id, items, amount } = req.body;

    if (!user_id || !items || !amount) {
      return res.status(400).json({ error: "MISSING_FIELDS" });
    }

    const { error } = await supabaseServer.from("orders").insert([
      {
        user_id,
        items,
        amount,
        status: "pending",
      },
    ]);

    if (error) throw error;

    return res.status(201).json({ success: true });
  } catch (err) {
    console.error("order create error:", err);
    return res.status(500).json({ error: "CREATE_FAILED" });
  }
}
