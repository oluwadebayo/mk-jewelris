import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function VerifyPage() {
  const router = useRouter();
  const { token } = router.query;

  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) return;

    async function verify() {
      setStatus("verifying");
      setMessage("Verifying your account...");

      const res = await fetch(`/api/verify?token=${token}`);

      if (!res.ok) {
        setStatus("error");
        setMessage("Invalid or expired verification link. Please request a new verification email.");
        return;
      }

      setStatus("success");
      setMessage("Email verified! Redirecting to your dashboard...");

      setTimeout(() => router.push("/dashboard"), 1200);
    }

    verify();
  }, [token, router]);

  return (
    <div
      className="verify-fade-in"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "linear-gradient(180deg,#f6fbf8 0%,#f2f6f4 100%)",
        fontFamily:
          "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
      }}
    >
      <div
        className="verify-card-animate"
        style={{
          width: "100%",
          maxWidth: 560,
          background: "#fff",
          padding: 36,
          borderRadius: 12,
          textAlign: "center",
          boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
        }}
      >
        {/* CHECKMARK (only when success) */}
        {status === "success" && (
          <div className="verify-checkmark-container">
            <svg className="verify-checkmark" viewBox="0 0 52 52">
              <circle
                className="verify-checkmark-circle"
                cx="26"
                cy="26"
                r="25"
                fill="none"
              />
              <path
                className="verify-checkmark-check"
                fill="none"
                d="M14 27l7 7 17-17"
              />
            </svg>
          </div>
        )}

        {/* LOADER (while verifying) */}
        {status === "verifying" && <div className="verify-spinner"></div>}

        <h2 style={{ margin: 0, marginBottom: 10 }}>
          {status === "verifying" && "Verifying your account…"}
          {status === "success" && "Email Verified 🎉"}
          {status === "error" && "Verification Failed"}
        </h2>

        <p style={{ color: "#374151" }}>{message}</p>
      </div>
    </div>
  );
}
