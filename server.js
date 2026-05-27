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
