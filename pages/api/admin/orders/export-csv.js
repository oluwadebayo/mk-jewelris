// pages/api/admin/orders/export-csv.js
import fs from "fs";
import path from "path";
import { getToken } from "next-auth/jwt";

export default async function handler(req, res) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Allow only admins to export
  if (!token || token.role !== "admin") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const dataDir = path.join(process.cwd(), "data");
    const ordersPath = path.join(dataDir, "orders.json");

    if (!fs.existsSync(ordersPath)) {
      return res.status(200).send("No orders found.");
    }

    const orders = JSON.parse(fs.readFileSync(ordersPath, "utf8"));

    // Convert orders to CSV rows
    const header = [
      "Order ID",
      "Reference",
      "Email",
      "Amount",
      "Status",
      "Date",
      "Items",
    ];

    const rows = orders.map((order) => {
      const items = order.cart
        .map((i) => `${i.name} (x${i.quantity}) - ₦${i.price}`)
        .join(" | ");

      return [
        order.id,
        order.reference,
        order.email,
        order.amount,
        order.status,
        order.date,
        `"${items.replace(/"/g, '""')}"`, // escape quotes
      ].join(",");
    });

    const csv = [header.join(","), ...rows].join("\n");

    // Set file download headers
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=orders-export-${Date.now()}.csv`
    );

    return res.status(200).send(csv);
  } catch (err) {
    console.error("CSV EXPORT ERROR:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
