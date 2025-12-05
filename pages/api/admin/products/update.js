// pages/api/admin/products/update.js
import { supabaseServer } from "@/lib/supabase";

export default async function handler(req, res) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { id, name, price, image, category } = req.body;

    if (!id) return res.status(400).json({ error: "MISSING_ID" });

    const { error } = await supabaseServer
      .from("products")
      .update({ name, price, image, category })
      .eq("id", id);

    if (error) throw error;

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("update product error:", err);
    return res.status(500).json({ error: "UPDATE_FAILED" });
  }
}
