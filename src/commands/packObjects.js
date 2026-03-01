// @ts-check
import { collect } from '../utils/collect.js'
import { join } from '../utils/join.js'
import { toHex } from '../utils/toHex.js'

import { _pack } from './pack.js'

/**
 *
 * @typedef {Object} PackObjectsResult The packObjects command returns an object with two properties:
 * @property {string} filename - The suggested filename for the packfile if you want to save it to disk somewhere. It includes the packfile SHA.
 * @property {Uint8Array} [packfile] - The packfile contents. Not present if `write` parameter was true, in which case the packfile was written straight to disk.
 */

/**
 * @param {object} args
 * @param {import('../models/FileSystem.js').FileSystem} args.fs
 * @param {any} args.cache
 * @param {string} args.gitdir
 * @param {string[]} args.oids
 * @param {boolean} args.write
 *
 * @returns {Promise<PackObjectsResult>}
 * @see PackObjectsResult
 */
export async function _packObjects({ fs, cache, gitdir, oids, write }) {
  const buffers = await _pack({ fs, cache, gitdir, oids })
  const packfile = await collect(buffers)
  const packfileSha = toHex(packfile.subarray(packfile.length - 20))
  const filename = `pack-${packfileSha}.pack`
  if (write) {
    await fs.write(join(gitdir, `objects/pack/${filename}`), packfile)
    return { filename }
  }
  return {
    filename,
    packfile,
  }
}
