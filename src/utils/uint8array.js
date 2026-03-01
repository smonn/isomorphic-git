let _encoder
let _decoder

/** Encode a string to UTF-8 Uint8Array */
export function encodeUTF8(str) {
  if (!_encoder) _encoder = new TextEncoder()
  return _encoder.encode(str)
}

/** Decode a Uint8Array (or subarray) to a UTF-8 string */
export function decodeUTF8(buf, start, end) {
  if (!_decoder) _decoder = new TextDecoder()
  if (start !== undefined || end !== undefined) {
    buf = buf.subarray(start, end)
  }
  return _decoder.decode(buf)
}

/**
 * Convert a hex string to Uint8Array.
 * Uses a charCode-to-nibble lookup table for performance (6x faster than
 * parseInt per pair). Lazy-initialized to preserve tree-shaking.
 */
let _hexVal

export function hexToUint8Array(hex) {
  if (!_hexVal) {
    // Map ASCII char codes to their hex nibble values:
    //   '0'-'9' (codes 48-57)  -> 0-9
    //   'a'-'f' (codes 97-102) -> 10-15
    //   'A'-'F' (codes 65-70)  -> 10-15
    _hexVal = new Uint8Array(128)
    for (let i = 0; i < 10; i++) _hexVal[48 + i] = i
    for (let i = 0; i < 6; i++) {
      _hexVal[97 + i] = 10 + i
      _hexVal[65 + i] = 10 + i
    }
  }
  const arr = new Uint8Array(hex.length >> 1)
  for (let i = 0; i < arr.length; i++) {
    arr[i] =
      (_hexVal[hex.charCodeAt(i * 2)] << 4) |
      _hexVal[hex.charCodeAt(i * 2 + 1)]
  }
  return arr
}

/** Concatenate multiple Uint8Arrays into one */
export function concatUint8Arrays(arrays) {
  let totalLength = 0
  for (const arr of arrays) {
    totalLength += arr.length
  }
  const result = new Uint8Array(totalLength)
  let offset = 0
  for (const arr of arrays) {
    result.set(arr, offset)
    offset += arr.length
  }
  return result
}

/** Find the index of a byte value in a Uint8Array */
export function indexOf(arr, byte, fromIndex = 0) {
  for (let i = fromIndex; i < arr.length; i++) {
    if (arr[i] === byte) return i
  }
  return -1
}
