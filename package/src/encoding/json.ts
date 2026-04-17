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

const characterToInteger = /*#__PURE__*/ Object.fromEntries(
  Array.from(
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
  ).map((c, i) => [c.charCodeAt(0), i]),
)

function utf8Encode(str: string): Uint8Array {
  return textEncoder.encode(str)
}

function utf8Decode(bytes: Uint8Array): string {
  return textDecoder.decode(bytes)
}

function base64Decode(b64: string): Uint8Array {
  const withoutPadding = b64.replace(/=+$/, '')
  const length = Math.floor((withoutPadding.length * 3) / 4)
  const decoded = new Uint8Array(length)

  for (let i = 0, j = 0; i < withoutPadding.length; i += 4, j += 3) {
    const a = characterToInteger[withoutPadding.charCodeAt(i)]! << 18
    const b = (characterToInteger[withoutPadding.charCodeAt(i + 1)] ?? 0) << 12
    const c = (characterToInteger[withoutPadding.charCodeAt(i + 2)] ?? 0) << 6
    const d = characterToInteger[withoutPadding.charCodeAt(i + 3)] ?? 0
    const y = a | b | c | d
    decoded[j] = (y >> 16) & 0xff
    if (j + 1 < length) decoded[j + 1] = (y >> 8) & 0xff
    if (j + 2 < length) decoded[j + 2] = y & 0xff
  }

  return decoded
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

  /**
   * Decode a base64 string to a JSON object.
   *
   * Use for decoding CosmWasm `Binary` response fields (e.g. cw20 send hook
   * messages on the receiving contract).
   *
   * @example
   * ```ts
   * import { Json } from 'schemos/encoding'
   *
   * // Decode the `msg` field from a cw20 Receive callback
   * const hookMsg = Json.fromBase64(receiveMsg.msg)
   * // hookMsg => { execute_swap: { offer_asset: 'uosmo' } }
   * ```
   */
  fromBase64(b64string: string): unknown {
    return JSON.parse(utf8Decode(base64Decode(b64string)))
  },
} as const
