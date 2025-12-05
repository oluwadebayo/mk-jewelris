// pages/api/admin/orders/update.js
import { getToken } from "next-auth/jwt";
import { supabaseServer } from "@/lib/supabase";

export default async function handler(req, res) {
  // Admin auth
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token || token.role !== "admin") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Allow only POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { orderId, status } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // Update order in Supabase
    const { data, error } = await supabaseServer
      .from("orders")
      .update({
        status,
        adminUpdatedAt: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select()
      .maybeSingle();

    if (error) {
      console.error("Supabase update error:", error);
      return res.status(500).json({ error: "UPDATE_FAILED" });
    }

    if (!data) {
      return res.status(404).json({ error: "Order not found" });
    }

    return res.status(200).json({
      message: "Order updated successfully",
      order: data,
    });
  } catch (err) {
    console.error("ADMIN UPDATE ERROR:", err);
    return res.status(500).json({ error: "SERVER_ERROR" });
  }
}
