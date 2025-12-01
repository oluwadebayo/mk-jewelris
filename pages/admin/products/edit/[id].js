import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { getSession } from "next-auth/react";

import AdminNavbar from "../../../../components/admin/AdminNavbar";
import AdminSidebar from "../../../../components/admin/AdminSidebar";

export default function EditProduct() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    price: "",
    image: "",
    description: "",
  });

  // Validate admin + fetch product
  useEffect(() => {
    async function validateAdmin() {
      const session = await getSession();

      if (!session || session.user.role !== "admin") {
        return router.push("/login");
      }

      fetchProduct();
    }

    if (id) validateAdmin();
  }, [id]);

  const fetchProduct = async () => {
    const res = await fetch("/api/products/get");
    const all = await res.json();
    const product = all.find((p) => p.id == id);

    if (!product) return router.push("/admin/products");

    setForm(product);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/products/edit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      alert("Product updated");
      router.push("/admin/products");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      {/* SIDEBAR */}
      <AdminSidebar current="/admin/products" />

      {/* RIGHT SIDE */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <AdminNavbar title="Edit Product" userName="Admin" />

        <main style={{ padding: 20 }}>
          <section>
            <div style={{ background: "#fff", padding: 20, borderRadius: 10 }}>
              <h2 style={{ marginBottom: 15 }}>Edit Product</h2>

              <form onSubmit={handleSubmit} style={formBox}>
                <label style={label}>Name</label>
                <input
                  type="text"
                  style={input}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />

                <label style={label}>Price</label>
                <input
                  type="number"
                  style={input}
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                />

                <label style={label}>Image URL</label>
                <input
                  type="text"
                  style={input}
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  required
                />

                <label style={label}>Description</label>
                <textarea
                  style={{ ...input, height: "120px" }}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  required
                />

                <button type="submit" style={btnSave}>
                  Save Changes
                </button>
              </form>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

const formBox = {
  display: "flex",
  flexDirection: "column",
  gap: "15px",
  background: "#fff",
  padding: "20px",
  borderRadius: "8px",
};

const label = {
  fontWeight: "600",
  fontSize: "15px",
};

const input = {
  padding: "10px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  fontSize: "15px",
};

const btnSave = {
  background: "#0f766e",
  color: "#fff",
  padding: "10px 18px",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "600",
  border: "none",
  marginTop: "10px",
};
