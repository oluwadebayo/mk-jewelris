// pages/api/admin/create-product.js
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "products.json");

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const raw = fs.existsSync(filePath) ? fs.readFileSync(filePath,"utf8") : "[]";
    const products = raw ? JSON.parse(raw) : [];
    const { title, price, image, description } = req.body;
    if (!title || !price) return res.status(400).json({ error: "Missing fields" });

    const newProduct = { id: Date.now().toString(), title, price, image: image || "", description: description || "" };
    products.push(newProduct);
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
    return res.status(201).json({ product: newProduct });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
