import express from "express";
import Stripe from "stripe";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const stripe = new Stripe("sk_test_51S54lkAUcFfJkzdRvS0aggYwprMHbiatiTOWmlSeKEmrUQ8LjYyYVyt00pRIUD5iYrnwRFUsFFVK7EHXL90mmf1n00lUVn4kSX");

// CORS configuration - MUST come before static files
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Serve static files - MUST come after CORS and JSON
app.use(express.static(__dirname));

// Dynamic base URL for GitHub Codespaces
const BASE_URL = process.env.CODESPACES ? 
  `https://${process.env.CODESPACE_NAME}-3000.app.github.dev` : 
  "http://localhost:3000";

console.log("Base URL:", BASE_URL);

// API Routes - MUST come before static file handling
app.post("/create-checkout-session", async (req, res) => {
  try {
    console.log("Creating checkout session for:", req.body.cart);
    
    if (!req.body.cart || !Array.isArray(req.body.cart)) {
      return res.status(400).json({ error: "Invalid cart data" });
    }
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: req.body.cart.map(item => ({
        price_data: {
          currency: "usd",
          product_data: { 
            name: item.name,
            description: item.description || `Product: ${item.name}`
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.qty,
      })),
      success_url: `${BASE_URL}/success.html`,
      cancel_url: `${BASE_URL}/cancel.html`,
    });

    console.log("Stripe session created:", session.id);
    res.json({ sessionId: session.id });
  } catch (err) {
    console.error("Stripe Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// Test Stripe endpoint
app.get("/test-stripe", (req, res) => {
  res.json({ message: "Stripe endpoint is accessible", timestamp: new Date().toISOString() });
});

// Catch-all handler for SPA - MUST be last
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(3000, '0.0.0.0', () => {
  console.log(`✅ Server running on ${BASE_URL}`);
  console.log(`✅ Health check: ${BASE_URL}/health`);
  console.log(`✅ Test endpoint: ${BASE_URL}/test-stripe`);
  console.log(`✅ Store: ${BASE_URL}/index.html`);
});
