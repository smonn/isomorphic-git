import { InternalError } from '../errors/InternalError.js'
import { UnsafeFilepathError } from '../errors/UnsafeFilepathError.js'
import { comparePath } from '../utils/comparePath.js'
import { compareTreeEntryPath } from '../utils/compareTreeEntryPath.js'
import { toHex } from '../utils/toHex.js'
import {
  indexOf,
  decodeUTF8,
  encodeUTF8,
  hexToUint8Array,
  concatUint8Arrays,
} from '../utils/uint8array.js'

/**
 *
 * @typedef {Object} TreeEntry
 * @property {string} mode - the 6 digit hexadecimal mode
 * @property {string} path - the name of the file or directory
 * @property {string} oid - the SHA-1 object id of the blob or tree
 * @property {'commit'|'blob'|'tree'} type - the type of object
 */

function mode2type(mode) {
  // prettier-ignore
  switch (mode) {
    case '040000': return 'tree'
    case '100644': return 'blob'
    case '100755': return 'blob'
    case '120000': return 'blob'
    case '160000': return 'commit'
  }
  throw new InternalError(`Unexpected GitTree entry mode: ${mode}`)
}

function parseBuffer(buffer) {
  const _entries = []
  let cursor = 0
  while (cursor < buffer.length) {
    const space = indexOf(buffer, 32, cursor)
    if (space === -1) {
      throw new InternalError(
        `GitTree: Error parsing buffer at byte location ${cursor}: Could not find the next space character.`
      )
    }
    const nullchar = indexOf(buffer, 0, cursor)
    if (nullchar === -1) {
      throw new InternalError(
        `GitTree: Error parsing buffer at byte location ${cursor}: Could not find the next null character.`
      )
    }
    let mode = decodeUTF8(buffer, cursor, space)
    if (mode === '40000') mode = '040000' // makes it line up neater in printed output
    const type = mode2type(mode)
    const path = decodeUTF8(buffer, space + 1, nullchar)

    // Prevent malicious git repos from writing to "..\foo" on clone etc
    if (path.includes('\\') || path.includes('/')) {
      throw new UnsafeFilepathError(path)
    }

    const oid = toHex(buffer.slice(nullchar + 1, nullchar + 21))
    cursor = nullchar + 21
    _entries.push({ mode, path, oid, type })
  }
  return _entries
}

function limitModeToAllowed(mode) {
  if (typeof mode === 'number') {
    mode = mode.toString(8)
  }
  // tree
  if (mode.match(/^0?4.*/)) return '040000' // Directory
  if (mode.match(/^1006.*/)) return '100644' // Regular non-executable file
  if (mode.match(/^1007.*/)) return '100755' // Regular executable file
  if (mode.match(/^120.*/)) return '120000' // Symbolic link
  if (mode.match(/^160.*/)) return '160000' // Commit (git submodule reference)
  throw new InternalError(`Could not understand file mode: ${mode}`)
}

function nudgeIntoShape(entry) {
  if (!entry.oid && entry.sha) {
    entry.oid = entry.sha // Github
  }
  entry.mode = limitModeToAllowed(entry.mode) // index
  if (!entry.type) {
    entry.type = mode2type(entry.mode) // index
  }
  return entry
}

export class GitTree {
  constructor(entries) {
    if (entries instanceof Uint8Array) {
      this._entries = parseBuffer(entries)
    } else if (Array.isArray(entries)) {
      this._entries = entries.map(nudgeIntoShape)
    } else {
      throw new InternalError('invalid type passed to GitTree constructor')
    }
    // Tree entries are not sorted alphabetically in the usual sense (see `compareTreeEntryPath`)
    // but it is important later on that these be sorted in the same order as they would be returned from readdir.
    this._entries.sort(comparePath)
  }

  static from(tree) {
    return new GitTree(tree)
  }

  render() {
    return this._entries
      .map(entry => `${entry.mode} ${entry.type} ${entry.oid}    ${entry.path}`)
      .join('\n')
  }

  toObject() {
    // Adjust the sort order to match git's
    const entries = [...this._entries]
    entries.sort(compareTreeEntryPath)
    return concatUint8Arrays(
      entries.map(entry => {
        const mode = encodeUTF8(entry.mode.replace(/^0/, ''))
        const space = new Uint8Array([32])
        const path = encodeUTF8(entry.path)
        const nullchar = new Uint8Array([0])
        const oid = hexToUint8Array(entry.oid)
        return concatUint8Arrays([mode, space, path, nullchar, oid])
      })
    )
  }

  /**
   * @returns {TreeEntry[]}
   */
  entries() {
    return this._entries
  }

  *[Symbol.iterator]() {
    for (const entry of this._entries) {
      yield entry
    }
  }
}
