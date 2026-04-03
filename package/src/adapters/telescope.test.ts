import { describe, expect, test, vi } from 'vitest'
import { createTypedContract } from '../contract.js'
import { Json } from '../encoding/index.js'
import { cw20 } from '../schemas/cw20/index.js'
import { cw20QuerySchema } from '../schemas/cw20/query.js'
import { createExecuteAdapter, createQueryAdapter } from './telescope.js'

describe('createQueryAdapter', () => {
  test('converts JSON query to Uint8Array and parses response', async () => {
    const mockSmartContractState = vi.fn().mockResolvedValue({
      data: Json.toBytes({ balance: '1000' }),
    })

    const adapter = createQueryAdapter(mockSmartContractState)
    const result = await adapter.queryContractSmart('osmo1contract', {
      balance: { address: 'osmo1abc' },
    })

    expect(result).toEqual({ balance: '1000' })
    expect(mockSmartContractState).toHaveBeenCalledWith({
      address: 'osmo1contract',
      queryData: Json.toBytes({ balance: { address: 'osmo1abc' } }),
    })
  })

  test('works with createTypedContract', async () => {
    const mockSmartContractState = vi.fn().mockResolvedValue({
      data: Json.toBytes({ balance: '500' }),
    })

    const adapter = createQueryAdapter(mockSmartContractState)
    const contract = createTypedContract(adapter, 'osmo1contract', {
      query: cw20QuerySchema,
    })

    const result = await contract.query('balance', { address: 'osmo1abc' })
    expect(result).toEqual({ balance: '500' })
  })
})

describe('createExecuteAdapter', () => {
  const mockSmartContractState = vi.fn().mockResolvedValue({
    data: Json.toBytes({}),
  })

  const mockSignAndBroadcast = vi.fn().mockResolvedValue({
    transactionHash: 'abc123',
  })

  const mockEncode = vi.fn().mockReturnValue(new Uint8Array([1, 2, 3]))

  test('encodes msg as JSON bytes and calls signAndBroadcast', async () => {
    const adapter = createExecuteAdapter(
      mockSmartContractState,
      mockSignAndBroadcast,
      mockEncode,
    )

    await adapter.execute(
      'osmo1sender',
      'osmo1contract',
      { transfer: { recipient: 'osmo1abc', amount: '1000' } },
      'auto',
      'test memo',
    )

    expect(mockEncode).toHaveBeenCalledWith({
      sender: 'osmo1sender',
      contract: 'osmo1contract',
      msg: Json.toBytes({
        transfer: { recipient: 'osmo1abc', amount: '1000' },
      }),
      funds: [],
    })

    expect(mockSignAndBroadcast).toHaveBeenCalledWith(
      'osmo1sender',
      [
        {
          typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
          value: new Uint8Array([1, 2, 3]),
        },
      ],
      'auto',
      'test memo',
    )
  })

  test('passes funds to encoder', async () => {
    const adapter = createExecuteAdapter(
      mockSmartContractState,
      mockSignAndBroadcast,
      mockEncode,
    )

    const funds = [{ denom: 'uosmo', amount: '100' }] as const

    await adapter.execute(
      'osmo1sender',
      'osmo1contract',
      { transfer: { recipient: 'osmo1abc', amount: '1000' } },
      'auto',
      undefined,
      funds,
    )

    expect(mockEncode).toHaveBeenCalledWith(
      expect.objectContaining({
        funds,
      }),
    )
  })

  test('query works through execute adapter', async () => {
    const adapter = createExecuteAdapter(
      mockSmartContractState,
      mockSignAndBroadcast,
      mockEncode,
    )

    const result = await adapter.queryContractSmart('osmo1contract', {
      balance: { address: 'osmo1abc' },
    })
    expect(result).toEqual({})
  })

  test('works with createTypedContract and cw20 schema', async () => {
    const queryFn = vi.fn().mockResolvedValue({
      data: Json.toBytes({ balance: '1000' }),
    })
    const broadcastFn = vi.fn().mockResolvedValue({ hash: 'tx123' })
    const encodeFn = vi.fn().mockReturnValue(new Uint8Array([1]))

    const adapter = createExecuteAdapter(queryFn, broadcastFn, encodeFn)
    const contract = createTypedContract(adapter, 'osmo1contract', cw20)

    await contract.execute(
      'osmo1sender',
      'transfer',
      { recipient: 'osmo1abc', amount: '500' },
      'auto',
    )

    expect(broadcastFn).toHaveBeenCalled()
    expect(encodeFn).toHaveBeenCalledWith(
      expect.objectContaining({
        sender: 'osmo1sender',
        contract: 'osmo1contract',
      }),
    )
  })
})
