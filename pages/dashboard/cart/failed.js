import { useRouter } from "next/router";

export default function PaymentFailed() {
  const router = useRouter();
  const { reference } = router.query;

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1 style={{ fontSize: "30px", color: "red", fontWeight: "700" }}>
        Payment Failed ❌
      </h1>

      <p style={{ marginTop: "10px", fontSize: "18px" }}>
        Your payment could not be completed.
      </p>

      <p style={{ marginTop: "20px", fontSize: "20px", fontWeight: "600" }}>
        Reference: {reference}
      </p>

      <button
        onClick={() => router.push("/dashboard/cart")}
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
        Return to Cart
      </button>
    </div>
  );
}
