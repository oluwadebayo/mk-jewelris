// pages/admin/products.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getSession } from "next-auth/react";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminNavbar from "@/components/admin/AdminNavbar";

export default function AdminProducts() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  // ------------------------------
  // ADMIN VALIDATION (client-side)
  // ------------------------------
  useEffect(() => {
    async function validate() {
      const session = await getSession();

      if (!session || session.user.role !== "admin") {
        return router.push("/login");
      }

      await loadProducts();
      setLoading(false);
    }

    validate();
  }, []);

  // ------------------------------
  // LOAD PRODUCTS (from /public)
  // ------------------------------
  const loadProducts = async () => {
    try {
      const res = await fetch("/products.json");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Failed to load products:", err);
    }
  };

  // ------------------------------
  // DELETE PRODUCT
  // ------------------------------
  const deleteProduct = async (id) => {
    if (!confirm("Delete this product?")) return;

    try {
      await fetch("/api/products/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      loadProducts();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      {/* SIDEBAR */}
      <AdminSidebar current="/admin/products" />

      {/* RIGHT SIDE */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <AdminNavbar title="Products" userName={"Admin"} />

        <main style={{ padding: 20 }}>
          <section>
            <div style={{ background: "#fff", padding: 12, borderRadius: 10 }}>
              <h3>Products</h3>

              {/* ADD PRODUCT BUTTON */}
              <button
                onClick={() => router.push("/admin/products/add")}
                style={{
                  background: "#0f766e",
                  color: "#fff",
                  padding: "10px 18px",
                  border: "none",
                  borderRadius: "6px",
                  marginBottom: "20px",
                  cursor: "pointer",
                  fontSize: "15px",
                  fontWeight: "600",
                }}
              >
                + Add Product
              </button>

              {/* PRODUCTS TABLE */}
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f3f3f3" }}>
                    <th style={cell}>Image</th>
                    <th style={cell}>Name</th>
                    <th style={cell}>Price</th>
                    <th style={cell}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {products.length > 0 ? (
                    products.map((p) => (
                      <tr key={p.id}>
                        <td style={cell}>
                          <img
                            src={p.image}
                            style={{
                              width: "60px",
                              height: "60px",
                              objectFit: "cover",
                            }}
                          />
                        </td>

                        <td style={cell}>{p.name}</td>
                        <td style={cell}>₦{p.price.toLocaleString()}</td>

                        <td style={cell}>
                          <button
                            onClick={() =>
                              router.push(`/admin/products/edit/${p.id}`)
                            }
                            style={btnEdit}
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => deleteProduct(p.id)}
                            style={btnDelete}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        style={{ textAlign: "center", padding: 15 }}
                      >
                        No products found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

// ------------------------------
// STYLES — untouched
// ------------------------------
const cell = {
  padding: "12px",
  borderBottom: "1px solid #eee",
  fontSize: "15px",
};

const btnEdit = {
  background: "#0f766e",
  color: "#fff",
  padding: "6px 12px",
  border: "none",
  borderRadius: "5px",
  marginRight: "10px",
  cursor: "pointer",
};

const btnDelete = {
  background: "red",
  color: "#fff",
  padding: "6px 12px",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};
