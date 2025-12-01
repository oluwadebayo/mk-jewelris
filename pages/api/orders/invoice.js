// pages/api/orders/invoice.js
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

export default async function handler(req, res) {
  const { orderId } = req.query;

  if (!orderId) {
    return res.status(400).json({ error: "Missing orderId" });
  }

  try {
    const dataDir = path.join(process.cwd(), "data");
    const ordersPath = path.join(dataDir, "orders.json");
    const orders = fs.existsSync(ordersPath)
      ? JSON.parse(fs.readFileSync(ordersPath, "utf8"))
      : [];

    const order = orders.find((o) => String(o.id) === String(orderId));
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Create the PDF in memory and stream it
    const doc = new PDFDocument({ size: "A4", margin: 50 });

    // Set response headers for download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${order.reference}.pdf`
    );

    // Pipe PDF to response
    doc.pipe(res);

    // --- Header ---
    doc
      .fontSize(20)
      .text("Royalties Store", { align: "left" })
      .moveDown(0.2);

    doc
      .fontSize(10)
      .text(`Order ID: ${order.id}`, { align: "right" })
      .text(`Reference: ${order.reference}`, { align: "right" })
      .text(`Date: ${new Date(order.date).toLocaleString()}`, {
        align: "right",
      })
      .moveDown();

    doc.moveDown();

    // --- Customer ---
    doc.fontSize(12).text(`Billed to:`, { underline: true });
    doc.text(`${order.email}`);
    doc.moveDown();

    // --- Items Table Header ---
    doc.fontSize(12).text("Items", { underline: true });
    doc.moveDown(0.3);

    // Table columns
    const tableTop = doc.y;
    const itemX = 50;
    const qtyX = 320;
    const priceX = 380;
    const totalX = 460;

    doc.fontSize(10).text("Item", itemX, tableTop);
    doc.text("Qty", qtyX, tableTop);
    doc.text("Price", priceX, tableTop);
    doc.text("Total", totalX, tableTop);

    doc.moveDown(0.5);

    // --- Items ---
    order.cart.forEach((i, idx) => {
      const y = doc.y;
      doc.text(i.name, itemX, y, { width: 260 });
      doc.text(String(i.quantity), qtyX, y);
      doc.text(`₦${i.price.toLocaleString()}`, priceX, y);
      doc.text(`₦${(i.price * i.quantity).toLocaleString()}`, totalX, y);
      doc.moveDown();
    });

    doc.moveDown(1);

    // --- Totals ---
    doc.fontSize(12).text(`Subtotal: ₦${order.amount.toLocaleString()}`, {
      align: "right",
    });
    doc.moveDown(0.5);

    doc.fontSize(12).text(`Total: ₦${order.amount.toLocaleString()}`, {
      align: "right",
      underline: true,
    });

    doc.moveDown(2);

    // Footer note
    doc
      .fontSize(10)
      .text(
        "Thank you for your purchase! If you have any questions, reply to this email.",
        { align: "center" }
      );

    // Finalize PDF and end stream
    doc.end();
  } catch (err) {
    console.error("INVOICE ERROR:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to generate invoice" });
    } else {
      res.end();
    }
  }
}
