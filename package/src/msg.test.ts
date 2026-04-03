import { Ajv } from 'ajv'
import { describe, expect, test, vi } from 'vitest'
import { buildMsg, createMsgBuilder } from './msg.js'
import { cw20ExecuteSchema, cw20QuerySchema } from './schemas/cw20/index.js'

describe('createMsgBuilder', () => {
  const cw20Msg = createMsgBuilder(cw20ExecuteSchema)
  const cw20QueryMsg = createMsgBuilder(cw20QuerySchema)

  test('returns correct envelope for valid execute message', () => {
    const result = cw20Msg('transfer', {
      amount: '1000',
      recipient: 'osmo1abc',
    })
    expect(result).toEqual({
      transfer: { amount: '1000', recipient: 'osmo1abc' },
    })
  })

  test('returns correct envelope for burn', () => {
    const result = cw20Msg('burn', { amount: '500' })
    expect(result).toEqual({ burn: { amount: '500' } })
  })

  test('works with query schema', () => {
    const result = cw20QueryMsg('balance', { address: 'osmo1abc' })
    expect(result).toEqual({ balance: { address: 'osmo1abc' } })
  })

  test('works with query schema (empty args)', () => {
    const result = cw20QueryMsg('token_info', {})
    expect(result).toEqual({ token_info: {} })
  })

  test('throws on missing required field', () => {
    expect(() =>
      cw20Msg(
        'transfer',
        // @ts-expect-error - testing runtime: missing recipient
        { amount: '1000' },
      ),
    ).toThrow('Validation failed for "transfer"')
  })

  test('throws on wrong type (number instead of string for Uint128)', () => {
    expect(() =>
      cw20Msg(
        'transfer',
        // @ts-expect-error - testing runtime: amount should be string
        { amount: 1000, recipient: 'osmo1abc' },
      ),
    ).toThrow('Validation failed for "transfer"')
  })

  test('throws on additional properties', () => {
    expect(() =>
      cw20Msg(
        'burn',
        // @ts-expect-error - testing runtime: extra field
        { amount: '500', extraField: true },
      ),
    ).toThrow('Validation failed for "burn"')
  })

  test('context option prefixes error message', () => {
    const cw20Execute = createMsgBuilder(cw20ExecuteSchema)
    expect(() =>
      cw20Execute(
        'transfer',
        // @ts-expect-error - testing runtime: missing recipient
        { amount: '1000' },
        { context: 'Execute' },
      ),
    ).toThrow('Execute validation failed for "transfer"')
  })

  test('context option for query', () => {
    const cw20Query = createMsgBuilder(cw20QuerySchema)
    expect(() =>
      cw20Query(
        'balance',
        // @ts-expect-error - testing runtime: missing address
        {},
        { context: 'Query' },
      ),
    ).toThrow('Query validation failed for "balance"')
  })
})

describe('buildMsg Ajv caching', () => {
  test('reuses compiled validator for same schema reference', () => {
    const compileSpy = vi.spyOn(Ajv.prototype, 'compile')

    // First call compiles the schema
    buildMsg(cw20ExecuteSchema, 'transfer', {
      amount: '1',
      recipient: 'osmo1abc',
    })
    const firstCallCount = compileSpy.mock.calls.length

    // Second call should reuse cached validator
    buildMsg(cw20ExecuteSchema, 'burn', { amount: '1' })
    expect(compileSpy.mock.calls.length).toBe(firstCallCount)

    compileSpy.mockRestore()
  })
})
