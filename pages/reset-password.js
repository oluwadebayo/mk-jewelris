// pages/reset-password.js
import { useState } from "react";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error sending reset email");
      } else {
        setMessage("Password reset email sent!");
      }
    } catch (err) {
      setError("Something went wrong");
    }

    setLoading(false);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0f1216",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          background: "#1a1d21",
          padding: "40px",
          borderRadius: "12px",
          color: "white",
        }}
      >
        <h2 style={{ marginBottom: "20px", fontSize: "24px" }}>
          Reset Password
        </h2>

        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: "14px" }}>Enter your email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "8px",
              marginBottom: "20px",
              borderRadius: "6px",
              border: "1px solid #333",
              background: "#0f1216",
              color: "white",
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              background: "#bfc3cc",
              padding: "12px",
              borderRadius: "6px",
              color: "#000",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {message && (
          <p style={{ color: "#9bb0ff", marginTop: "18px" }}>{message}</p>
        )}
        {error && (
          <p style={{ color: "red", marginTop: "18px" }}>{error}</p>
        )}
      </div>
    </div>
  );
}
