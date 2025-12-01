import { useRouter } from "next/router";
import DashboardNavbar from "../../../components/dashboard/DashboardNavbar";
import { addToCart } from "../../../utils/cart";
import { showToast } from "../../../components/ToastContainer"; // ✅ add toast
import fs from "fs";
import path from "path";

export default function ProductDetail({ product }) {
  const router = useRouter();

  if (!product) {
    return (
      <div>
        <DashboardNavbar />
        <h1 style={{ padding: "40px", color: "red" }}>Product not found.</h1>
      </div>
    );
  }

  function handleAdd() {
    addToCart(product);

    // notify navbar badge
    window.dispatchEvent(new Event("cart-updated"));

    // ✅ animated toast instead of alert
    showToast(`${product.name} added to cart!`, "success");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />

      <div style={{ display: "flex", gap: "40px", padding: "50px" }}>
        {/* IMAGE */}
        <div>
          <img
            src={product.image}
            alt={product.name}
            style={{
              width: "380px",
              height: "380px",
              objectFit: "cover",
              borderRadius: "15px",
              border: "1px solid #ddd",
            }}
          />
        </div>

        {/* DETAILS */}
        <div>
          <h1 style={{ fontSize: "32px", fontWeight: "700", color: "#0f766e" }}>
            {product.name}
          </h1>

          <p style={{ marginTop: "15px", fontSize: "17px", color: "#444" }}>
            {product.description}
          </p>

          <h2
            style={{
              marginTop: "20px",
              fontSize: "28px",
              fontWeight: "700",
              color: "#0f766e",
            }}
          >
            ₦{product.price.toLocaleString()}
          </h2>

          <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
            <button
              onClick={handleAdd}
              style={{
                background: "#0f766e",
                color: "white",
                padding: "12px 25px",
                borderRadius: "8px",
                fontSize: "16px",
                cursor: "pointer",
                border: "none",
                fontWeight: 700,
              }}
            >
              Add to Cart
            </button>

            <button
              onClick={() => router.push("/dashboard/cart")}
              style={{
                background: "white",
                color: "#0f766e",
                padding: "12px 25px",
                borderRadius: "8px",
                fontSize: "16px",
                cursor: "pointer",
                border: "1px solid #0f766e",
                fontWeight: 700,
              }}
            >
              View Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Fetch single product from products.json (root)
export async function getServerSideProps({ params }) {
  try {
    const filePath = path.join(process.cwd(), "products.json");
    const fileData = fs.readFileSync(filePath, "utf-8");
    const products = JSON.parse(fileData);

    const product = products.find((p) => p.id === Number(params.id));

    return { props: { product: product || null } };
  } catch (error) {
    console.error("PRODUCT READ ERROR:", error);
    return { props: { product: null } };
  }
}
