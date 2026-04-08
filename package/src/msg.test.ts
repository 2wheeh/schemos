import { Ajv } from 'ajv'
import { describe, expect, test, vi } from 'vitest'
import {
  buildMsg,
  createMsgBuilder,
  createMsgValidator,
  validateMsg,
} from './msg.js'
import {
  cw20ExecuteSchema,
  cw20InstantiateSchema,
  cw20QuerySchema,
} from './schemas/cw20/index.js'

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

describe('validateMsg', () => {
  // A simple flat struct schema — typical for instantiate messages
  const instantiateSchema = {
    type: 'object',
    required: ['name', 'symbol', 'decimals', 'initial_balances'],
    additionalProperties: false,
    properties: {
      name: { type: 'string' },
      symbol: { type: 'string' },
      decimals: { type: 'integer' },
      initial_balances: { type: 'array', items: { type: 'object' } },
    },
  } as const

  test('returns data as-is when valid', () => {
    const data = {
      name: 'Token',
      symbol: 'TKN',
      decimals: 6,
      initial_balances: [],
    }
    const result = validateMsg(instantiateSchema, data)
    expect(result).toBe(data)
  })

  test('throws when required field is missing', () => {
    expect(() =>
      validateMsg(instantiateSchema, { name: 'Token', symbol: 'TKN' }),
    ).toThrow('Validation failed:')
  })

  test('throws when field has wrong type', () => {
    expect(() =>
      validateMsg(instantiateSchema, {
        name: 'Token',
        symbol: 'TKN',
        decimals: 'six',
        initial_balances: [],
      }),
    ).toThrow('Validation failed:')
  })

  test('context option prefixes error message', () => {
    expect(() =>
      validateMsg(
        instantiateSchema,
        { name: 'Token' },
        { context: 'Instantiate' },
      ),
    ).toThrow('Instantiate:')
  })

  test('works for flat struct schema (instantiate use case)', () => {
    const result = validateMsg<{
      name: string
      symbol: string
      decimals: number
      initial_balances: object[]
    }>(instantiateSchema, {
      name: 'Token',
      symbol: 'TKN',
      decimals: 6,
      initial_balances: [],
    })
    expect(result.name).toBe('Token')
    expect(result.decimals).toBe(6)
  })

  test('reuses validator cache for same schema reference', () => {
    const compileSpy = vi.spyOn(Ajv.prototype, 'compile')

    validateMsg(instantiateSchema, {
      name: 'A',
      symbol: 'A',
      decimals: 0,
      initial_balances: [],
    })
    const firstCallCount = compileSpy.mock.calls.length

    validateMsg(instantiateSchema, {
      name: 'B',
      symbol: 'B',
      decimals: 0,
      initial_balances: [],
    })
    expect(compileSpy.mock.calls.length).toBe(firstCallCount)

    compileSpy.mockRestore()
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

describe('createMsgValidator', () => {
  const validateInit = createMsgValidator(cw20InstantiateSchema)

  test('returns data as-is when valid', () => {
    const result = validateInit({
      name: 'Token',
      symbol: 'TKN',
      decimals: 6,
      initial_balances: [],
    })
    expect(result.name).toBe('Token')
    expect(result.decimals).toBe(6)
  })

  test('throws when required field is missing', () => {
    // @ts-expect-error — intentionally missing required fields for runtime test
    expect(() => validateInit({ name: 'Token', symbol: 'TKN' })).toThrow(
      'Validation failed:',
    )
  })

  test('throws when field has wrong type', () => {
    expect(() =>
      validateInit({
        name: 'Token',
        symbol: 'TKN',
        // @ts-expect-error — intentionally wrong type for runtime test
        decimals: 'six',
        initial_balances: [],
      }),
    ).toThrow('Validation failed:')
  })

  test('context option prefixes error message', () => {
    expect(() =>
      // @ts-expect-error — intentionally missing required fields for runtime test
      validateInit({ name: 'Token' }, { context: 'Instantiate' }),
    ).toThrow('Instantiate:')
  })

  test('reuses validator cache across calls', () => {
    const compileSpy = vi.spyOn(Ajv.prototype, 'compile')

    validateInit({ name: 'A', symbol: 'A', decimals: 0, initial_balances: [] })
    const firstCallCount = compileSpy.mock.calls.length

    validateInit({ name: 'B', symbol: 'B', decimals: 0, initial_balances: [] })
    expect(compileSpy.mock.calls.length).toBe(firstCallCount)

    compileSpy.mockRestore()
  })
})
