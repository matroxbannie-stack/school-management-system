// Lightweight session token: base64(JSON). No server-side session store needed.
// Uses atob/btoa (Web APIs) so this file works in both the Edge middleware
// runtime and normal Node.js API routes / server components.
export function encodeSession(payload) {
  return btoa(encodeURIComponent(JSON.stringify(payload)));
}

export function decodeSession(value) {
  if (!value) return null;
  try {
    return JSON.parse(decodeURIComponent(atob(value)));
  } catch {
    return null;
  }
}
