import { useRouter } from "next/router";
import { useEffect } from "react";

export default function CallbackPage() {
  const router = useRouter();
  const { reference } = router.query;

  useEffect(() => {
    if (!reference) return;

    async function verifyPayment() {
      try {
        const res = await fetch(`/api/paystack/verify?reference=${reference}`);
        const data = await res.json();

        if (res.ok) {
          router.push(`/dashboard/cart/success?ref=${reference}`);
        } else {
          router.push("/dashboard/cart?error=verification_failed");
        }
      } catch (e) {
        router.push("/dashboard/cart?error=network_error");
      }
    }

    verifyPayment();
  }, [reference]);

  return (
    <div className="callback-wrapper">
      <div className="spinner"></div>
      <h2>Verifying your payment…</h2>

      <style jsx>{`
        .callback-wrapper {
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 20px;
        }

        .spinner {
          width: 80px;
          height: 80px;
          border: 6px solid #ddd;
          border-top-color: #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
