import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function PaymentVerifyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Verifying payment...");

  useEffect(() => {
    if (!router.isReady) return;

    const reference = router.query.reference;
    if (!reference) {
      setMessage("Missing payment reference");
      setLoading(false);
      return;
    }

    async function verifyPayment() {
      try {
        const res = await fetch(`/api/paystack/verify?reference=${reference}`);
        const data = await res.json();

        if (!res.ok) {
          setMessage(data.error || "Payment failed");
          setLoading(false);
          return;
        }

        // 🔥 Clear frontend localStorage cart
        localStorage.removeItem("cart");

        // 🔥 Redirect to success page
        router.replace(`/dashboard/orders?ref=${reference}`);
      } catch (err) {
        console.error(err);
        setMessage("Verification error");
        setLoading(false);
      }
    }

    verifyPayment();
  }, [router]);

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h2>{loading ? "Please wait..." : message}</h2>
    </div>
  );
}
