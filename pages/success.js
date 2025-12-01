import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { clearCart } from "@/utils/cart";

export default function PaymentSuccess() {
  const router = useRouter();
  const { reference } = router.query;
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!reference) return;

    async function verifyPayment() {
      const res = await fetch(`/api/paystack/verify?reference=${reference}`);
      const data = await res.json();

      if (data.order) {
        setOrder(data.order);
        clearCart();
      }

      setLoading(false);
    }

    verifyPayment();
  }, [reference]);

  if (loading)
    return <p style={{ padding: 50, fontSize: 20 }}>Verifying payment...</p>;

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1 style={{ fontSize: "30px", color: "#0f766e", fontWeight: "700" }}>
        Payment Successful 🎉
      </h1>

      <p style={{ marginTop: "10px" }}>
        Thank you! Your payment has been verified.
      </p>

      <p style={{ marginTop: "20px", fontSize: "20px", fontWeight: "600" }}>
        Reference: {order.reference}
      </p>

      <button
        onClick={() => router.push("/dashboard/orders")}
        style={{
          marginTop: "30px",
          background: "#0f766e",
          color: "white",
          padding: "12px 25px",
          borderRadius: "8px",
          fontSize: "16px",
          border: "none",
          cursor: "pointer",
        }}
      >
        View Order History
      </button>

      <button
        onClick={() => router.push("/dashboard")}
        style={{
          marginTop: "20px",
          display: "block",
          marginLeft: "auto",
          marginRight: "auto",
          background: "#111",
          color: "white",
          padding: "12px 25px",
          borderRadius: "8px",
          fontSize: "16px",
          border: "none",
          cursor: "pointer",
        }}
      >
        Continue Shopping
      </button>
    </div>
  );
}
