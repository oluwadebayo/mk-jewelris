// pages/login.js
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState("error");
  const [showResend, setShowResend] = useState(false);

  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setShowResend(false);
    setUnverifiedEmail("");

    const res = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });

    if (res?.error) {
      if (typeof res.error === "string" && res.error.startsWith("UNVERIFIED:")) {
        const extracted = res.error.replace("UNVERIFIED:", "").trim();
        setMsgType("error");
        setMessage("Please verify your email first");
        setUnverifiedEmail(extracted || form.email);
        setShowResend(true);
      } else if (
        res.error === "UNVERIFIED_ACCOUNT" ||
        res.error === "UNVERIFIED"
      ) {
        setMsgType("error");
        setMessage("Please verify your email first");
        setUnverifiedEmail(form.email);
        setShowResend(true);
      } else if (
        res.error === "USER_NOT_FOUND" ||
        res.error === "INVALID_PASSWORD" ||
        res.error === "CredentialsSignin"
      ) {
        setMsgType("error");
        setMessage("Invalid email or password");
      } else {
        setMsgType("error");
        setMessage(res.error);
      }

      setLoading(false);
      return;
    }

    // ✅ SUCCESS — new role-based redirect
    setMsgType("success");
    setMessage("Login successful! Redirecting...");

    try {
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();

      const role = session?.user?.role || "user";
      const dest = role === "admin" ? "/admin" : "/dashboard";

      setTimeout(() => router.push(dest), 700);
    } catch (err) {
      setTimeout(() => router.push("/dashboard"), 700);
    }

    setLoading(false);
  }

  async function handleResend(e) {
    e?.preventDefault?.();
    setResendLoading(true);

    const emailToSend = unverifiedEmail || form.email;

    if (!emailToSend) {
      setMsgType("error");
      setMessage("Please enter an email to resend verification to.");
      setResendLoading(false);
      return;
    }

    try {
      const resp = await fetch("/api/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToSend }),
      });

      const data = await resp.json().catch(() => ({}));

      if (resp.ok) {
        setMsgType("success");
        setMessage("Verification email resent! Check your inbox.");
        setShowResend(false);
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 4000);
      } else {
        setMsgType("error");
        setMessage(data?.error || "Failed to resend verification email.");
      }
    } catch (err) {
      setMsgType("error");
      setMessage("Network error while resending email.");
    } finally {
      setResendLoading(false);
      setTimeout(() => setMessage(""), 4500);
    }
  }

  return (
    <div className="login-wrapper">
      <div className="login-card" role="main" aria-labelledby="login-title">
        <h2 id="login-title" className="title">Welcome Back</h2>

        {router.query.verified === "true" && (
          <div className="alert success">
            Your account is verified! Please log in.
          </div>
        )}

        {message && (
          <div
            className={`alert ${msgType}`}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>{message}</span>

            {showResend && (
              <button
                onClick={handleResend}
                disabled={resendLoading}
                style={{
                  marginLeft: 12,
                  background: "transparent",
                  border: "none",
                  color: "#1e40af",
                  textDecoration: "underline",
                  cursor: resendLoading ? "default" : "pointer",
                  fontSize: 14,
                  padding: "4px 6px",
                  opacity: resendLoading ? 0.6 : 1,
                }}
                aria-label="Resend verification email"
              >
                {resendLoading ? <div className="spinner" /> : "Resend Email"}
              </button>
            )}
          </div>
        )}

        {/* GOOGLE LOGIN BUTTON */}
        <button
          style={{
            marginBottom: "16px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "8px",
            background: "#ffffff",
            border: "1px solid #e3e7ea",
            color: "#0f1724",
            boxShadow: "0 4px 10px rgba(0,0,0,0.04)",
          }}
          onClick={() => signIn("google")}
          type="button"
        >
          <img src="/google-logo.jpg" width="20" height="20" alt="Google" />
          Continue with Google
        </button>

        <form onSubmit={handleSubmit} className="form">
          <label className="visually-hidden" htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />

          <label className="visually-hidden" htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />

          <button aria-live="polite" disabled={loading} type="submit">
            {loading ? "Logging in..." : "Login"}
          </button>
          <div style={{ textAlign: "center", marginTop: "15px" }}>
            <a
              href="/reset-password"
              style={{
                color: "#bfc3cc",
                fontSize: "14px",
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              Forgot Password?
            </a>
          </div>

        </form>
      </div>

      {/* FULL ORIGINAL CSS — UNTOUCHED */}
      <style jsx>{`
        .login-wrapper {
          background: linear-gradient(180deg, #f6fbf8 0%, #f2f6f4 100%);
          padding: 24px;
          font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
        }

        .login-card {
          width: 100%;
          max-width: 420px;
          background: #fff;
          padding: 40px;
          border-radius: 14px;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(16, 24, 40, 0.04);
          animation: cardIn 420ms cubic-bezier(0.2, 0.9, 0.2, 1);
        }

        @keyframes cardIn {
          from {
            opacity: 0;
            transform: translateY(14px) scale(0.995);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .title {
          text-align: left;
          font-size: 24px;
          margin: 0 0 18px 0;
          font-weight: 700;
          color: #0f1724;
        }

        .form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        input {
          width: 100%;
          padding: 12px 14px;
          border: 1px solid #e3e7ea;
          border-radius: 10px;
          background: linear-gradient(180deg, #ffffff 0%, #fbfcfd 100%);
          transition: box-shadow 180ms ease, border-color 180ms ease;
        }

        input:focus {
          outline: none;
          border-color: #66bb6a;
          box-shadow: 0 6px 18px rgba(102, 187, 106, 0.12);
        }

        button {
          width: 100%;
          padding: 12px 14px;
          background: linear-gradient(180deg, #16b556 0%, #0f8a42 100%);
          border: none;
          border-radius: 10px;
          color: #fff;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          box-shadow: 0 8px 18px rgba(16,24,40,0.08);
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .alert {
          padding: 10px 12px;
          border-radius: 10px;
          margin-bottom: 12px;
          font-size: 14px;
          animation: alertIn 300ms cubic-bezier(0.2, 0.9, 0.2, 1);
        }

        @keyframes alertIn {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .error {
          background: linear-gradient(180deg, #fff5f5 0%, #fff7f7 100%);
          border: 1px solid rgba(217, 70, 60, 0.12);
          color: #922626;
        }

        .success {
          background: linear-gradient(180deg, #f2fbf6 0%, #f5fdf8 100%);
          border: 1px solid rgba(34, 197, 94, 0.12);
          color: #165e3b;
        }

        .visually-hidden {
          position: absolute !important;
          height: 1px;
          width: 1px;
          overflow: hidden;
          clip: rect(1px, 1px, 1px, 1px);
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 28px 18px;
          }
        }

        .toast {
          position: fixed;
          right: 20px;
          top: 20px;
          background: linear-gradient(180deg, #17a05a, #0f8a42);
          color: white;
          padding: 12px 16px;
          border-radius: 12px;
          font-weight: 600;
          display: inline-flex;
          gap: 12px;
          align-items: center;
          z-index: 9999;
          box-shadow: 0 8px 30px rgba(11, 75, 37, 0.25);
        }
      `}</style>

      {toastVisible && (
        <div className="toast" role="status" aria-live="polite">
          Verification email sent — check your inbox
        </div>
      )}
    </div>
  );
}
