// pages/dashboard/paystack/failed.js
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import { useRouter } from "next/router";

export default function PaystackFailed() {
  const router = useRouter();
  const { reference } = router.query;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />

      <div
        style={{
          padding: "40px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            maxWidth: "600px",
            background: "white",
            padding: "30px",
            borderRadius: "12px",
            boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "32px",
              fontWeight: "700",
              color: "#dc2626",
              marginBottom: "10px",
            }}
          >
            Payment Failed ❌
          </h1>

          <p style={{ fontSize: "17px", color: "#444", marginBottom: "20px" }}>
            Your payment was not successful.
          </p>

          {reference && (
            <p
              style={{
                background: "#fee2e2",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #fca5a5",
                marginBottom: "20px",
              }}
            >
              <strong>Reference:</strong> {reference}
            </p>
          )}

          <button
            onClick={() => router.push("/dashboard/cart")}
            style={{
              background: "#0f766e",
              color: "white",
              padding: "14px 25px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
