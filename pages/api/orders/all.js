import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const filePath = path.join(process.cwd(), "data", "orders.json");
  const orders = JSON.parse(fs.readFileSync(filePath));

  res.status(200).json({ orders });
}
