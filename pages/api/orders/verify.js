// pages/api/orders/verify.js
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  const { reference } = req.query;

  if (!reference) {
    return res.status(400).json({ message: "Missing reference" });
  }

  try {
    // 1. Verify with Paystack
    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
        },
      }
    );

    const data = await verifyRes.json();

    // 2. Read orders DB
    const ordersPath = path.join(process.cwd(), "data", "orders.json");
    const orders = JSON.parse(fs.readFileSync(ordersPath, "utf8"));

    const order = orders.find((o) => o.reference === reference);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 3. Update status
    if (data.data.status === "success") {
      order.status = "paid";
    } else {
      order.status = "failed";
    }

    fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2));

    // 4. Redirect user back to success page
    return res.redirect(`/dashboard/cart/success?reference=${reference}`);
  } catch (error) {
    console.error("VERIFY ERROR:", error);
    return res.status(500).json({ message: "Verification failed" });
  }
}
