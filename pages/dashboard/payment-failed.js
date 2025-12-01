// pages/dashboard/payment-failed.js
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function PaymentFailed() {
  const router = useRouter();

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.errorCircle}>
          <span style={styles.x}>✖</span>
        </div>

        <h2 style={styles.title}>Payment Failed</h2>
        <p style={styles.desc}>
          Your payment could not be processed. Please try again.
        </p>

        <button
          style={styles.button}
          onClick={() => router.push("/dashboard/cart")}
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "90vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#fff5f5",
  },
  card: {
    width: "420px",
    padding: "40px 30px",
    textAlign: "center",
    background: "white",
    borderRadius: "16px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
  },
  errorCircle: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "#e74c3c",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "0 auto 20px",
  },
  x: {
    fontSize: "45px",
    color: "white",
    fontWeight: "bold",
  },
  title: {
    fontSize: "26px",
    marginBottom: "10px",
  },
  desc: {
    fontSize: "16px",
    color: "#555",
    marginBottom: "25px",
  },
  button: {
    padding: "12px 20px",
    background: "#c0392b",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
  },
};
