// pages/api/order/confirm.js
import axios from "axios";
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  try {
    const { reference, userEmail, cart } = req.body;

    // 1. Verify Payment
    const verify = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const status = verify.data.data.status;

    if (status !== "success") {
      return res.status(400).json({ error: "Payment not successful" });
    }

    // 2. Save order in JSON
    const filePath = path.join(process.cwd(), "data", "orders.json");
    const orders = JSON.parse(fs.readFileSync(filePath, "utf8"));

    const newOrder = {
      id: Date.now().toString(),
      email: userEmail,
      items: cart,
      status: "Paid",
      date: new Date().toISOString(),
      reference,
    };

    orders.push(newOrder);
    fs.writeFileSync(filePath, JSON.stringify(orders, null, 2));

    // 3. Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: userEmail,
      subject: "Your Order is Confirmed!",
      html: `<p>Thank you for your purchase. Your order is now confirmed.</p>`,
    });

    return res.status(200).json({ message: "Order confirmed and email sent" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Server error" });
  }
}
