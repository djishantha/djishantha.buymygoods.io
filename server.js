const express = require('express');
const stripe = require('stripe')('sk_test_your_secret_key_here');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware - IMPORTANT: Serve static files BEFORE JSON middleware for HTML
app.use(express.static('.'));
app.use(express.json());

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Create checkout session endpoint
app.post('/create-checkout-session', async (req, res) => {
  try {
    console.log('Received checkout request:', req.body);
    
    const { cart } = req.body;

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Convert cart to Stripe line items
    const lineItems = cart.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          description: item.description,
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.qty,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${getBaseUrl(req)}/success.html`,
      cancel_url: `${getBaseUrl(req)}/cancel.html`,
    });

    console.log('Stripe session created:', session.id);
    
    res.json({ sessionId: session.id });
    
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to create checkout session' 
    });
  }
});

function getBaseUrl(req) {
  return req.headers.origin || `http://localhost:${PORT}`;
}

// Catch-all handler - must be last
app.use('*', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
