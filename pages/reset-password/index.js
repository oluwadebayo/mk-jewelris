import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
const [email, setEmail] = useState("");
const [loading, setLoading] = useState(false);
const [message, setMessage] = useState("");

const handleSubmit = async (e) => {
e.preventDefault();
setLoading(true);
setMessage("");

```
try {
  const res = await fetch("/api/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();

  if (res.ok) {
    setMessage("Password reset link has been sent to your email.");
  } else {
    setMessage(data.error || "Something went wrong.");
  }
} catch (err) {
  setMessage("Network error. Try again.");
}

setLoading(false);
```

};

return ( <div className="page-container"> <div className="card"> <h2 className="title">Reset Password</h2>

```
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Enter your email"
        className="input"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <button type="submit" className="button" disabled={loading}>
        {loading ? "Sending..." : "Send Reset Link"}
      </button>

      {message && <p className="message">{message}</p>}
    </form>

    <p className="small-text">
      Remember your password?{" "}
      <Link href="/login" className="link">
        Login
      </Link>
    </p>
  </div>

  <style jsx>{`
    .page-container {
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #f6faf7;
      padding: 20px;
    }

    .card {
      width: 100%;
      max-width: 420px;
      background: white;
      padding: 40px 32px;
      border-radius: 16px;
      box-shadow: 0 10px 35px rgba(0, 0, 0, 0.08);
      text-align: center;
    }

    .title {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 25px;
      color: #222;
    }

    .input {
      width: 100%;
      padding: 14px;
      margin-bottom: 15px;
      border: 1px solid #d8e3dd;
      border-radius: 8px;
      background: #eef5f1;
      font-size: 15px;
    }

    .button {
      width: 100%;
      padding: 14px;
      margin-top: 5px;
      background: #1faa59;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 15px;
      font-weight: 500;
      transition: 0.25s ease;
    }

    .button:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .button:hover:not(:disabled) {
      background: #179349;
    }

    .message {
      margin-top: 12px;
      font-size: 14px;
      color: #444;
    }

    .small-text {
      margin-top: 20px;
      font-size: 14px;
      color: #777;
    }

    .link {
      color: #1677ff;
      text-decoration: none;
    }

    .link:hover {
      text-decoration: underline;
    }
  `}</style>
</div>
);
}