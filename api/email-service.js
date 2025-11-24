export async function sendEmail(payload) {
  if (!payload?.email) throw new Error('Email requerido');
  return Promise.resolve({ status: 'queued', reference: Date.now() });
}
