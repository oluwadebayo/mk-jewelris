import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AdminNavbar from "@/components/admin/AdminNavbar";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function EditUser() {
  const router = useRouter();
  const { id } = router.query;

  const [form, setForm] = useState(null);

  useEffect(() => {
    if (!id) return;

    async function loadUser() {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      const user = data.users.find((u) => String(u.id) === String(id));
      setForm(user);
    }
    loadUser();
  }, [id]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await fetch(`/api/admin/update-user?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    alert("Updated successfully!");
    router.push("/admin/users");
  }

  if (!form) return "Loading...";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <AdminSidebar current="/admin/users" />

      <div style={{ flex: 1 }}>
        <AdminNavbar title="Edit User" />

        <main style={{ padding: 20 }}>
          <div style={{ background: "#fff", padding: 20, borderRadius: 10 }}>
            <h2 style={{ marginBottom: 20 }}>Edit User</h2>

            <form onSubmit={handleSubmit}>
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                style={input}
              />

              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                style={input}
              />

              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                style={input}
              />

              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                style={input}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>

              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#0f766e",
                  color: "#fff",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  marginTop: "10px",
                }}
              >
                Save Changes
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

const input = {
  width: "100%",
  padding: "10px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  marginBottom: "15px",
};
