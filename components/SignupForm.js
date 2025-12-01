import Image from "next/image";
import { useState } from "react";
import GoogleAuthButton from "./GoogleAuthButton";

export default function SignupForm() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    company: "",
    email: "",
    password: "",
    agree: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [pendingEmail, setPendingEmail] = useState("");
  const [showResend, setShowResend] = useState(false);

  function validateField(name, value) {
    let error = "";

    if ((name === "firstName" || name === "lastName") && !value.trim()) {
      error = "Required field";
    }

    if (name === "email") {
      if (!value.trim()) error = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        error = "Invalid email format";
    }

    if (name === "password") {
      if (!value.trim()) error = "Password required";
      else if (value.length < 6)
        error = "Password must be at least 6 characters";

      // strength check
      if (value.length >= 6 && value.length < 9) setPasswordStrength("weak");
      if (value.length >= 9 && /[A-Z]/.test(value)) setPasswordStrength("medium");
      if (value.length >= 10 && /[A-Z]/.test(value) && /\W/.test(value))
        setPasswordStrength("strong");
    }

    return error;
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setForm((prev) => ({ ...prev, [name]: newValue }));

    const error = validateField(name, newValue);
    setErrors((prev) => ({ ...prev, [name]: error }));
  }

  // 🔥 NEW — resend verification
  async function handleResend() {
    setSuccessMsg("Sending verification email...");
    setShowResend(false);

    const res = await fetch("/api/resend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: pendingEmail }),
    });

    if (res.ok) {
      setSuccessMsg("Verification email resent! Check your inbox.");
    } else {
      setErrors((prev) => ({ ...prev, form: "Failed to resend email." }));
    }

    setTimeout(() => setSuccessMsg(""), 6000);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const hasErrors = Object.values(errors).some((e) => e);
    if (hasErrors || !form.agree) return;

    setLoading(true);
    setShowResend(false);
    setSuccessMsg("");

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      // 🔥 Handle API errors
      if (!res.ok) {
        if (data.error === "UNVERIFIED_ACCOUNT") {
          setErrors((prev) => ({ ...prev, form: "Your email is not verified." }));
          setPendingEmail(form.email);
          setShowResend(true);
        } else if (data.error === "EMAIL_TAKEN") {
          setErrors((prev) => ({ ...prev, form: "This email already exists." }));
        } else {
          setErrors((prev) => ({ ...prev, form: data.error }));
        }
        setLoading(false);
        return;
      }

      // 🔥 SUCCESS
      setSuccessMsg(
        "🎉 Account created successfully! Check your email to activate your account."
      );

      setForm({
        firstName: "",
        lastName: "",
        company: "",
        email: "",
        password: "",
        agree: false,
      });

      setErrors({});
    } catch {
      setErrors((prev) => ({ ...prev, form: "Server error occurred" }));
    }

    setLoading(false);
    setTimeout(() => setSuccessMsg(""), 6000);
  }

  return (
    <div className="form-box">
      <h2>Create Your Account</h2>

      <GoogleAuthButton variant="signup" redirect="/dashboard" />

      {/* SUCCESS MESSAGE */}
      {successMsg && <div className="success-banner">{successMsg}</div>}

      {/* GLOBAL ERROR */}
      {errors.form && <p className="error-msg">{errors.form}</p>}

      {/* RESEND VERIFICATION */}
      {showResend && (
        <button className="resend-btn" type="button" onClick={handleResend}>
          Resend Verification Email
        </button>
      )}

      <form onSubmit={handleSubmit}>
        {/* FIRST NAME */}
        <div className="input-block">
          <input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            placeholder="First Name *"
            className={errors.firstName ? "input-error" : ""}
          />
          {errors.firstName && (
            <p className="error-text">{errors.firstName}</p>
          )}
        </div>

        {/* LAST NAME */}
        <div className="input-block">
          <input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            placeholder="Last Name *"
            className={errors.lastName ? "input-error" : ""}
          />
          {errors.lastName && (
            <p className="error-text">{errors.lastName}</p>
          )}
        </div>

        {/* COMPANY */}
        <div className="input-block">
          <input
            name="company"
            value={form.company}
            onChange={handleChange}
            placeholder="Company (Optional)"
          />
        </div>

        {/* EMAIL */}
        <div className="input-block">
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email *"
            className={errors.email ? "input-error" : ""}
          />
          {errors.email && <p className="error-text">{errors.email}</p>}
        </div>

        {/* PASSWORD */}
        <div className="input-block password-wrapper">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            placeholder="Password *"
            className={errors.password ? "input-error" : ""}
          />

          <span
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈" : "👁️"}
          </span>

          {errors.password && (
            <p className="error-text">{errors.password}</p>
          )}

          {form.password.length > 0 && (
            <div className={`strength-bar ${passwordStrength}`}>
              {passwordStrength.toUpperCase()}
            </div>
          )}
        </div>

        {/* TERMS */}
        <div className="terms">
          <input
            type="checkbox"
            name="agree"
            checked={form.agree}
            onChange={handleChange}
            id="agree"
          />
          <label htmlFor="agree">I agree to the Terms of Service.</label>
        </div>

        {/* SUBMIT */}
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? <div className="spinner"></div> : "Create Your Account"}
        </button>

        {/* LOGIN REDIRECT */}
        <div className="login-redirect">
          Already have an account? <a href="/login">Login</a>
        </div>
      </form>

      <style jsx>{`
        .form-box {
          background: #fff;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .input-block {
          margin-bottom: 14px;
        }
        input {
          width: 100%;
          padding: 12px;
          border: 1px solid #ccc;
          border-radius: 6px;
        }
        .input-error {
          border-color: red !important;
        }
        .error-text {
          color: red;
          font-size: 0.8rem;
          margin-top: 4px;
        }
        .error-msg {
          background: #ffe5e5;
          padding: 10px;
          border-left: 4px solid red;
          color: #a10000;
          margin-bottom: 15px;
          border-radius: 6px;
        }
        .success-banner {
          background: #e8ffee;
          padding: 12px;
          border-radius: 6px;
          color: #0a7d29;
          font-weight: 600;
          margin: 10px 0;
          animation: slideDown 0.4s ease;
        }
        .resend-btn {
          background: #5a0737;
          color: white;
          width: 100%;
          padding: 10px;
          border-radius: 6px;
          font-weight: 600;
          margin-bottom: 15px;
          cursor: pointer;
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .password-wrapper {
          position: relative;
        }
        .toggle-password {
          position: absolute;
          right: 10px;
          top: 10px;
          cursor: pointer;
          font-size: 20px;
        }
        .strength-bar {
          margin-top: 6px;
          padding: 4px;
          text-align: center;
          border-radius: 4px;
          font-size: 0.8rem;
          color: #fff;
        }
        .weak {
          background: red;
        }
        .medium {
          background: orange;
        }
        .strong {
          background: green;
        }
        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid #fff;
          border-top: 3px solid #0f8a42;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .terms {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        .submit-btn {
          padding: 12px;
          background: #13aa52;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
        }
        .submit-btn:hover {
          background: #0f8a42;
        }
        .login-redirect {
          text-align: center;
          margin-top: 10px;
          font-size: 0.95rem;
        }
        .login-redirect a {
          color: #5a0737;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
