import axios from "axios";
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  const { reference } = req.query;

  if (!reference) {
    return res.status(400).json({ error: "Missing reference" });
  }

  try {
    // 1️⃣ VERIFY PAYMENT WITH PAYSTACK
    const verifyRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const payment = verifyRes.data.data;

    if (payment.status !== "success") {
      return res.redirect("/dashboard/cart?status=failed");
    }

    // 2️⃣ GET ORDER DATA FROM PAYSTACK METADATA
    const { cart, email } = payment.metadata;

    // 3️⃣ SAVE ORDER TO JSON FILE
    const ordersPath = path.join(process.cwd(), "data", "orders.json");
    const file = fs.readFileSync(ordersPath, "utf8");
    const orders = JSON.parse(file);

    const newOrder = {
      id: Date.now(),
      email,
      cart,
      amount: payment.amount / 100,
      reference: payment.reference,
      status: "Paid",
      createdAt: new Date().toISOString(),
    };

    orders.push(newOrder);
    fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2));

    // 4️⃣ REDIRECT BACK TO DASHBOARD
    // Passing query so dashboard knows to clear cart
    return res.redirect("/dashboard?payment=success");
  } catch (error) {
    console.error("PAYSTACK CALLBACK ERROR:", error.response?.data || error);
    return res.redirect("/dashboard/cart?status=failed");
  }
}
