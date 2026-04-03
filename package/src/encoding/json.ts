/**
 * Platform-neutral encoding utilities for CosmWasm message fields.
 *
 * Base64 implementation adapted from ox (MIT, weth LLC)
 * @see https://github.com/wevm/ox/blob/658ecc6/src/core/Base64.ts
 */

const textEncoder = /*#__PURE__*/ new TextEncoder()
const textDecoder = /*#__PURE__*/ new TextDecoder()

// Base64 lookup table (same approach as ox)
const integerToCharacter = /*#__PURE__*/ Object.fromEntries(
  Array.from(
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
  ).map((c, i) => [i, c.charCodeAt(0)]),
)

function utf8Encode(str: string): Uint8Array {
  return textEncoder.encode(str)
}

function utf8Decode(bytes: Uint8Array): string {
  return textDecoder.decode(bytes)
}

function base64Encode(bytes: Uint8Array): string {
  const encoded = new Uint8Array(Math.ceil(bytes.length / 3) * 4)

  for (let i = 0, j = 0; j < bytes.length; i += 4, j += 3) {
    const y =
      (bytes[j]! << 16) + ((bytes[j + 1] ?? 0) << 8) + (bytes[j + 2] ?? 0)
    encoded[i] = integerToCharacter[y >> 18]!
    encoded[i + 1] = integerToCharacter[(y >> 12) & 0x3f]!
    encoded[i + 2] = integerToCharacter[(y >> 6) & 0x3f]!
    encoded[i + 3] = integerToCharacter[y & 0x3f]!
  }

  const remainder = bytes.length % 3
  const end = Math.floor(bytes.length / 3) * 4 + (remainder && remainder + 1)
  let base64 = textDecoder.decode(new Uint8Array(encoded.buffer, 0, end))
  if (remainder === 1) base64 += '=='
  if (remainder === 2) base64 += '='
  return base64
}

// ---------------------------------------------------------------------------
// Public API: Json namespace
// ---------------------------------------------------------------------------

export const Json = {
  /**
   * Encode a JSON-serializable object to UTF-8 bytes.
   *
   * Use for `MsgExecuteContract.msg` and `queryData` fields.
   *
   * @example
   * ```ts
   * import { Json } from 'schemos/encoding'
   *
   * const envelope = cw20Msg('transfer', { amount: '1000', recipient: 'osmo1...' })
   * MsgExecuteContract.fromPartial({
   *   sender, contract,
   *   msg: Json.toBytes(envelope),
   *   funds: [],
   * })
   * ```
   */
  toBytes(value: Record<string, unknown>): Uint8Array {
    return utf8Encode(JSON.stringify(value))
  },

  /**
   * Encode a JSON-serializable object to a base64 string.
   *
   * Use for CosmWasm `Binary` fields (e.g. cw20 `send` msg hook).
   *
   * @example
   * ```ts
   * import { Json } from 'schemos/encoding'
   *
   * cw20Msg('send', {
   *   amount: '1000',
   *   contract: 'osmo1...',
   *   msg: Json.toBase64({ some_hook: { action: 'swap' } }),
   * })
   * ```
   */
  toBase64(value: Record<string, unknown>): string {
    return base64Encode(utf8Encode(JSON.stringify(value)))
  },

  /**
   * Decode UTF-8 bytes to a JSON object.
   *
   * Use for decoding query responses from telescope RPC.
   *
   * @example
   * ```ts
   * import { Json } from 'schemos/encoding'
   *
   * const res = await rpc.cosmwasm.wasm.v1.smartContractState({ address, queryData })
   * const result = Json.fromBytes(res.data)
   * ```
   */
  fromBytes(bytes: Uint8Array): unknown {
    return JSON.parse(utf8Decode(bytes))
  },
} as const
