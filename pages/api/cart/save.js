// pages/api/cart/save.js
import { writeJSON } from "@/utils/db";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { cart } = req.body;
  await writeJSON("cart.json", cart);

  res.json({ success: true });
}
