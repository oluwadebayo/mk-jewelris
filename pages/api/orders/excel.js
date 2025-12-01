// pages/api/orders/excel.js
import ExcelJS from "exceljs";
import { readJSON } from "../../../utils/db.js";

export default async function handler(req, res) {
  const { id } = req.query;

  const orders = await readJSON("orders.json", []);
  const order = orders.find((o) => o.id === id);

  if (!order) return res.status(404).send("Order not found");

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Receipt");

  sheet.addRow(["Order Receipt"]);
  sheet.addRow([]);
  sheet.addRow(["Reference", order.reference]);
  sheet.addRow(["Email", order.email]);
  sheet.addRow(["Amount", order.amount]);
  sheet.addRow(["Date", order.date]);
  sheet.addRow([]);

  sheet.addRow(["Item", "Quantity", "Price"]);
  order.cart.forEach((i) => {
    sheet.addRow([i.name, i.quantity, i.price * i.quantity]);
  });

  res.setHeader(
    "Content-Disposition",
    `attachment; filename=receipt-${id}.xlsx`
  );
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  await workbook.xlsx.write(res);
  res.end();
}
