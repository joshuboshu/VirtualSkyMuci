// Netlify Function: send-poster
// Sends an email with a PNG attachment using Resend API
// Env vars required: RESEND_API_KEY, FROM_EMAIL

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { to, subject, message, filename = 'mapa-estelar.png', imageBase64 } = JSON.parse(event.body || '{}');
    if (!to || !imageBase64) {
      return { statusCode: 400, body: 'Missing to or imageBase64' };
    }

    const API_KEY = process.env.RESEND_API_KEY;
    const FROM_EMAIL = process.env.FROM_EMAIL || 'no-reply@example.com';
    if (!API_KEY) {
      return { statusCode: 500, body: 'Server not configured (RESEND_API_KEY missing)' };
    }

    const payload = {
      from: FROM_EMAIL,
      to: [to],
      subject: subject || 'Tu mapa estelar — MuCi',
      html:
        `<div style="font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif">` +
        `<p>${message || 'Adjuntamos tu mapa estelar.'}</p>` +
        `<p>MuCi • Este correo fue enviado automáticamente.</p>` +
        `</div>`,
      attachments: [
        {
          filename,
          content: imageBase64,
          contentType: 'image/png',
        },
      ],
    };

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const txt = await res.text();
      return { statusCode: res.status, body: txt };
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return { statusCode: 500, body: err?.message || 'Unknown error' };
  }
};


