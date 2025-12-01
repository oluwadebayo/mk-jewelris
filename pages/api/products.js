// pages/api/products.js
import fs from "fs";
import path from "path";

export default function handler(req, res) {
  try {
    const filePath = path.join(process.cwd(), "product.json"); // ROOT folder
    const fileData = fs.readFileSync(filePath, "utf-8");
    const products = JSON.parse(fileData);

    return res.status(200).json(products);
  } catch (error) {
    console.error("Error reading product.json:", error);
    return res.status(500).json({ message: "Error reading products" });
  }
}
