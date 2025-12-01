// pages/api/create-order.js
import fs from "fs";
import path from "path";

const ordersPath = path.join(process.cwd(), "orders.json");

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { email, cart, amount, reference } = req.body;
    if (!email || !cart) return res.status(400).json({ error: "Missing fields" });
    const raw = fs.existsSync(ordersPath) ? fs.readFileSync(ordersPath,"utf8") : "[]";
    const orders = raw ? JSON.parse(raw) : [];
    const order = { id: Date.now().toString(), email, amount, reference, items: cart, createdAt: new Date().toISOString() };
    orders.push(order);
    fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2));
    return res.status(201).json({ order });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
