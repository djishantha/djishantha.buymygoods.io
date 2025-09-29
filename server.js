import express from "express";
import Stripe from "stripe";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const stripe = new Stripe("sk_test_51S54lkAUcFfJkzdRvS0aggYwprMHbiatiTOWmlSeKEmrUQ8LjYyYVyt00pRIUD5iYrnwRFUsFFVK7EHXL90mmf1n00lUVn4kSX"); // your test secret key

// Middleware
app.use(cors());
app.use(express.json());

// Static files (frontend)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

// Codespaces URL (update if needed)
const BASE_URL = "https://curly-computing-machine-q7g4x6xrvqj5h45qr-3000.app.github.dev";

// Stripe checkout session
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

// Start server
app.listen(3000, "0.0.0.0", () => {
  console.log(`✅ Server running at ${BASE_URL}`);
});
