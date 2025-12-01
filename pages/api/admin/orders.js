// pages/api/admin/orders.js
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "orders.json");

export default function handler(req, res) {
  if (req.method === "GET") {
    try {
      const raw = fs.readFileSync(filePath, "utf8");
      const orders = raw ? JSON.parse(raw) : [];
      return res.status(200).json({ orders });
    } catch (err) {
      if (err.code === "ENOENT") return res.status(200).json({ orders: [] });
      return res.status(500).json({ error: String(err) });
    }
  }
  return res.status(405).json({ error: "Method not allowed" });
}
