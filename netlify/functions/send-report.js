// Netlify Function: invia il rapportino PDF via email usando Resend.
// Configurazione richiesta (Netlify → Site settings → Environment variables):
//   RESEND_API_KEY   la tua API key di Resend (https://resend.com)
//   MAIL_FROM        mittente verificato, es. "Rapportini <rapportini@tuodominio.it>"
//   MAIL_BCC         (facoltativo) copia nascosta, es. il tuo indirizzo aziendale
//
// L'app invia un POST JSON: { to, subject, text, filename, pdfBase64 }

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const { to, subject, text, filename, pdfBase64 } = JSON.parse(event.body || '{}');

    if (!to) return { statusCode: 400, body: JSON.stringify({ error: 'Email cliente mancante' }) };
    if (!pdfBase64) return { statusCode: 400, body: JSON.stringify({ error: 'PDF mancante' }) };

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.MAIL_FROM;
    if (!apiKey || !from) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Server email non configurato (RESEND_API_KEY / MAIL_FROM)' }) };
    }

    const payload = {
      from,
      to: [to],
      subject: subject || 'Rapportino di intervento',
      text: text || 'In allegato il rapportino di intervento.',
      attachments: [{ filename: filename || 'rapportino.pdf', content: pdfBase64 }],
    };
    if (process.env.MAIL_BCC) payload.bcc = [process.env.MAIL_BCC];

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const detail = await res.text();
      return { statusCode: 502, body: JSON.stringify({ error: 'Invio fallito', detail }) };
    }
    const data = await res.json();
    return { statusCode: 200, body: JSON.stringify({ ok: true, id: data.id }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: String(err && err.message || err) }) };
  }
};
