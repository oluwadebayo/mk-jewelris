// components/admin/AdminSidebar.js
import Link from "next/link";

export default function AdminSidebar({ current = "/admin" }) {
  return (
    <aside style={styles.sidebar}>
      <div style={styles.brand}>
        <h1 style={{ margin: 0, fontSize: 18 }}>Admin</h1>
        <small style={{ opacity: 0.7 }}>Control Panel</small>
      </div>

      <nav style={styles.nav}>
        <Link href="/admin" legacyBehavior>
          <a style={linkStyle(current === "/admin")}>Overview</a>
        </Link>

        <Link href="/admin/orders" legacyBehavior>
          <a style={linkStyle(current === "/admin/orders")}>Orders</a>
        </Link>

        <Link href="/admin/products" legacyBehavior>
          <a style={linkStyle(current === "/admin/products")}>Products</a>
        </Link>

        <Link href="/admin/users" legacyBehavior>
          <a style={linkStyle(current === "/admin/users")}>Users</a>
        </Link>

        <div
          style={{
            marginTop: 18,
            borderTop: "1px solid #eee",
            paddingTop: 12,
          }}
        >
          <Link href="/" legacyBehavior>
            <a style={styles.smallLink}>Go to Store →</a>
          </Link>
        </div>
      </nav>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: 220,
    minHeight: "100vh",
    padding: "22px 16px",
    boxSizing: "border-box",
    background: "#ffffff",
    borderRight: "1px solid #eee",
    position: "sticky",
    top: 0,
  },

  brand: {
    marginBottom: 24,
  },

  nav: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  link: {
    display: "block",
    padding: "10px 12px",
    borderRadius: 8,
    textDecoration: "none",
    color: "#111827",
    fontWeight: 600,
  },

  smallLink: {
    display: "inline-block",
    color: "#374151",
    textDecoration: "none",
    fontSize: 13,
  },
};

function linkStyle(active) {
  return {
    ...styles.link,
    background: active ? "#F3F4F6" : "transparent",
    boxShadow: active ? "0 1px 3px rgba(0,0,0,0.04)" : "none",
  };
}
