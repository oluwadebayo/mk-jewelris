import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import DashboardNavbar from "../../components/dashboard/DashboardNavbar";
import { clearCart, getCart, addToCart } from "../../utils/cart";
import { useSession } from "next-auth/react";
import { showToast } from "@/components/ToastContainer";


export default function DashboardHome({ products }) {
  const router = useRouter();
  const { data: session } = useSession();

  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const perPage = 6; // pagination size

  // categories (safe)
  const categories = ["All", ...Array.from(new Set((products || []).map((p) => p.category).filter(Boolean)))];

  // search + category filter
  const filtered = (products || []).filter((p) => {
    const matchesCategory = category === "All" ? true : p.category === category;
    const matchesQuery = query.trim() === "" ? true : (p.name || "").toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages]);

  const pageProducts = filtered.slice((page - 1) * perPage, page * perPage);

  // Save user email
  useEffect(() => {
    if (session?.user?.email) {
      localStorage.setItem("userEmail", session.user.email);
    }
  }, [session]);

  // Detect Paystack callback
  useEffect(() => {
    if (router.query.payment === "success") {
      const cart = getCart();
      const email = session?.user?.email || localStorage.getItem("userEmail");

      const amount = router.query.amount;
      const reference = router.query.reference;

      fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          cart,
          amount,
          reference,
        }),
      })
        .then((res) => res.json())
        .then(() => {
          clearCart();
          // dispatch cart updated
          window.dispatchEvent(new Event("cart-updated"));
          if (window.toast) window.toast("🎉 Order placed successfully!");
        })
        .catch((err) => console.error("ORDER SAVE ERROR:", err));
    }

    if (router.query.payment === "failed") {
      alert("❌ Payment Failed. Please try again.");
    }
  }, [router.query, session]);

  function handleQuickAdd(product) {
    addToCart(product);
    window.dispatchEvent(new Event("cart-updated"));
    // small feedback without changing styles
    showToast(`${product.name} added to cart!`, "success");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />

      <div style={{ padding: "40px" }}>
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            color: "#0f766e",
            marginBottom: "20px",
          }}
        >
          Browse Our Latest Products
        </h1>

        {/* Controls: Category + Search */}
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => { setCategory(c); setPage(1); }}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: category === c ? "2px solid #0f766e" : "1px solid #ddd",
                  background: category === c ? "#0f766e" : "#fff",
                  color: category === c ? "#fff" : "#0f766e",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                {c}
              </button>
            ))}
          </div>

          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder="Search products..."
              style={{
                padding: "10px",
                borderRadius: 8,
                border: "1px solid #ddd",
                width: 260,
              }}
            />
          </div>
        </div>

        {/* PRODUCT GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "25px",
          }}
        >
          {pageProducts.map((p) => (
            <div key={p.id} style={{ textDecoration: "none", color: "inherit" }}>
              <Link href={`/dashboard/product/${p.id}`} legacyBehavior>
                <a style={{ textDecoration: "none", color: "inherit" }}>
                  <div
                    style={{
                      background: "#fff",
                      padding: "20px",
                      borderRadius: "10px",
                      border: "1px solid #eee",
                      textAlign: "center",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                      cursor: "pointer",
                      transition: "0.2s",
                    }}
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      style={{
                        width: "100%",
                        height: "170px",
                        objectFit: "cover",
                        borderRadius: "10px",
                        marginBottom: "15px",
                      }}
                    />

                    <h2
                      style={{
                        fontSize: "18px",
                        fontWeight: "600",
                        color: "#333",
                      }}
                    >
                      {p.name}
                    </h2>

                    <p
                      style={{
                        color: "#0f766e",
                        fontWeight: "700",
                        marginTop: "8px",
                        fontSize: "17px",
                      }}
                    >
                      ₦{p.price.toLocaleString()}
                    </p>
                  </div>
                </a>
              </Link>

              {/* Quick Add button */}
              <div style={{ marginTop: 8, textAlign: "center" }}>
                <button
                  onClick={() => handleQuickAdd(p)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: "none",
                    background: "#0f766e",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div style={{ marginTop: 24, display: "flex", justifyContent: "center", gap: 8 }}>
          <button
            onClick={() => setPage((s) => Math.max(1, s - 1))}
            disabled={page === 1}
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid #ddd",
              background: "#fff",
              cursor: page === 1 ? "not-allowed" : "pointer",
            }}
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              style={{
                padding: "8px 12px",
                borderRadius: 6,
                border: "1px solid #ddd",
                background: page === i + 1 ? "#0f766e" : "#fff",
                color: page === i + 1 ? "#fff" : "#000",
                cursor: "pointer",
              }}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setPage((s) => Math.min(totalPages, s + 1))}
            disabled={page === totalPages}
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid #ddd",
              background: "#fff",
              cursor: page === totalPages ? "not-allowed" : "pointer",
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

// SERVER-SIDE: read products.json from root
export async function getServerSideProps() {
  const fs = require("fs");
  const path = require("path");

  try {
    const filePath = path.join(process.cwd(), "products.json");
    const fileData = fs.readFileSync(filePath, "utf-8");
    const products = JSON.parse(fileData);

    // ensure category fallback
    const normalized = products.map((p) => ({ category: p.category || "Uncategorized", ...p }));

    return { props: { products: normalized } };
  } catch (error) {
    console.log("READ PRODUCTS ERROR:", error);
    return { props: { products: [] } };
  }
}
