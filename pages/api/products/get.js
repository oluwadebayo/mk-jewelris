import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const filePath = path.join(process.cwd(), "products.json");
  try {
    const jsonData = fs.readFileSync(filePath, "utf-8");
    const products = JSON.parse(jsonData);
    return res.status(200).json(products);
  } catch (err) {
    return res.status(500).json({ message: "Failed to read product file" });
  }
}
