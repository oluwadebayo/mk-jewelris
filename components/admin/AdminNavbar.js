// components/admin/AdminNavbar.js
import { signOut } from "next-auth/react";

export default function AdminNavbar({ title = "Dashboard", userName = "Admin" }) {
  return (
    <header style={navStyles.header}>
      <div>
        <h2 style={{margin:0, fontSize:18}}>{title}</h2>
      </div>

      <div style={navStyles.right}>
        <div style={navStyles.user}>
          <div style={navStyles.avatar}>{(userName || "A").charAt(0).toUpperCase()}</div>
          <div style={{marginLeft:8}}>
            <div style={{fontSize:13, fontWeight:600}}>{userName}</div>
            <div style={{fontSize:12, color:"#6b7280"}}>Administrator</div>
          </div>
        </div>

        <button onClick={() => signOut({ callbackUrl: "/" })} style={navStyles.signout}>
          Sign out
        </button>
      </div>
    </header>
  );
}

const navStyles = {
  header: {
    height: 72,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 18px",
    borderBottom: "1px solid #eee",
    background: "#fff",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  user: {
    display: "flex",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 8,
    background: "#f3f4f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    color: "#111827"
  },
  signout: {
    marginLeft: 12,
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    background: "#fff",
    cursor: "pointer"
  }
}
