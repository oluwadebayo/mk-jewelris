// pages/dashboard/orders/[id].js
import fs from "fs";
import path from "path";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function OrderDetails({ order }) {
  const router = useRouter();

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardNavbar />
        <div style={{ padding: 40 }}>
          <h2 style={{ color: "red" }}>Order not found.</h2>
        </div>
      </div>
    );
  }

  const downloadInvoice = () => {
    // trigger download
    window.location.href = `/api/orders/invoice?orderId=${order.id}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />

      <div style={{ padding: 40, display: "flex", justifyContent: "center" }}>
        <div
          style={{
            width: "100%",
            maxWidth: 900,
            background: "white",
            padding: 24,
            borderRadius: 12,
            boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
          }}
        >
          <h1 style={{ fontSize: 28, color: "#0f766e", marginBottom: 8 }}>
            Order #{order.id}
          </h1>

          <p style={{ marginBottom: 8 }}>
            <strong>Reference:</strong> {order.reference}
          </p>
          <p style={{ marginBottom: 8 }}>
            <strong>Date:</strong> {new Date(order.date).toLocaleString()}
          </p>
          <p style={{ marginBottom: 8 }}>
            <strong>Status:</strong>{" "}
            <span style={{ color: "#0f766e", fontWeight: 700 }}>
              {order.status}
            </span>
          </p>

          <div style={{ marginTop: 16, marginBottom: 16 }}>
            <h3 style={{ marginBottom: 8 }}>Items</h3>
            <div>
              {order.cart.map((it) => (
                <div
                  key={it.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 12,
                    borderRadius: 8,
                    border: "1px solid #eee",
                    marginBottom: 8,
                  }}
                >
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <img
                      src={it.image}
                      alt={it.name}
                      style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 6 }}
                    />
                    <div>
                      <div style={{ fontWeight: 700 }}>{it.name}</div>
                      <div style={{ color: "#666" }}>
                        Qty: {it.quantity} × ₦{it.price.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontWeight: 700 }}>
                    ₦{(it.price * it.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: "right", marginTop: 12 }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>
              Total: ₦{order.amount.toLocaleString()}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            <button
              onClick={() => router.push("/dashboard/orders")}
              style={{
                background: "white",
                color: "#0f766e",
                padding: "10px 16px",
                borderRadius: 8,
                border: "1px solid #0f766e",
                cursor: "pointer",
              }}
            >
              Back
            </button>

            <button
              onClick={downloadInvoice}
              style={{
                background: "#0f766e",
                color: "white",
                padding: "10px 16px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
              }}
            >
              Download Invoice (PDF)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Server-side fetch order
export async function getServerSideProps(context) {
  const { id } = context.params;

  const dataDir = path.join(process.cwd(), "data");
  const ordersPath = path.join(dataDir, "orders.json");
  const orders = fs.existsSync(ordersPath)
    ? JSON.parse(fs.readFileSync(ordersPath, "utf8"))
    : [];

  const order = orders.find((o) => String(o.id) === String(id)) || null;

  return { props: { order } };
}
