export async function hashPass(str) {
  const msgBuffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function genToken() {
  return "ae_" + crypto.randomUUID().replace(/-/g, '') + Date.now().toString(36);
}

export function genOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function createRawMimeEmail(senderEmail, recipientEmail, subject, bodyText) {
  return `From: Aether Studio <${senderEmail}>\r\n` +
         `To: <${recipientEmail}>\r\n` +
         `Subject: ${subject}\r\n` +
         `Content-Type: text/plain; charset="utf-8"\r\n\r\n` +
         `${bodyText}`;
}
