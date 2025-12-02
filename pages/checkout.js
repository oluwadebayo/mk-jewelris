// --- Your existing logic stays here ---
async function handlePaymentSuccess(paymentResult) {
  try {
    const payload = {
      email: currentUser.email,
      userId: currentUser?.id ?? null,
      cart: cartItems,
      amount: totalAmount,
      reference: paymentResult.reference || paymentResult.id || `pay_${Date.now()}`,
      metadata: paymentResult,
    };

    const r = await fetch("/api/orders/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await r.json();

    if (!r.ok) {
      console.error("Order creation failed", json);
      return;
    }

    localStorage.removeItem("cart");

    window.location.href = `/orders/success?ref=${encodeURIComponent(
      json.order.reference
    )}`;
  } catch (err) {
    console.error("Payment success handling error", err);
  }
}

// --- Required Next.js page wrapper ---
export default function CheckoutPage() {
  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h2>Redirecting to checkout…</h2>
    </div>
  );
}
