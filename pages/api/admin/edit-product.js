// pages/api/admin/edit-product.js
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "products.json");

export default function handler(req, res) {
  if (req.method !== "PUT") return res.status(405).json({ error: "Method not allowed" });
  try {
    const raw = fs.existsSync(filePath) ? fs.readFileSync(filePath,"utf8") : "[]";
    const products = raw ? JSON.parse(raw) : [];
    const { id, title, price, image, description } = req.body;
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return res.status(404).json({ error: "Product not found" });
    products[idx] = { ...products[idx], title, price, image: image || products[idx].image, description: description || products[idx].description };
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
    return res.status(200).json({ product: products[idx] });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
