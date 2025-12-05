// pages/api/admin/products/index.js
import { supabaseServer } from "@/lib/supabase";
import { getToken } from "next-auth/jwt";

export default async function handler(req, res) {
  // ---------------------------------------
  // ADMIN AUTH CHECK
  // ---------------------------------------
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || token.role !== "admin") {
    return res.status(401).json({ error: "UNAUTHORIZED" });
  }

  // ---------------------------------------
  // GET PRODUCTS
  // ---------------------------------------
  if (req.method === "GET") {
    try {
      const { data, error } = await supabaseServer
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return res.status(200).json({ products: data || [] });
    } catch (err) {
      console.error("❌ products GET error:", err.message || err);
      return res.status(500).json({ error: "READ_FAILED" });
    }
  }

  // ---------------------------------------
  // ADD PRODUCT
  // ---------------------------------------
  if (req.method === "POST") {
    const { name, price, image, category, description } = req.body;

    if (!name || !price || !image || !category) {
      return res.status(400).json({ error: "MISSING_FIELDS" });
    }

    try {
      const { error } = await supabaseServer.from("products").insert([
        {
          name,
          price: Number(price),
          image,
          category,
          description: description || "",
        },
      ]);

      if (error) throw error;

      return res.status(201).json({ success: true });
    } catch (err) {
      console.error("❌ products POST error:", err.message || err);
      return res.status(500).json({ error: "CREATE_FAILED" });
    }
  }

  // ---------------------------------------
  // METHOD NOT ALLOWED
  // ---------------------------------------
  return res.status(405).json({ error: "Method Not Allowed" });
}
