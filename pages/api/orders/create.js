// pages/api/orders/create.js
import { readJSON, writeJSON } from "../../../utils/db.js";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  try {
    const { email, cart, amount, reference } = req.body;
    if (!cart || !Array.isArray(cart))
      return res.status(400).json({ message: "Cart required" });

    const orders = (await readJSON("orders.json", [])) || [];

    const order = {
      id: `order_${Date.now()}`,
      reference: reference || `REF_${Date.now()}`,
      email: email || null,
      cart,
      amount:
        typeof amount === "number"
          ? amount
          : Array.isArray(cart)
          ? cart.reduce((s, it) => s + (it.price || 0) * (it.qty ?? it.quantity ?? 1), 0)
          : 0,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    orders.push(order);
    await writeJSON("orders.json", orders);

    // Optionally clear global cart.json if desired:
    // await writeJSON("cart.json", []);

    return res.status(201).json({ message: "Order created", order });
  } catch (err) {
    console.error("CREATE ORDER ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err?.message || String(err) });
  }
}
