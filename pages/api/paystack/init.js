// pages/api/paystack/init.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, amount, reference, cart } = req.body;

  if (!email || !amount || !reference) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const paystackRes = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: amount * 100, // convert to kobo
          reference,

          // ⭐ MUST SEND CART OR VERIFY.JS WILL FAIL
          metadata: {
            cart: cart || [],
          },

          // ⭐ YOUR CORRECT CALLBACK PATH
          callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/paystack-callback`,
        }),
      }
    );

    const data = await paystackRes.json();

    if (!data.status) {
      return res
        .status(400)
        .json({ error: data.message || "Paystack error" });
    }

    return res.status(200).json({
      authorization_url: data.data.authorization_url,
      access_code: data.data.access_code,
      reference: data.data.reference,
    });
  } catch (error) {
    console.error("Paystack Init Error:", error);
    return res.status(500).json({ error: "Payment initialization failed" });
  }
}
