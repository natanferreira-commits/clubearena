import 'server-only';

/** Envia texto pelo WhatsApp via Z-API. Sem credenciais, só registra no log. */
export async function enviarWhatsApp(telefone: string, mensagem: string): Promise<boolean> {
  const id = process.env.ZAPI_INSTANCE_ID;
  const token = process.env.ZAPI_TOKEN;
  if (!id || !token) {
    console.info(`[whatsapp:simulado] ${telefone}: ${mensagem}`);
    return false;
  }
  try {
    const r = await fetch(`https://api.z-api.io/instances/${id}/token/${token}/send-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(process.env.ZAPI_CLIENT_TOKEN ? { 'Client-Token': process.env.ZAPI_CLIENT_TOKEN } : {}) },
      body: JSON.stringify({ phone: telefone, message: mensagem }),
    });
    if (!r.ok) console.error('[whatsapp]', r.status, await r.text());
    return r.ok;
  } catch (e) {
    console.error('[whatsapp]', e);
    return false;
  }
}

export const whatsappConfigurado = () => !!(process.env.ZAPI_INSTANCE_ID && process.env.ZAPI_TOKEN);
