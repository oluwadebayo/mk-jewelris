// pages/api/admin/products.js
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "products.json");

export default function handler(req, res) {
  if (req.method === "GET") {
    try {
      const raw = fs.readFileSync(filePath, "utf8");
      const products = raw ? JSON.parse(raw) : [];
      return res.status(200).json({ products });
    } catch (err) {
      if (err.code === "ENOENT") return res.status(200).json({ products: [] });
      return res.status(500).json({ error: String(err) });
    }
  }
  return res.status(405).json({ error: "Method not allowed" });
}
