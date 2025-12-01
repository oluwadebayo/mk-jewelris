import fs from "fs";
import path from "path";

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const filePath = path.join(process.cwd(), "products.json");
  const { name, price, image, description, category } = req.body;

  try {
    const jsonData = fs.readFileSync(filePath, "utf-8");
    const products = JSON.parse(jsonData);

    const newProduct = {
      id: products.length > 0 ? products[products.length - 1].id + 1 : 1,
      name,
      price: Number(price),
      image,
      description,
      category: category || ""
    };

    products.push(newProduct);
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
    return res.status(200).json({ message: "Product added", product: newProduct });
  } catch (err) {
    return res.status(500).json({ message: "Failed to add product" });
  }
}
