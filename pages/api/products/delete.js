import fs from "fs";
import path from "path";

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { id } = req.body;
  const filePath = path.join(process.cwd(), "products.json");

  try {
    const jsonData = fs.readFileSync(filePath, "utf-8");
    let products = JSON.parse(jsonData);
    products = products.filter((p) => String(p.id) !== String(id));
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
    return res.status(200).json({ message: "Product deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete product" });
  }
}
