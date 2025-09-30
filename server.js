const express = require('express');
const stripe = require('stripe')('sk_test_your_secret_key_here');
const app = express();
const PORT = 4242;

app.use(express.json());
app.use(express.static('..')); // Adjust path to your HTML file

app.post('/create-checkout-session', async (req, res) => {
  try {
    const { cart } = req.body;
    
    const lineItems = cart.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          description: item.description,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.qty,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `http://localhost:${PORT}/success.html`,
      cancel_url: `http://localhost:${PORT}/cancel.html`,
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
