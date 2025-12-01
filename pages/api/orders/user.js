import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const { email } = req.query;

  const filePath = path.join(process.cwd(), "data", "orders.json");
  const orders = JSON.parse(fs.readFileSync(filePath));

  const userOrders = orders.filter(o => o.email === email);

  res.status(200).json({ orders: userOrders });
}
