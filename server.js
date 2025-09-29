import express from "express";
import Stripe from "stripe";
import cors from "cors";

const app = express();
const stripe = new Stripe("sk_test_51S54lkAUcFfJkzdRvS0aggYwprMHbiatiTOWmlSeKEmrUQ8LjYyYVyt00pRIUD5iYrnwRFUsFFVK7EHXL90mmf1n00lUVn4kSX"); // Replace with test key

app.use(cors());
app.use(express.json());

// Replace with your own Codespaces URL:
const BASE_URL = "https://curly-computing-machine-q7g4x6xrvqj5h45qr-3000.app.github.dev";

app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: req.body.cart.map(item => ({
        price_data: {
          currency: "usd",
          product_data: { name: item.name },
          unit_amount: item.price * 100,
        },
        quantity: item.qty,
      })),
      success_url: `${BASE_URL}/success.html`,
      cancel_url: `${BASE_URL}/cancel.html`,
    });

    res.json({ sessionId: session.id });
  } catch (err) {
    console.error("Stripe Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, '0.0.0.0', () => {
  console.log(`✅ Server running on http://localhost:3000`);
});


