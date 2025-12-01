// components/dashboard/DashboardNavbar.js
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";

// ✅ FIXED IMPORT PATH (this was the cause of the error)
import { getCart } from "@/utils/cart";

export default function DashboardNavbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  // CART COUNT
  const [cartCount, setCartCount] = useState(0);

  // ref for dropdown to detect outside clicks
  const dropdownRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const c = await getCart();
      if (!mounted) return;
      setCartCount((Array.isArray(c) ? c.length : 0) || 0);
    };

    init();

    const updateCart = async () => {
      const newCart = await getCart();
      setCartCount((Array.isArray(newCart) ? newCart.length : 0) || 0);
    };

    window.addEventListener("cart-updated", updateCart);

    // outside click listener
    function handleDocClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleDocClick);

    return () => {
      mounted = false;
      window.removeEventListener("cart-updated", updateCart);
      document.removeEventListener("mousedown", handleDocClick);
    };
  }, []);

  // small inline styles for the dropdown animation
  const dropdownStyles = {
    transform: open ? "translateY(0)" : "translateY(-6px)",
    opacity: open ? 1 : 0,
    pointerEvents: open ? "auto" : "none",
    transition: "opacity 180ms ease, transform 180ms ease",
  };

  return (
    <nav style={styles.nav}>
      {/* LOGO LEFT */}
      <div style={styles.logoBox}>
        <img
          src="/mylogo0.jpg"
          alt="Logo"
          style={{ height: "40px", objectFit: "contain" }}
        />
      </div>

      {/* NAV LINKS RIGHT */}
      <div style={styles.linksBox}>
        <Link href="/dashboard" style={styles.link}>
          Browse Products
        </Link>

        <Link href="/dashboard/orders" style={styles.link}>
          My Orders
        </Link>

        {/* CART WITH BADGE */}
        <Link href="/dashboard/cart" style={{ ...styles.link, position: "relative" }}>
          Cart
          {cartCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-8px",
                right: "-12px",
                background: "red",
                color: "white",
                padding: "2px 6px",
                fontSize: "11px",
                borderRadius: "50%",
                fontWeight: "700",
              }}
            >
              {cartCount}
            </span>
          )}
        </Link>

        {/* AVATAR BUTTON */}
        <div style={styles.avatar} onClick={() => setOpen((s) => !s)}>
          {session?.user?.firstName?.charAt(0).toUpperCase()}
        </div>

        {/* LOGOUT BUTTON */}
        <button onClick={() => signOut()} style={styles.logoutBtn}>
          Logout
        </button>

        {/* DROPDOWN (animated + closes on outside click) */}
        <div
          ref={dropdownRef}
          style={{
            ...styles.dropdown,
            ...dropdownStyles,
          }}
          aria-hidden={!open}
        >
          <Link
            href="/dashboard/profile"
            style={styles.dropdownItem}
            onClick={() => setOpen(false)}
          >
            My Profile
          </Link>

          <Link
            href="/dashboard/settings"
            style={styles.dropdownItem}
            onClick={() => setOpen(false)}
          >
            Settings
          </Link>

          <Link
            href="/dashboard/support"
            style={styles.dropdownItem}
            onClick={() => setOpen(false)}
          >
            Support
          </Link>
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    width: "100%",
    padding: "15px 30px",
    background: "#ffffff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #eee",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  logoBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "20px",
    fontWeight: "700",
    color: "#0f766e",
  },
  linksBox: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    position: "relative",
  },
  link: {
    textDecoration: "none",
    color: "#0f766e",
    fontWeight: "600",
    fontSize: "15px",
  },
  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "#0f766e",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "16px",
    cursor: "pointer",
    userSelect: "none",
  },
  dropdown: {
    position: "absolute",
    top: "55px",
    right: "70px",
    width: "180px",
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: "8px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    zIndex: 200,
    overflow: "hidden",
  },
  dropdownItem: {
    padding: "12px",
    fontSize: "15px",
    color: "#0f766e",
    textDecoration: "none",
    borderBottom: "1px solid #f1f1f1",
    cursor: "pointer",
    background: "white",
  },
  logoutBtn: {
    background: "red",
    color: "white",
    padding: "8px 14px",
    borderRadius: "6px",
    border: "none",
    fontWeight: "600",
    cursor: "pointer",
  },
};
