// pages/reset-password/new.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function ResetPasswordNew() {
  const router = useRouter();
  const { token: queryToken } = router.query;

  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState("error");

  useEffect(() => {
    if (queryToken) setToken(queryToken);
  }, [queryToken]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!token) {
      setMsgType("error");
      setMessage("Missing token.");
      return;
    }
    if (password.length < 6) {
      setMsgType("error");
      setMessage("Password must be at least 6 characters.");
      return;
    }
    if (password !== passwordConfirm) {
      setMsgType("error");
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const resp = await fetch("/api/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await resp.json().catch(() => ({}));

      if (resp.ok) {
        setMsgType("success");
        setMessage("Password updated. Redirecting to login...");
        setTimeout(() => router.push("/login"), 1400);
      } else {
        setMsgType("error");
        setMessage(data?.error || data?.message || "Failed to reset password");
      }
    } catch (err) {
      setMsgType("error");
      setMessage("Network error while resetting password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrapper">
      <div className="login-card" role="main" aria-labelledby="reset-title">
        <h2 id="reset-title" className="title">Reset Password</h2>

        {message && <div className={`alert ${msgType}`}>{message}</div>}

        <form onSubmit={handleSubmit} className="form">
          <label className="visually-hidden" htmlFor="password">New password</label>
          <input id="password" name="password" type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} required />

          <label className="visually-hidden" htmlFor="passwordConfirm">Confirm password</label>
          <input id="passwordConfirm" name="passwordConfirm" type="password" placeholder="Confirm password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} required />

          <button disabled={loading} type="submit">{loading ? "Updating..." : "Update password"}</button>
        </form>

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
            box-shadow: 0 10px 30px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.6);
            border: 1px solid rgba(16,24,40,0.04);
          }
          .title { text-align:left; font-size:24px; margin:0 0 18px 0; font-weight:700; color:#0f1724; letter-spacing:-0.2px; }
          .form { display:flex; flex-direction:column; gap:12px; }
          input { width:100%; padding:12px 14px; border:1px solid #e3e7ea; border-radius:10px; font-size:15px; color:#0f1724; background:linear-gradient(180deg,#ffffff 0%,#fbfcfd 100%); }
          input:focus { outline:none; border-color:#66bb6a; box-shadow:0 6px 18px rgba(102,187,106,0.12); transform:translateY(-2px); }
          button { width:100%; padding:12px 14px; background:linear-gradient(180deg,#16b556 0%,#0f8a42 100%); border:none; border-radius:10px; color:#fff; font-weight:700; font-size:15px; cursor:pointer; box-shadow:0 8px 18px rgba(16,24,40,0.08); }
          .alert { padding:10px 12px; border-radius:10px; margin-bottom:12px; font-size:14px; text-align:left; }
          .error { background: linear-gradient(180deg,#fff5f5 0%,#fff7f7 100%); border:1px solid rgba(217,70,60,0.12); color:#922626; }
          .success { background: linear-gradient(180deg,#f2fbf6 0%,#f5fdf8 100%); border:1px solid rgba(34,197,94,0.12); color:#165e3b; }
          .visually-hidden { position:absolute !important; height:1px; width:1px; overflow:hidden; clip:rect(1px,1px,1px,1px); white-space:nowrap; }
          @media (max-width:480px) { .login-card { padding:28px 18px; border-radius:12px } .title { font-size:20px } }
        `}</style>
      </div>
    </div>
  );
}
