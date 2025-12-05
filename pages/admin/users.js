// pages/admin/users.js
import { useState, useEffect } from "react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";

export default function AdminUsers() {
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // -----------------------------------
  // ADMIN ACCESS VALIDATION
  // -----------------------------------
  useEffect(() => {
    async function validate() {
      const session = await getSession();

      if (!session || session.user.role !== "admin") {
        return router.push("/login");
      }

      loadUsers();
    }
    validate();
  }, []);

  // -----------------------------------
  // LOAD USERS FROM public/users.json
  // -----------------------------------
  const loadUsers = async () => {
    try {
      const res = await fetch("/users.json"); // static JSON in public/
      const data = await res.json();

      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load users.json", e);
    }
  };

  // -----------------------------------
  // TOGGLE ADMIN
  // -----------------------------------
  async function toggleAdmin(id, isAdmin) {
    await fetch(`/api/admin/toggle-admin?id=${id}`, {
      method: "PATCH",
    });
    loadUsers();
  }

  // -----------------------------------
  // DELETE USER
  // -----------------------------------
  async function deleteUser(id) {
    if (!confirm("Are you sure you want to delete this user?")) return;

    await fetch(`/api/admin/delete-user?id=${id}`, {
      method: "DELETE",
    });

    loadUsers();
  }

  // SEARCH FILTER
  const filteredUsers = users.filter((u) =>
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  // PAGINATION
  const indexOfLast = currentPage * usersPerPage;
  const indexOfFirst = indexOfLast - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      {/* SIDEBAR */}
      <AdminSidebar current="/admin/users" />

      {/* RIGHT SIDE */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <AdminNavbar title="Users" />

        <main style={{ padding: 20 }}>
          <section>
            <div style={{ background: "#fff", padding: 20, borderRadius: 10 }}>
              <h2 style={{ marginBottom: 15 }}>Admin — Users</h2>

              {/* SEARCH BAR */}
              <input
                type="text"
                placeholder="Search users by email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  marginBottom: "20px",
                }}
              />

              {/* ADD NEW USER BUTTON */}
              <div style={{ textAlign: "right", marginBottom: "20px" }}>
                <a
                  href="/admin/users/add"
                  style={{
                    background: "#0f766e",
                    color: "#fff",
                    padding: "10px 16px",
                    borderRadius: "6px",
                    textDecoration: "none",
                    fontSize: "14px",
                  }}
                >
                  + Add New User
                </a>
              </div>

              {/* USERS TABLE */}
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f3f3f3" }}>
                    <th style={cell}>Email</th>
                    <th style={cell}>Role</th>
                    <th style={cell}>Status</th>
                    <th style={{ ...cell, textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {currentUsers.length > 0 ? (
                    currentUsers.map((u) => (
                      <tr key={u.id}>
                        <td style={cell}>{u.email}</td>
                        <td style={cell}>{u.role}</td>

                        {/* VERIFIED STATUS */}
                        <td style={cell}>
                          <span
                            style={{
                              padding: "4px 8px",
                              borderRadius: "6px",
                              fontSize: "13px",
                              background: u.verified ? "#d1fae5" : "#fee2e2",
                              color: u.verified ? "#065f46" : "#991b1b",
                            }}
                          >
                            {u.verified ? "Verified" : "Pending"}
                          </span>
                        </td>

                        {/* ACTIONS */}
                        <td
                          style={{
                            ...cell,
                            textAlign: "right",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {/* EDIT BUTTON */}
                          <a
                            href={`/admin/users/edit/${u.id}`}
                            style={{
                              padding: "6px 12px",
                              marginRight: "10px",
                              background: "#2563eb",
                              color: "#fff",
                              borderRadius: "6px",
                              textDecoration: "none",
                              fontSize: "14px",
                            }}
                          >
                            Edit
                          </a>

                          {/* TOGGLE ADMIN */}
                          <button
                            onClick={() => toggleAdmin(u.id, u.role === "admin")}
                            style={{
                              padding: "6px 12px",
                              marginRight: "10px",
                              background:
                                u.role === "admin" ? "#f59e0b" : "#0f766e",
                              color: "#fff",
                              borderRadius: "6px",
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            {u.role === "admin" ? "Remove Admin" : "Make Admin"}
                          </button>

                          {/* DELETE USER */}
                          <button
                            onClick={() => deleteUser(u.id)}
                            style={{
                              padding: "6px 12px",
                              background: "red",
                              color: "#fff",
                              borderRadius: "6px",
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        style={{ textAlign: "center", padding: "20px" }}
                      >
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div style={{ marginTop: 20, textAlign: "center" }}>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      style={{
                        padding: "8px 12px",
                        margin: "0 5px",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                        background:
                          currentPage === i + 1 ? "#0f766e" : "white",
                        color: currentPage === i + 1 ? "#fff" : "#000",
                        cursor: "pointer",
                      }}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

const cell = {
  padding: "12px",
  borderBottom: "1px solid #eee",
  fontSize: "15px",
};
