import { describe, expect, test, vi } from 'vitest'
import type { CosmWasmExecuteClient, CosmWasmQueryClient } from './client.js'
import { createTypedContract } from './contract.js'
import { cw20ExecuteSchema, cw20QuerySchema } from './schemas/cw20/index.js'

function createMockExecuteClient(): CosmWasmExecuteClient {
  return {
    queryContractSmart: vi.fn().mockResolvedValue({ balance: '1000' }),
    execute: vi.fn().mockResolvedValue({ transactionHash: 'abc123' }),
  }
}

function createMockQueryClient(): CosmWasmQueryClient {
  return {
    queryContractSmart: vi.fn().mockResolvedValue({ balance: '1000' }),
  }
}

describe('createTypedContract (execute + query)', () => {
  const mockClient = createMockExecuteClient()
  const cw20 = createTypedContract(mockClient, 'osmo1contract', {
    execute: cw20ExecuteSchema,
    query: cw20QuerySchema,
  })

  test('execute passes valid args to client with correct envelope', async () => {
    await cw20.execute(
      'osmo1sender',
      'transfer',
      { amount: '1000', recipient: 'osmo1recipient' },
      'auto',
    )

    expect(mockClient.execute).toHaveBeenCalledWith(
      'osmo1sender',
      'osmo1contract',
      { transfer: { amount: '1000', recipient: 'osmo1recipient' } },
      'auto',
      undefined,
      undefined,
    )
  })

  test('execute passes memo and funds to client', async () => {
    const fee = { amount: [{ denom: 'uosmo', amount: '500' }], gas: '200000' }
    const funds = [{ denom: 'uosmo', amount: '100' }] as const

    await cw20.execute(
      'osmo1sender',
      'burn',
      { amount: '500' },
      fee,
      'test memo',
      funds,
    )

    expect(mockClient.execute).toHaveBeenCalledWith(
      'osmo1sender',
      'osmo1contract',
      { burn: { amount: '500' } },
      fee,
      'test memo',
      funds,
    )
  })

  test('execute throws on missing required field', async () => {
    await expect(
      // @ts-expect-error - testing runtime validation with invalid args
      cw20.execute('osmo1sender', 'transfer', { amount: '1000' }, 'auto'),
    ).rejects.toThrow('Execute validation failed for "transfer"')
  })

  test('execute throws on wrong type for $ref Uint128 (number instead of string)', async () => {
    await expect(
      cw20.execute(
        'osmo1sender',
        'transfer',
        // @ts-expect-error - testing runtime: amount should be string
        { amount: 1000, recipient: 'osmo1abc' },
        'auto',
      ),
    ).rejects.toThrow('Execute validation failed for "transfer"')
  })

  test('execute validates $ref correctly (Uint128 as string passes)', async () => {
    await cw20.execute(
      'osmo1sender',
      'mint',
      { amount: '999', recipient: 'osmo1abc' },
      'auto',
    )

    expect(mockClient.execute).toHaveBeenCalledWith(
      'osmo1sender',
      'osmo1contract',
      { mint: { amount: '999', recipient: 'osmo1abc' } },
      'auto',
      undefined,
      undefined,
    )
  })

  test('execute rejects additional properties', async () => {
    await expect(
      cw20.execute(
        'osmo1sender',
        'burn',
        // @ts-expect-error - testing runtime: extra field
        { amount: '500', extraField: true },
        'auto',
      ),
    ).rejects.toThrow('Execute validation failed for "burn"')
  })

  test('query passes valid args to client with correct envelope', async () => {
    await cw20.query('balance', { address: 'osmo1abc' })

    expect(mockClient.queryContractSmart).toHaveBeenCalledWith(
      'osmo1contract',
      { balance: { address: 'osmo1abc' } },
    )
  })

  test('query throws on missing required field', async () => {
    await expect(
      // @ts-expect-error - testing runtime validation
      cw20.query('balance', {}),
    ).rejects.toThrow('Query validation failed for "balance"')
  })

  test('query with empty args works for token_info', async () => {
    await cw20.query('token_info', {})

    expect(mockClient.queryContractSmart).toHaveBeenCalledWith(
      'osmo1contract',
      { token_info: {} },
    )
  })
})

describe('createTypedContract (query-only)', () => {
  const mockClient = createMockQueryClient()
  const cw20 = createTypedContract(mockClient, 'osmo1contract', {
    query: cw20QuerySchema,
  })

  test('query works on query-only contract', async () => {
    await cw20.query('balance', { address: 'osmo1abc' })

    expect(mockClient.queryContractSmart).toHaveBeenCalledWith(
      'osmo1contract',
      { balance: { address: 'osmo1abc' } },
    )
  })

  test('query-only contract does not have execute method', () => {
    expect('execute' in cw20).toBe(false)
  })
})
