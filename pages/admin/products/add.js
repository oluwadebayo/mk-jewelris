// pages/admin/products/add.js
import { useState } from "react";
import { useRouter } from "next/router";
import { getSession } from "next-auth/react";

import AdminSidebar from "../../../components/admin/AdminSidebar";
import AdminNavbar from "../../../components/admin/AdminNavbar";

export default function AddProduct() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    price: "",
    image: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/products/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/admin/products");
    } else {
      alert("Error creating product");
    }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      {/* SIDEBAR */}
      <AdminSidebar current="/admin/products" />

      {/* RIGHT SIDE (NAV + CONTENT) */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <AdminNavbar title="Add Product" userName="Admin" />

        <main style={{ padding: 20 }}>
          <div style={{ background: "#fff", padding: 20, borderRadius: 10 }}>
            <h2>Add Product</h2>

            <form onSubmit={handleSubmit} style={formBox}>
              <div>
                <label style={label}>Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  style={input}
                />
              </div>

              <div>
                <label style={label}>Price (₦)</label>
                <input
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={handleChange}
                  required
                  style={input}
                />
              </div>

              <div>
                <label style={label}>Image URL</label>
                <input
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  placeholder="/products/xxx.jpg"
                  required
                  style={input}
                />
              </div>

              <div>
                <label style={label}>Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="4"
                  required
                  style={input}
                ></textarea>
              </div>

              <button type="submit" disabled={loading} style={btnSave}>
                {loading ? "Saving..." : "Add Product"}
              </button>
            </form>
          </div>
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
  width: "100%",
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
