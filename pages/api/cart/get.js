// pages/api/cart/get.js
import { readJSON } from "@/utils/db";

export default async function handler(req, res) {
  const cart = await readJSON("cart.json", []);
  res.json({ cart });
}
