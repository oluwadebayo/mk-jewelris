// pages/dashboard/payment-success.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import confetti from "canvas-confetti";

export default function PaymentSuccess() {
  const router = useRouter();

  useEffect(() => {
    // Launch confetti once on page load
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
    });
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconCircle}>
          <span style={styles.check}>✔</span>
        </div>

        <h2 style={styles.title}>Payment Successful</h2>
        <p style={styles.desc}>Your order has been processed successfully!</p>

        <button
          style={styles.button}
          onClick={() => router.push("/dashboard")}
        >
          Continue Shopping
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
    background: "#f6fffa",
  },
  card: {
    width: "420px",
    padding: "40px 30px",
    textAlign: "center",
    background: "white",
    borderRadius: "16px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
    animation: "fadeIn 0.8s ease",
  },
  iconCircle: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "#2ecc71",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "0 auto 20px",
  },
  check: {
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
    background: "#007b5e",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
  },
};
