import express from "express";
import Stripe from "stripe";
import cors from "cors";

const app = express();
const stripe = new Stripe("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"); // ✅ Replace this with your real Stripe secret key

app.use(cors());

app.use(express.json());

app.post("/create-checkout-session", async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: req.body.cart.map(item => ({
      price_data: {
        currency: "usd",
        product_data: { name: item.name },
        unit_amount: item.price * 100, // Stripe expects cents
      },
      quantity: item.qty,
    })),
    success_url: "http://localhost:3000/success.html",
    cancel_url: "http://localhost:3000/cancel.html",
  });

  res.json({ sessionId: session.id });
});

app.listen(3000, () => console.log("✅ Server running on http://localhost:3000"));

