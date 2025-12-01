// Example: after your payment provider returns success
async function handlePaymentSuccess(paymentResult) {
  try {
    const payload = {
      email: currentUser.email, // or paymentResult.receipt_email
      userId: currentUser?.id ?? null,
      cart: cartItems, // your current cart payload (items, qty, price)
      amount: totalAmount,
      reference: paymentResult.reference || paymentResult.id || `pay_${Date.now()}`,
      metadata: paymentResult, // optional: pass provider response
    };

    const r = await fetch("/api/orders/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await r.json();

    if (!r.ok) {
      console.error("Order creation failed", json);
      // show error to user, retry logic, etc.
      return;
    }

    // Clear front-end persisted cart (localStorage/session/cookie)
    localStorage.removeItem("cart"); // or your cart key
    // Update any global state (Redux/Context)
    // e.g. dispatch({ type: 'CART_CLEAR' })

    // Redirect to order success page
    window.location.href = `/orders/success?ref=${encodeURIComponent(json.order.reference)}`;
  } catch (err) {
    console.error("Payment success handling error", err);
  }
}
