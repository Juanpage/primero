export async function createCheckoutSession(payload) {
  return Promise.resolve({
    checkoutUrl: payload?.url || 'https://www.wetravel.com',
    status: 'mocked'
  });
}
