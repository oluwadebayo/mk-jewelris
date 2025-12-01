// pages/dashboard/paystack/success.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import Confetti from "react-confetti";

export default function PaystackSuccess() {
  const router = useRouter();
  const { reference } = router.query;

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    if (!reference) return;

    async function verifyPayment() {
      try {
        const res = await fetch(`/api/paystack/verify?reference=${reference}`);
        const data = await res.json();

        if (data.order) {
          setOrder(data.order);

          // Stop confetti after 5 seconds
          setTimeout(() => setShowConfetti(false), 5000);
        }
      } catch (err) {
        console.error("Verification error:", err);
      } finally {
        setLoading(false);
      }
    }

    verifyPayment();
  }, [reference]);

  if (loading || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <h2 style={{ fontSize: "24px", fontWeight: "600", color: "#0f766e" }}>
          Verifying payment...
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} />}

      <DashboardNavbar />

      <div style={{ padding: "40px" }}>
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            background: "white",
            borderRadius: "15px",
            padding: "30px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "32px",
              fontWeight: "700",
              color: "#0f766e",
              marginBottom: "10px",
            }}
          >
            Payment Successful 🎉
          </h1>

          <p style={{ fontSize: "17px", color: "#444", marginBottom: "20px" }}>
            Thank you for your purchase!
          </p>

          {/* Transaction Summary */}
          <div
            style={{
              background: "#f0fdfa",
              padding: "20px",
              borderRadius: "12px",
              marginBottom: "20px",
              border: "1px solid #99f6e4",
            }}
          >
            <h2
              style={{
                fontSize: "22px",
                fontWeight: "600",
                color: "#0f766e",
                marginBottom: "10px",
              }}
            >
              Transaction Summary
            </h2>

            <p style={{ fontSize: "16px", marginBottom: "6px" }}>
              <strong>Reference:</strong> {order.reference}
            </p>

            <p style={{ fontSize: "16px", marginBottom: "6px" }}>
              <strong>Email:</strong> {order.email}
            </p>

            <p style={{ fontSize: "16px", marginBottom: "6px" }}>
              <strong>Amount:</strong> ₦{order.amount.toLocaleString()}
            </p>

            <p style={{ fontSize: "16px", marginBottom: "6px" }}>
              <strong>Status:</strong>{" "}
              <span style={{ color: "#0f766e", fontWeight: "700" }}>
                {order.status}
              </span>
            </p>

            <p style={{ fontSize: "16px", marginTop: "10px" }}>
              <strong>Items:</strong>
            </p>

            <ul style={{ marginTop: "10px", textAlign: "left" }}>
              {order.cart.map((item) => (
                <li key={item.id} style={{ marginBottom: "8px" }}>
                  {item.name} × {item.quantity} — ₦
                  {(item.price * item.quantity).toLocaleString()}
                </li>
              ))}
            </ul>
          </div>

          {/* Continue Shopping */}
          <button
            onClick={() => router.push("/dashboard")}
            style={{
              background: "#0f766e",
              color: "white",
              padding: "14px 25px",
              borderRadius: "8px",
              fontSize: "16px",
              border: "none",
              cursor: "pointer",
              marginTop: "10px",
            }}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
