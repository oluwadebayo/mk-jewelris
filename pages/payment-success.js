import { useEffect } from "react";

export default function PaymentSuccess() {
  useEffect(() => {
    localStorage.removeItem("cart");
  }, []);

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h1>Payment Successful 🎉</h1>
      <p>Your order has been confirmed.</p>
    </div>
  );
}
