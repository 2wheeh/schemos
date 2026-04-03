import { describe, expect, test } from 'vitest'
import { Json } from './json.js'

describe('Json.toBytes', () => {
  test('encodes object to JSON UTF-8 bytes', () => {
    const bytes = Json.toBytes({ transfer: { amount: '1000' } })
    expect(bytes).toBeInstanceOf(Uint8Array)
    expect(JSON.parse(new TextDecoder().decode(bytes))).toEqual({
      transfer: { amount: '1000' },
    })
  })

  test('encodes empty object', () => {
    const bytes = Json.toBytes({ token_info: {} })
    expect(JSON.parse(new TextDecoder().decode(bytes))).toEqual({
      token_info: {},
    })
  })
})

describe('Json.toBase64', () => {
  test('encodes object to base64 string', () => {
    const b64 = Json.toBase64({ some_hook: { action: 'swap' } })
    // Verify roundtrip via atob
    expect(JSON.parse(atob(b64))).toEqual({ some_hook: { action: 'swap' } })
  })

  test('handles padding correctly', () => {
    // Different object sizes produce different padding
    const b64_1 = Json.toBase64({ a: 1 })
    expect(b64_1).toMatch(/^[A-Za-z0-9+/]+=*$/)

    const b64_2 = Json.toBase64({ ab: 12 })
    expect(b64_2).toMatch(/^[A-Za-z0-9+/]+=*$/)
  })

  test('produces valid base64 for cw20 send msg pattern', () => {
    const hookMsg = { execute_swap: { offer_asset: 'uosmo' } }
    const b64 = Json.toBase64(hookMsg)
    expect(JSON.parse(atob(b64))).toEqual(hookMsg)
  })
})

describe('Json.fromBytes', () => {
  test('decodes UTF-8 bytes to object', () => {
    const original = { balance: '1000' }
    const bytes = new TextEncoder().encode(JSON.stringify(original))
    expect(Json.fromBytes(bytes)).toEqual(original)
  })

  test('roundtrips with Json.toBytes', () => {
    const original = { transfer: { amount: '1000', recipient: 'osmo1abc' } }
    const bytes = Json.toBytes(original)
    expect(Json.fromBytes(bytes)).toEqual(original)
  })
})
