// pages/api/admin/update-order.js
import fs from "fs";
import path from "path";

export default function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const filePath = path.join(process.cwd(), "data", "orders.json");
  const orders = JSON.parse(fs.readFileSync(filePath, "utf8"));

  const { id, status } = req.body;

  const order = orders.find(o => o.id === id);
  if (!order) return res.status(404).json({ error: "Order not found" });

  order.status = status;
  fs.writeFileSync(filePath, JSON.stringify(orders, null, 2));

  return res.status(200).json({ message: "Order updated", order });
}
