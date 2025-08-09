// Vercel Serverless Function: send-poster
// Sends an email with PNG attachment using Resend API

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }
  const { to, subject, message, filename = 'mapa-estelar.png', imageBase64 } = req.body || {};
  if (!to || !imageBase64) {
    return res.status(400).send('Missing to or imageBase64');
  }
  const API_KEY = process.env.RESEND_API_KEY;
  const FROM_EMAIL = process.env.FROM_EMAIL || 'no-reply@example.com';
  if (!API_KEY) {
    return res.status(500).send('Server not configured (RESEND_API_KEY missing)');
  }
  const payload = {
    from: FROM_EMAIL,
    to: [to],
    subject: subject || 'Tu mapa estelar — MuCi',
    html: `<div style="font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif"><p>${message || 'Adjuntamos tu mapa estelar.'}</p><p>MuCi • Este correo fue enviado automáticamente.</p></div>`,
    attachments: [
      { filename, content: imageBase64, contentType: 'image/png' }
    ],
  };
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
  });
  const text = await r.text();
  return res.status(r.ok ? 200 : r.status).send(text);
}


