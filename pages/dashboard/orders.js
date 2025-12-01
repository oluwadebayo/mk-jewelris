import fs from "fs";
import path from "path";
import DashboardNavbar from "../../components/dashboard/DashboardNavbar";

export default function OrdersPage({ orders }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />

      <div style={{ padding: "40px" }}>
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            color: "#0f766e",
            marginBottom: "20px",
          }}
        >
          Your Orders
        </h1>

        {orders.length === 0 ? (
          <p>No orders yet.</p>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              style={{
                background: "white",
                border: "1px solid #ddd",
                padding: "20px",
                marginBottom: "15px",
                borderRadius: "10px",
              }}
            >
              <h2 style={{ color: "#0f766e" }}>
                {/* Previous Fix: Handle undefined amount */}
                Order #{order.id} — ₦{order.amount?.toLocaleString() || '0.00'}
              </h2>

              <p>Email: {order.email}</p>
              <p>Status: {order.status}</p>
              <p>Date: {new Date(order.date).toLocaleString()}</p>

              <h3 style={{ marginTop: "10px" }}>Items:</h3>
              
              {/* NEW FIX: Use optional chaining (?.) and provide a fallback empty array (?? []) */}
              {order.cart?.map((item) => (
                <p key={item.id}>
                  {item.name} — Qty: {item.quantity}
                </p>
              )) ?? <p>No items found for this order.</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  const ordersPath = path.join(process.cwd(), "data", "orders.json");

  const orders = fs.existsSync(ordersPath)
    ? JSON.parse(fs.readFileSync(ordersPath, "utf8"))
    : [];

  return { props: { orders } };
}
