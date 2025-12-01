import { useState } from "react";
import { useRouter } from "next/router";
import AdminNavbar from "../../../components/admin/AdminNavbar";
import AdminSidebar from "../../../components/admin/AdminSidebar";

export default function AddUser() {
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "user",
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const res = await fetch("/api/admin/create-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      alert("User created successfully!");
      router.push("/admin/users");
    } else {
      alert("Error creating user");
    }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <AdminSidebar current="/admin/users" />

      <div style={{ flex: 1 }}>
        <AdminNavbar title="Add User" />

        <main style={{ padding: 20 }}>
          <div style={{ background: "#fff", padding: 20, borderRadius: 10 }}>
            <h2 style={{ marginBottom: 20 }}>Create New User</h2>

            <form onSubmit={handleSubmit}>
              {/* First Name */}
              <input
                name="firstName"
                placeholder="First Name"
                value={form.firstName}
                onChange={handleChange}
                required
                style={input}
              />

              {/* Last Name */}
              <input
                name="lastName"
                placeholder="Last Name"
                value={form.lastName}
                onChange={handleChange}
                required
                style={input}
              />

              {/* Email */}
              <input
                name="email"
                placeholder="Email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                style={input}
              />

              {/* Password */}
              <input
                name="password"
                placeholder="Password"
                type="text"
                value={form.password}
                onChange={handleChange}
                required
                style={input}
              />

              {/* Role */}
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
                Create User
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
