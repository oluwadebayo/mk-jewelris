// pages/api/paystack/verify.js
import axios from "axios";
import { readJSON, writeJSON } from "../../../utils/db.js";
import { sendMail } from "../../../utils/mailer.js";

export default async function handler(req, res) {
  const { reference } = req.query;

  if (!reference) {
    return res.status(400).json({ error: "Missing reference" });
  }

  try {
    // 1) Verify payment with Paystack
    const verifyRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const trx = verifyRes.data?.data;

    if (!trx || trx.status !== "success") {
      return res.status(400).json({
        error: "Payment not successful",
        status: trx?.status || "unknown",
      });
    }

    // 2) Safely read metadata
    const metadata = trx.metadata && typeof trx.metadata === "object" ? trx.metadata : {};
    const cart = Array.isArray(metadata.cart) ? metadata.cart : [];

    // 3) Read existing orders from root orders.json using utils/db
    const orders = (await readJSON("orders.json", [])) || [];

    // 4) Idempotency check: don't create duplicate order for same reference
    const existing = orders.find((o) => String(o.reference) === String(reference));
    if (existing) {
      return res.status(200).json({
        message: "Order already exists",
        order: existing,
      });
    }

    // 5) Build new order object
    const newOrder = {
      id: `order_${Date.now()}`,
      reference: trx.reference,
      email: trx.customer?.email || metadata.email || "unknown",
      amount: typeof trx.amount === "number" ? trx.amount / 100 : null,
      status: trx.status,
      cart,
      gateway_response: trx.gateway_response,
      paid_at: trx.paid_at,
      channel: trx.channel,
      currency: trx.currency,
      date: new Date().toISOString(),
      raw: trx,
    };

    // 6) Save order
    orders.push(newOrder);
    await writeJSON("orders.json", orders);

    // 7) Optionally clear the cart (global) — keep, but non-fatal
    try {
      await writeJSON("cart.json", []); // comment this out if you use per-user carts
    } catch (e) {
      console.warn("Could not clear cart.json:", e?.message || e);
    }

    // 8) Send email receipt (do not crash on email failure)
    try {
      const itemsHtml = (newOrder.cart || [])
        .map(
          (i) =>
            `<li>${i.name || "item"} × ${i.quantity ?? i.qty ?? 1} — ₦${(
              (i.price ?? 0) *
              (i.quantity ?? i.qty ?? 1)
            ).toLocaleString()}</li>`
        )
        .join("");

      const html = `
        <h2>Payment Successful 🎉</h2>
        <p>Thank you for shopping with us!</p>
        <p><strong>Reference:</strong> ${newOrder.reference}</p>
        <p><strong>Amount:</strong> ₦${(newOrder.amount ?? 0).toLocaleString()}</p>
        <h3>Items:</h3>
        <ul>${itemsHtml}</ul>
        <p style="margin-top:20px;">We appreciate your business 🎉</p>
      `;

      await sendMail({
        to: newOrder.email,
        subject: "Your Order Receipt",
        html,
      });
    } catch (mailErr) {
      console.error("Email sending failed:", mailErr?.message || mailErr);
      // do not fail the request
    }

    // 9) Return success
    return res.status(200).json({
      message: "Order saved successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("VERIFY ERROR:", error?.response?.data || error?.message || error);
    return res.status(500).json({
      error: "Verification failed",
      details: error?.response?.data || String(error?.message || error),
    });
  }
}
