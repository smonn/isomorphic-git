export function calculateBasicAuthHeader({ username = '', password = '' }) {
  const credentials = `${username}:${password}`
  // Convert to binary string for btoa (handles ASCII credentials correctly)
  let binary = ''
  const bytes = new TextEncoder().encode(credentials)
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return `Basic ${btoa(binary)}`
}
