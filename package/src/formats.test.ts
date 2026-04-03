import { describe, expect, test } from 'vitest'
import { uint8Format, uint32Format, uint64Format } from './formats.js'
import { createMsgBuilder } from './msg.js'
import { cw20ExecuteSchema, cw20QuerySchema } from './schemas/cw20/index.js'

// ---------------------------------------------------------------------------
// Unit tests for individual format validators
// ---------------------------------------------------------------------------

describe('uint8Format', () => {
  const { validate } = uint8Format

  test('accepts 0 (minimum)', () => {
    expect(validate(0)).toBe(true)
  })

  test('accepts 255 (maximum)', () => {
    expect(validate(255)).toBe(true)
  })

  test('accepts mid-range value', () => {
    expect(validate(128)).toBe(true)
  })

  test('rejects -1 (negative)', () => {
    expect(validate(-1)).toBe(false)
  })

  test('rejects 256 (overflow)', () => {
    expect(validate(256)).toBe(false)
  })

  test('rejects non-integer float', () => {
    expect(validate(1.5)).toBe(false)
  })
})

describe('uint32Format', () => {
  const { validate } = uint32Format

  test('accepts 0 (minimum)', () => {
    expect(validate(0)).toBe(true)
  })

  test('accepts 4294967295 (maximum)', () => {
    expect(validate(4_294_967_295)).toBe(true)
  })

  test('accepts mid-range value', () => {
    expect(validate(100_000)).toBe(true)
  })

  test('rejects -1 (negative)', () => {
    expect(validate(-1)).toBe(false)
  })

  test('rejects 4294967296 (overflow)', () => {
    expect(validate(4_294_967_296)).toBe(false)
  })

  test('rejects non-integer float', () => {
    expect(validate(3.14)).toBe(false)
  })
})

describe('uint64Format', () => {
  const { validate } = uint64Format

  test('accepts 0 (minimum)', () => {
    expect(validate(0)).toBe(true)
  })

  test('accepts Number.MAX_SAFE_INTEGER', () => {
    expect(validate(Number.MAX_SAFE_INTEGER)).toBe(true)
  })

  test('accepts typical block height', () => {
    expect(validate(12_345_678)).toBe(true)
  })

  test('rejects -1 (negative)', () => {
    expect(validate(-1)).toBe(false)
  })

  test('rejects Number.MAX_SAFE_INTEGER + 1 (beyond safe range)', () => {
    expect(validate(Number.MAX_SAFE_INTEGER + 1)).toBe(false)
  })

  test('rejects non-integer float', () => {
    expect(validate(1.1)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Integration: format validation active in createMsgBuilder
// ---------------------------------------------------------------------------

describe('format validation integration', () => {
  const cw20Msg = createMsgBuilder(cw20ExecuteSchema)
  const cw20QueryMsg = createMsgBuilder(cw20QuerySchema)

  test('valid uint64 at_height passes', () => {
    const result = cw20Msg('increase_allowance', {
      amount: '500',
      spender: 'osmo1abc',
      expires: { at_height: 100 },
    })
    expect(result).toEqual({
      increase_allowance: {
        amount: '500',
        spender: 'osmo1abc',
        expires: { at_height: 100 },
      },
    })
  })

  test('negative at_height fails (uint64 violation)', () => {
    expect(() =>
      cw20Msg('increase_allowance', {
        amount: '500',
        spender: 'osmo1abc',
        expires: { at_height: -1 },
      }),
    ).toThrow('Validation failed for "increase_allowance"')
  })

  test('float at_height fails (uint64 violation)', () => {
    expect(() =>
      cw20Msg('increase_allowance', {
        amount: '500',
        spender: 'osmo1abc',
        expires: { at_height: 1.5 },
      }),
    ).toThrow('Validation failed for "increase_allowance"')
  })

  test('valid uint32 limit in query passes', () => {
    const result = cw20QueryMsg('all_accounts', { limit: 10 })
    expect(result).toEqual({ all_accounts: { limit: 10 } })
  })

  test('null limit in query passes (nullable uint32)', () => {
    const result = cw20QueryMsg('all_accounts', { limit: null })
    expect(result).toEqual({ all_accounts: { limit: null } })
  })

  test('negative limit fails (uint32 violation)', () => {
    expect(() =>
      cw20QueryMsg('all_accounts', {
        limit: -1,
      }),
    ).toThrow('Validation failed for "all_accounts"')
  })

  test('float limit fails (uint32 violation)', () => {
    expect(() =>
      cw20QueryMsg('all_accounts', {
        limit: 2.5,
      }),
    ).toThrow('Validation failed for "all_accounts"')
  })
})
