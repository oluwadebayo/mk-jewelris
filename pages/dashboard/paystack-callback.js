// pages/dashboard/paystack-callback.js
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function PaystackCallback() {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return; // FIX 1 — wait for router to load

    const reference = router.query.reference;
    if (!reference) return;

    async function verifyPayment() {
      try {
        const res = await fetch(`/api/paystack/verify?reference=${reference}`);
        const data = await res.json();

        if (data?.status === "success") {
          // FIX 2 — clear cart safely
          try {
            localStorage.removeItem("cart");
          } catch (e) {}

          router.replace("/dashboard/payment-success");
        } else {
          router.replace("/dashboard/payment-failed");
        }
      } catch (error) {
        router.replace("/dashboard/payment-failed");
      }
    }

    verifyPayment();
  }, [router.isReady, router.query.reference]); // FIX 3 — depend on isReady

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h2>Processing payment...</h2>
      <p>Please wait...</p>
    </div>
  );
}
