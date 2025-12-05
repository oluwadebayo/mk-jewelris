// pages/reset-password.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token } = router.query;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [page, setPage] = useState("email"); // email | new-password
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (token) setPage("new-password");
  }, [token]);

  // SEND RESET EMAIL
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/password-reset/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setLoading(false);
    setMsg(data.message);
  };

  // SET NEW PASSWORD
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/password-reset/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setMsg("Password updated successfully. Redirecting...");
      setTimeout(() => router.push("/login"), 1500);
    } else {
      setMsg(data.error);
    }
  };

  return (
    <div className="reset-container">
      <div className="reset-card">
        <h2 className="reset-title">
          {page === "email" ? "Forgot Password" : "Reset Password"}
        </h2>

        {msg && <p className="reset-message">{msg}</p>}

        {/* SEND EMAIL */}
        {page === "email" && (
          <form onSubmit={handleEmailSubmit} className="reset-form">
            <input
              type="email"
              placeholder="Enter your email"
              className="reset-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button className="reset-btn" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        {/* NEW PASSWORD FORM */}
        {page === "new-password" && (
          <form onSubmit={handlePasswordSubmit} className="reset-form">
            <input
              type="password"
              placeholder="Enter new password"
              className="reset-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button className="reset-btn" disabled={loading}>
              {loading ? "Saving..." : "Update Password"}
            </button>
          </form>
        )}
      </div>

      {/* CSS */}
      <style jsx>{`
        .reset-container {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #f3f4f6;
          padding: 20px;
        }

        .reset-card {
          width: 100%;
          max-width: 420px;
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
        }

        .reset-title {
          text-align: center;
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
        }

        .reset-message {
          background: #e0e7ff;
          color: #3730a3;
          padding: 10px;
          border-radius: 8px;
          text-align: center;
          margin-bottom: 15px;
        }

        .reset-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .reset-input {
          padding: 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 15px;
          outline: none;
        }

        .reset-input:focus {
          border-color: #6366f1;
        }

        .reset-btn {
          background: #4f46e5;
          color: white;
          padding: 12px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
          transition: 0.2s;
        }

        .reset-btn:hover {
          background: #4338ca;
        }

        .reset-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
