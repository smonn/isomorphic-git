// Modeled after https://github.com/tjfontaine/node-buffercursor
// but with the goal of being much lighter weight.
import { decodeUTF8, encodeUTF8, hexToUint8Array } from './uint8array.js'
import { toHex } from './toHex.js'

export class BufferCursor {
  constructor(buffer) {
    this.buffer =
      buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
    this._view = new DataView(
      this.buffer.buffer,
      this.buffer.byteOffset,
      this.buffer.byteLength
    )
    this._start = 0
  }

  eof() {
    return this._start >= this.buffer.length
  }

  tell() {
    return this._start
  }

  seek(n) {
    this._start = n
  }

  slice(n) {
    const r = this.buffer.subarray(this._start, this._start + n)
    this._start += n
    return r
  }

  toString(enc, length) {
    const bytes = this.buffer.subarray(this._start, this._start + length)
    this._start += length
    if (enc === 'hex') return toHex(bytes)
    return decodeUTF8(bytes)
  }

  write(value, length, enc) {
    if (enc === 'hex') {
      const bytes = hexToUint8Array(value)
      this.buffer.set(bytes, this._start)
    } else {
      const bytes = encodeUTF8(value)
      this.buffer.set(bytes.subarray(0, length), this._start)
    }
    this._start += length
    return length
  }

  copy(source, start, end) {
    const slice =
      start !== undefined || end !== undefined
        ? source.subarray(start, end)
        : source
    this.buffer.set(slice, this._start)
    this._start += slice.length
    return slice.length
  }

  readUInt8() {
    const r = this._view.getUint8(this._start)
    this._start += 1
    return r
  }

  writeUInt8(value) {
    this._view.setUint8(this._start, value)
    this._start += 1
  }

  readUInt16BE() {
    const r = this._view.getUint16(this._start, false)
    this._start += 2
    return r
  }

  writeUInt16BE(value) {
    this._view.setUint16(this._start, value, false)
    this._start += 2
  }

  readUInt32BE() {
    const r = this._view.getUint32(this._start, false)
    this._start += 4
    return r
  }

  writeUInt32BE(value) {
    this._view.setUint32(this._start, value, false)
    this._start += 4
  }
}
