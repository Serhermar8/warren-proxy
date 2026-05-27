// server.js — versión CommonJS (compatible con Node 24)
const express = require('express');
const cors = require('cors');
require('dotenv/config');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// Health check
app.get('/api/warren/health', (_, res) => res.json({ ok: true }));

// Proxy seguro hacia Anthropic
app.post('/api/warren', async (req, res) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => console.log('✅ Warren proxy en http://localhost:3001'));
