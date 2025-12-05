// pages/admin/index.js
import fs from "fs";
import path from "path";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";
import { getSession } from "next-auth/react";

const dataDir = process.cwd(); // root of project

export default function AdminHome({ stats, latestOrders, userName }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <AdminSidebar current="/admin" />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <AdminNavbar title="Overview" userName={userName} />

        <main style={{ padding: 20 }}>
          <section style={{ marginBottom: 20 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 16,
              }}
            >
              <StatCard label="Total Orders" value={stats.totalOrders} />
              <StatCard label="Total Users" value={stats.totalUsers} />
              <StatCard label="Total Products" value={stats.totalProducts} />
              <StatCard
                label="Revenue (sum)"
                value={`₦${stats.totalRevenue || 0}`}
              />
            </div>
          </section>

          <section>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <h3 style={{ margin: 0 }}>Latest Orders</h3>
            </div>

            <div style={tableWrap}>
              <table
                style={{
                  ...tableStyle,
                  tableLayout: "fixed",
                }}
              >
                <thead>
                  <tr>
                    <th style={thStyle}>Reference</th>
                    <th style={thStyle}>Email</th>
                    <th style={thStyle}>Amount</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Created</th>
                  </tr>
                </thead>

                <tbody>
                  {latestOrders.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        style={{
                          padding: 16,
                          textAlign: "center",
                          fontSize: 14,
                        }}
                      >
                        No orders yet
                      </td>
                    </tr>
                  )}

                  {latestOrders.map((o) => (
                    <tr key={o.reference || o.id}>
                      <td style={tdStyleBold}>{o.reference}</td>
                      <td style={tdStyle}>{o.email}</td>
                      <td style={tdStyle}>₦{o.amount}</td>
                      <td style={{ ...tdStyle, textTransform: "capitalize" }}>
                        {o.status}
                      </td>
                      <td style={tdStyle}>
                        {new Date(o.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div
      style={{
        background: "#fff",
        padding: 16,
        borderRadius: 10,
        boxShadow: "0 6px 18px rgba(15,23,42,0.03)",
        minHeight: 90,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <div style={{ fontSize: 13, color: "#6b7280" }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, marginTop: 6 }}>
        {value ?? 0}
      </div>
    </div>
  );
}

const tableWrap = {
  background: "#fff",
  borderRadius: 10,
  padding: 8,
  boxShadow: "0 6px 18px rgba(15,23,42,0.03)",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 14,
};

const thStyle = {
  fontWeight: 600,
  textAlign: "left",
  padding: "12px 10px",
  borderBottom: "1px solid #f1f5f9",
};

const tdStyle = {
  padding: "12px 10px",
  borderBottom: "1px solid #f8fafc",
  fontSize: 14,
};

const tdStyleBold = {
  ...tdStyle,
  fontWeight: 600,
};

// ------------------ FIXED SSR ------------------
export async function getServerSideProps(ctx) {
  const session = await getSession({ req: ctx.req });

  if (!session || session.user.role !== "admin") {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  try {
    const ordersPath = path.join(dataDir, "orders.json");
    const usersPath = path.join(dataDir, "users.json");

    // FIXED: products.json is located in /public
    const productsPath = path.join(dataDir, "public", "products.json");

    const orders = fs.existsSync(ordersPath)
      ? JSON.parse(fs.readFileSync(ordersPath, "utf8"))
      : [];

    const users = fs.existsSync(usersPath)
      ? JSON.parse(fs.readFileSync(usersPath, "utf8"))
      : [];

    const products = fs.existsSync(productsPath)
      ? JSON.parse(fs.readFileSync(productsPath, "utf8"))
      : [];

    const totalRevenue = orders.reduce(
      (sum, o) => sum + (Number(o.amount) || 0),
      0
    );

    const latestOrders = orders
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8);

    return {
      props: {
        stats: {
          totalOrders: orders.length,
          totalUsers: users.length,
          totalProducts: products.length,
          totalRevenue,
        },
        latestOrders,
        userName: session.user.name || session.user.email || "Admin",
      },
    };
  } catch (err) {
    console.error("ADMIN INDEX ERROR:", err);
    return {
      props: {
        stats: {
          totalOrders: 0,
          totalUsers: 0,
          totalProducts: 0,
          totalRevenue: 0,
        },
        latestOrders: [],
        userName: session?.user?.name || "Admin",
      },
    };
  }
}
