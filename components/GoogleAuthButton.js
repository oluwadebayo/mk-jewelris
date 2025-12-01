import { useState } from "react"
import { signIn } from "next-auth/react"
import Image from "next/image"

export default function GoogleAuthButton({
  variant = "signin",
  redirect = "/dashboard"
}) {
  const [loading, setLoading] = useState(false)

  const textMap = {
    signin: "Sign in with Google",
    signup: "Sign up with Google",
    continue: "Continue with Google"
  }

  async function handleGoogle() {
    setLoading(true)
    await signIn("google", { callbackUrl: redirect })
  }

  return (
    <>
      <button
        type="button"
        onClick={handleGoogle}
        className="google-auth-btn"
        disabled={loading}
      >
        {loading ? (
          <div className="spinner"></div>
        ) : (
          <Image
            src="/google-logo.jpg"
            alt="Google logo"
            width={20}
            height={20}
          />
        )}
        {textMap[variant]}
      </button>

      <style jsx>{`
        .google-auth-btn {
          width: 100%;
          padding: 14px 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: #fff;
          border: 2px solid #e5c074; /* gold */
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
          color: #5a0737; /* deep jewel purple */
          transition: 0.25s ease;
          box-shadow: 0 3px 12px rgba(90, 7, 55, 0.15);
        }

        .google-auth-btn:hover:not(:disabled) {
          background: #fff7ea;
          border-color: #d4b066;
          transform: translateY(-2px);
        }

        .google-auth-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 3px solid #e5c074;
          border-top: 3px solid #5a0737;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  )
}
