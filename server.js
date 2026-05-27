const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/health',            (_, res) => res.json({ ok: true }));
app.get('/api/warren/health', (_, res) => res.json({ ok: true }));

async function proxyHandler(req, res) {
  try {
    const messages = req.body.messages || [];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: req.body.max_tokens || 1000,
        messages: messages.length ? messages : [{role:'user',content:'Hola'}],
      }),
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || 'Sin respuesta';
    res.json({ content: [{ type: 'text', text }] });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

app.post('/api/warren', proxyHandler);
app.post('/',           proxyHandler);

app.listen(3001, () => console.log('Servidor activo'));
