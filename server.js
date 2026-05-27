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
    const system = req.body.system || '';

    // Convierte formato Anthropic → Gemini
    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const systemInstruction = system
      ? { parts: [{ text: system }] }
      : undefined;

    const body = {
      contents,
      ...(systemInstruction && { system_instruction: systemInstruction }),
      generationConfig: { maxOutputTokens: req.body.max_tokens || 1000 }
    };

    const key = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    // Convierte respuesta Gemini → formato Anthropic para que la app no note el cambio
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sin respuesta';
    res.json({ content: [{ type: 'text', text }] });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

app.post('/api/warren', proxyHandler);
app.post('/',           proxyHandler);

app.listen(3001, () => console.log('Servidor activo'));
