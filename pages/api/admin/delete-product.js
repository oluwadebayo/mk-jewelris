// pages/api/admin/delete-product.js
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "products.json");

export default function handler(req, res) {
  if (req.method !== "DELETE") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { id } = req.query;
    const raw = fs.existsSync(filePath) ? fs.readFileSync(filePath,"utf8") : "[]";
    let products = raw ? JSON.parse(raw) : [];
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return res.status(404).json({ error: "Product not found" });
    const removed = products.splice(idx,1)[0];
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
    return res.status(200).json({ removed });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
