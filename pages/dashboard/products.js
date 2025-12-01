// pages/dashboard/products.js
import Link from "next/link";
import DashboardNavbar from "../../components/dashboard/DashboardNavbar";

export default function BrowseProducts({ products }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      <main style={{ padding: 40 }}>
        <h2 style={{ fontSize: 28, color: "#0f766e" }}>Browse Products</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))", gap: 20, marginTop: 20 }}>
          {products && products.length > 0 ? products.map(p => (
            <div key={p.id} style={{ background: "#fff", padding: 16, borderRadius: 8, textAlign: "center" }}>
              <Link href={`/dashboard/product/${p.id}`} legacyBehavior>
                <a style={{ color: "inherit", textDecoration: "none" }}>
                  <img src={p.image || "/placeholder.png"} style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 8 }} />
                  <h4 style={{ marginTop: 10 }}>{p.name}</h4>
                  <div style={{ fontWeight: 700, color: "#0f766e" }}>₦{Number(p.price).toLocaleString()}</div>
                  {p.category && <small style={{ display: "block", marginTop: 6 }}>{p.category}</small>}
                </a>
              </Link>
            </div>
          )) : <div>No products found</div>}
        </div>
      </main>
    </div>
  );
}

export async function getServerSideProps() {
  const fs = require("fs");
  const path = require("path");
  try {
    const filePath = path.join(process.cwd(), "products.json");
    const raw = fs.readFileSync(filePath, "utf-8");
    const products = JSON.parse(raw || "[]");
    return { props: { products } };
  } catch (err) {
    return { props: { products: [] } };
  }
}
