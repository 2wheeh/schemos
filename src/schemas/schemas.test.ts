import { Ajv } from 'ajv'
import { describe, expect, test, vi } from 'vitest'
import type { CosmWasmExecuteClient } from '../client.js'
import { createTypedContract } from '../contract.js'
import {
  cw20,
  cw20ExecuteSchema,
  cw20QuerySchema,
  cw721,
  cw721ExecuteSchema,
  cw721QuerySchema,
} from './index.js'

// ---------------------------------------------------------------------------
// CW20 Ajv validation
// ---------------------------------------------------------------------------
describe('cw20 schema Ajv validation', () => {
  const ajv = new Ajv({ strict: false })
  const validateExecute = ajv.compile(cw20ExecuteSchema)
  const validateQuery = ajv.compile(cw20QuerySchema)

  test('validates cw20 transfer', () => {
    expect(
      validateExecute({
        transfer: { amount: '1000', recipient: 'osmo1abc' },
      }),
    ).toBe(true)
  })

  test('validates cw20 increase_allowance with expires', () => {
    expect(
      validateExecute({
        increase_allowance: {
          amount: '500',
          spender: 'osmo1abc',
          expires: { at_height: 100000 },
        },
      }),
    ).toBe(true)
  })

  test('validates cw20 increase_allowance with null expires', () => {
    expect(
      validateExecute({
        increase_allowance: {
          amount: '500',
          spender: 'osmo1abc',
          expires: null,
        },
      }),
    ).toBe(true)
  })

  test('rejects cw20 transfer with number amount', () => {
    expect(
      validateExecute({
        transfer: { amount: 1000, recipient: 'osmo1abc' },
      }),
    ).toBe(false)
  })

  test('validates cw20 balance query', () => {
    expect(validateQuery({ balance: { address: 'osmo1abc' } })).toBe(true)
  })

  test('validates cw20 all_allowances with pagination', () => {
    expect(
      validateQuery({
        all_allowances: {
          owner: 'osmo1abc',
          limit: 10,
          start_after: 'osmo1xyz',
        },
      }),
    ).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// CW721 Ajv validation
// ---------------------------------------------------------------------------
describe('cw721 schema Ajv validation', () => {
  const ajv = new Ajv({ strict: false })
  const validateExecute = ajv.compile(cw721ExecuteSchema)
  const validateQuery = ajv.compile(cw721QuerySchema)

  test('validates cw721 transfer_nft', () => {
    expect(
      validateExecute({
        transfer_nft: { recipient: 'osmo1abc', token_id: '1' },
      }),
    ).toBe(true)
  })

  test('validates cw721 approve with expires', () => {
    expect(
      validateExecute({
        approve: {
          spender: 'osmo1abc',
          token_id: '1',
          expires: { never: {} },
        },
      }),
    ).toBe(true)
  })

  test('rejects cw721 transfer_nft missing token_id', () => {
    expect(validateExecute({ transfer_nft: { recipient: 'osmo1abc' } })).toBe(
      false,
    )
  })

  test('validates cw721 owner_of query', () => {
    expect(validateQuery({ owner_of: { token_id: '1' } })).toBe(true)
  })

  test('validates cw721 tokens query with pagination', () => {
    expect(
      validateQuery({
        tokens: { owner: 'osmo1abc', limit: 20, start_after: '5' },
      }),
    ).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Integration: createTypedContract with bundled schemas
// ---------------------------------------------------------------------------
describe('createTypedContract with bundled cw20 schemas', () => {
  const mockClient: CosmWasmExecuteClient = {
    queryContractSmart: vi.fn().mockResolvedValue({}),
    execute: vi.fn().mockResolvedValue({}),
  }

  const cw20 = createTypedContract(mockClient, 'osmo1contract', {
    execute: cw20ExecuteSchema,
    query: cw20QuerySchema,
  })

  test('execute transfer works with bundled schema', async () => {
    await cw20.execute(
      'osmo1sender',
      'transfer',
      { amount: '1000', recipient: 'osmo1abc' },
      'auto',
    )
    expect(mockClient.execute).toHaveBeenCalledWith(
      'osmo1sender',
      'osmo1contract',
      { transfer: { amount: '1000', recipient: 'osmo1abc' } },
      'auto',
      undefined,
      undefined,
    )
  })

  test('query balance works with bundled schema', async () => {
    await cw20.query('balance', { address: 'osmo1abc' })
    expect(mockClient.queryContractSmart).toHaveBeenCalledWith(
      'osmo1contract',
      { balance: { address: 'osmo1abc' } },
    )
  })
})

describe('createTypedContract with bundled cw721 schemas', () => {
  const mockClient: CosmWasmExecuteClient = {
    queryContractSmart: vi.fn().mockResolvedValue({}),
    execute: vi.fn().mockResolvedValue({}),
  }

  const cw721 = createTypedContract(mockClient, 'osmo1nft', {
    execute: cw721ExecuteSchema,
    query: cw721QuerySchema,
  })

  test('execute transfer_nft works with bundled schema', async () => {
    await cw721.execute(
      'osmo1sender',
      'transfer_nft',
      { recipient: 'osmo1abc', token_id: '42' },
      'auto',
    )
    expect(mockClient.execute).toHaveBeenCalledWith(
      'osmo1sender',
      'osmo1nft',
      { transfer_nft: { recipient: 'osmo1abc', token_id: '42' } },
      'auto',
      undefined,
      undefined,
    )
  })

  test('query owner_of works with bundled schema', async () => {
    await cw721.query('owner_of', { token_id: '42' })
    expect(mockClient.queryContractSmart).toHaveBeenCalledWith('osmo1nft', {
      owner_of: { token_id: '42' },
    })
  })
})

// ---------------------------------------------------------------------------
// Namespace spread pattern: import { cw20 } from 'cosmore/schemas'
// ---------------------------------------------------------------------------
describe('createTypedContract with namespace spread', () => {
  test('cw20 namespace works with spread', async () => {
    const mockClient: CosmWasmExecuteClient = {
      queryContractSmart: vi.fn().mockResolvedValue({}),
      execute: vi.fn().mockResolvedValue({}),
    }
    const contract = createTypedContract(mockClient, 'osmo1contract', cw20)
    await contract.execute(
      'osmo1sender',
      'transfer',
      { amount: '1000', recipient: 'osmo1abc' },
      'auto',
    )
    expect(mockClient.execute).toHaveBeenCalled()
  })

  test('cw721 namespace works with spread', async () => {
    const mockClient: CosmWasmExecuteClient = {
      queryContractSmart: vi.fn().mockResolvedValue({}),
      execute: vi.fn().mockResolvedValue({}),
    }
    const contract = createTypedContract(mockClient, 'osmo1nft', cw721)
    await contract.execute(
      'osmo1sender',
      'transfer_nft',
      { recipient: 'osmo1abc', token_id: '1' },
      'auto',
    )
    expect(mockClient.execute).toHaveBeenCalled()
  })
})
