// pages/api/admin/orders/update.js
import fs from "fs";
import path from "path";
import { getToken } from "next-auth/jwt";

export default async function handler(req, res) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || token.role !== "admin") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { orderId, status } = req.body;
    if (!orderId || !status) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const dataDir = path.join(process.cwd(), "data");
    const ordersPath = path.join(dataDir, "orders.json");
    const orders = fs.existsSync(ordersPath)
      ? JSON.parse(fs.readFileSync(ordersPath, "utf8"))
      : [];

    const idx = orders.findIndex((o) => String(o.id) === String(orderId));
    if (idx === -1) {
      return res.status(404).json({ error: "Order not found" });
    }

    orders[idx].status = status;
    orders[idx].adminUpdatedAt = new Date().toISOString();

    fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2));

    return res.status(200).json({ message: "Order updated", order: orders[idx] });
  } catch (err) {
    console.error("ADMIN UPDATE ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
