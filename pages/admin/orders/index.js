// pages/admin/orders/index.js
import fs from "fs";
import path from "path";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { getToken } from "next-auth/jwt";
import { useState } from "react";

export default function AdminOrdersPage({ initialOrders }) {
  const [orders, setOrders] = useState(initialOrders || []);

  const updateStatus = async (orderId, status) => {
    try {
      const res = await fetch("/api/admin/orders/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });

      const json = await res.json();
      if (json.order) {
        setOrders((prev) =>
          prev.map((o) => (String(o.id) === String(orderId) ? json.order : o))
        );
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update order");
    }
  };

  const renderStatusBadge = (status) => {
    const base = {
      padding: "4px 10px",
      borderRadius: "6px",
      fontSize: 12,
      fontWeight: 600,
      textTransform: "capitalize",
      display: "inline-block",
    };

    if (status === "approved")
      return { ...base, background: "#d1fae5", color: "#065f46" };
    if (status === "rejected")
      return { ...base, background: "#fee2e2", color: "#991b1b" };

    return { ...base, background: "#fef3c7", color: "#92400e" }; // pending
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />

      <div style={{ padding: 40 }}>
        <h1 style={{ fontSize: 30, fontWeight: 700, color: "#0f766e" }}>
          Admin — Orders
        </h1>

        {/* CSV Export Button */}
        <div style={{ marginTop: 20, marginBottom: 30 }}>
          <a
            href="/api/admin/orders/export-csv"
            style={{
              background: "#0f766e",
              color: "white",
              padding: "10px 16px",
              borderRadius: 8,
              textDecoration: "none",
              fontWeight: 600,
              display: "inline-block",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            Export Orders as CSV
          </a>
        </div>

        <div style={{ marginTop: 20 }}>
          {orders.length === 0 ? (
            <p>No orders yet.</p>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                style={{
                  background: "white",
                  padding: 16,
                  borderRadius: 10,
                  marginBottom: 12,
                  border: "1px solid #eee",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {/* LEFT: Info */}
                <div>
                  <div style={{ fontWeight: 700 }}>
                    Order #{order.id} — ₦{order.amount.toLocaleString()}
                  </div>

                  <div style={{ marginTop: 4, marginBottom: 4 }}>
                    <span style={renderStatusBadge(order.status)}>
                      {order.status}
                    </span>
                  </div>

                  <div style={{ color: "#666" }}>{order.email}</div>
                  <div style={{ color: "#666", fontSize: 13 }}>
                    {new Date(order.date).toLocaleString()}
                  </div>

                  {/* RECEIPTS */}
                  <div style={{ marginTop: 8 }}>
                    <a
                      href={`/api/receipt/pdf?id=${order.id}`}
                      style={{
                        marginRight: 10,
                        color: "#0f766e",
                        textDecoration: "underline",
                        fontSize: 13,
                      }}
                    >
                      PDF Receipt
                    </a>

                    <a
                      href={`/api/receipt/excel?id=${order.id}`}
                      style={{
                        color: "#0f766e",
                        textDecoration: "underline",
                        fontSize: 13,
                      }}
                    >
                      Excel Receipt
                    </a>
                  </div>
                </div>

                {/* RIGHT: Actions */}
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => updateStatus(order.id, "approved")}
                    style={{
                      background: "#10b981",
                      color: "white",
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => updateStatus(order.id, "rejected")}
                    style={{
                      background: "#f97316",
                      color: "white",
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Reject
                  </button>

                  <a
                    href={`/dashboard/orders/${order.id}`}
                    style={{
                      background: "white",
                      color: "#0f766e",
                      border: "1px solid #0f766e",
                      padding: "8px 12px",
                      borderRadius: 8,
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                    }}
                  >
                    View
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Admin guard + load orders
export async function getServerSideProps(ctx) {
  const token = await getToken({
    req: ctx.req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token || token.role !== "admin") {
    return {
      redirect: { destination: "/", permanent: false },
    };
  }

  const dataDir = path.join(process.cwd(), "data");
  const ordersPath = path.join(dataDir, "orders.json");

  const orders = fs.existsSync(ordersPath)
    ? JSON.parse(fs.readFileSync(ordersPath, "utf8"))
    : [];

  return {
    props: {
      initialOrders: orders.reverse(),
    },
  };
}
