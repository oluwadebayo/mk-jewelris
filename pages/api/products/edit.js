import fs from "fs";
import path from "path";

export default function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  const filePath = path.join(process.cwd(), "products.json");
  const { id, name, price, image, description } = req.body;

  try {
    const jsonData = fs.readFileSync(filePath, "utf-8");
    const products = JSON.parse(jsonData);

    const index = products.findIndex((p) => p.id === Number(id));
    if (index === -1)
      return res.status(404).json({ message: "Product not found" });

    products[index] = {
      ...products[index],
      name,
      price: Number(price),
      image,
      description,
    };

    fs.writeFileSync(filePath, JSON.stringify(products, null, 2));

    return res.status(200).json({ message: "Product updated" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to edit product" });
  }
}
