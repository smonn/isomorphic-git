// Byte-to-hex lookup table, lazy-initialized to preserve tree-shaking.
// Using a pre-computed table avoids per-byte toString(16) calls and
// matches native Buffer.toString('hex') performance.
let _hexLookup

export function toHex(buffer) {
  if (!_hexLookup) {
    _hexLookup = new Array(256)
    for (let i = 0; i < 256; i++) _hexLookup[i] = i.toString(16).padStart(2, '0')
  }
  const arr = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  let hex = ''
  for (let i = 0; i < arr.length; i++) hex += _hexLookup[arr[i]]
  return hex
}
