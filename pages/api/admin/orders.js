// pages/api/admin/orders.js
import { supabaseServer } from "@/lib/supabase";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { data, error } = await supabaseServer
      .from("orders")
      .select("*, users(email)")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      orders: data || [],
    });
  } catch (err) {
    console.error("admin/orders error:", err);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
}
