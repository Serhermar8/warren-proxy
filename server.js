const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// Health checks — todas las variantes que puede pedir la app
app.get('/health',            (_, res) => res.json({ ok: true }));
app.get('/api/warren/health', (_, res) => res.json({ ok: true }));

// Proxy hacia Anthropic — acepta POST en ambas rutas
async function proxyHandler(req, res) {
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
}

app.post('/api/warren', proxyHandler);
app.post('/',           proxyHandler);

app.listen(3001, () => console.log('Servidor activo'));
