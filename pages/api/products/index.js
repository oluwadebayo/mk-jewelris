import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const filePath = path.join(process.cwd(), "data", "products.json");

  try {
    const fileData = fs.readFileSync(filePath, "utf8");
    const products = JSON.parse(fileData);

    res.status(200).json({ products });
  } catch (err) {
    res.status(500).json({ error: "Failed to load products" });
  }
}
