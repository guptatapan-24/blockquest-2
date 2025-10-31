// In-memory nonce storage (use Redis or database in production)
export const nonceStore = new Map<string, { nonce: string; hash: string; expiry: number }>();

// Clean expired nonces every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of nonceStore.entries()) {
    if (value.expiry < now) {
      nonceStore.delete(key);
    }
  }
}, 5 * 60 * 1000);
