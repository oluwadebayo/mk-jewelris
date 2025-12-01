// pages/admin/orders.js (modified)
import fs from "fs";
import path from "path";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";

export default function AdminOrders({ orders }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <AdminSidebar current="/admin/orders" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <AdminNavbar title="Orders" userName={"Admin"} />
        <main style={{ padding: 20 }}>
          <section>
            <div style={{ background: "#fff", padding: 12, borderRadius: 10 }}>
              <h3>Orders</h3>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr><th>ID</th><th>Email</th><th>Amount</th><th>Items</th></tr></thead>
                <tbody>
                  {orders && orders.length>0 ? orders.map(o=>(
                    <tr key={o.id}>
                      <td>{o.id}</td>
                      <td>{o.email}</td>
                      <td>{o.amount}</td>
                      <td>{o.items ? o.items.length : 0}</td>
                    </tr>
                  )) : <tr><td colSpan={4}>No orders</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

// server side props to read orders.json from root
export async function getServerSideProps() {
  const filePath = path.join(process.cwd(), "orders.json");
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const orders = raw ? JSON.parse(raw) : [];
    return { props: { orders } };
  } catch (err) {
    return { props: { orders: [] } };
  }
}
