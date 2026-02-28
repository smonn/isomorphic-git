const encoder = new TextEncoder()
const decoder = new TextDecoder()

/** Encode a string to UTF-8 Uint8Array */
export function encodeUTF8(str) {
  return encoder.encode(str)
}

/** Decode a Uint8Array (or subarray) to a UTF-8 string */
export function decodeUTF8(buf, start, end) {
  if (start !== undefined || end !== undefined) {
    buf = buf.subarray(start, end)
  }
  return decoder.decode(buf)
}

/** Convert a hex string to Uint8Array */
export function hexToUint8Array(hex) {
  const arr = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    arr[i / 2] = parseInt(hex.substring(i, i + 2), 16)
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
