// pages/api/paystack/initialize.js
import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, amount, cart } = req.body;

    if (!email || !amount || !cart) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Convert naira to kobo
    const amountInKobo = amount * 100;

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amountInKobo,
        metadata: {
          email,
          cart,
          custom_fields: [
            {
              display_name: "Cart Items",
              variable_name: "cart_items",
              value: cart,
            },
          ],
        },
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.status(200).json(response.data);
  } catch (error) {
    console.error("PAYSTACK INIT ERROR:", error.response?.data || error);
    return res.status(500).json({ error: "Paystack initialization failed" });
  }
}
