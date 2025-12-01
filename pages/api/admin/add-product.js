// pages/api/admin/add-product.js
import fs from "fs";
import path from "path";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const filePath = path.join(process.cwd(), "data", "products.json");
  const products = JSON.parse(fs.readFileSync(filePath, "utf8"));

  const { title, price, image, description } = req.body;

  if (!title || !price) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const newProduct = {
    id: Date.now().toString(),
    title,
    price,
    image,
    description,
  };

  products.push(newProduct);
  fs.writeFileSync(filePath, JSON.stringify(products, null, 2));

  return res.status(200).json({ message: "Product added", product: newProduct });
}
