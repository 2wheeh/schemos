import { assertType, expectTypeOf, test } from 'vitest'
import type { CosmWasmExecuteClient, CosmWasmQueryClient } from './client.js'
import type { Coin, StdFee } from './types.js'

test('CosmWasmExecuteClient extends CosmWasmQueryClient', () => {
  expectTypeOf<CosmWasmExecuteClient>().toMatchTypeOf<CosmWasmQueryClient>()
})

test('CosmWasmQueryClient.queryContractSmart signature', () => {
  expectTypeOf<CosmWasmQueryClient['queryContractSmart']>().toBeFunction()
  expectTypeOf<
    CosmWasmQueryClient['queryContractSmart']
  >().parameters.toEqualTypeOf<
    [address: string, query: Record<string, unknown>]
  >()
  expectTypeOf<
    CosmWasmQueryClient['queryContractSmart']
  >().returns.toEqualTypeOf<Promise<unknown>>()
})

test('CosmWasmExecuteClient.execute signature', () => {
  expectTypeOf<CosmWasmExecuteClient['execute']>().toBeFunction()

  // Verify it accepts the correct argument types
  const mockClient: CosmWasmExecuteClient = {
    queryContractSmart: async () => ({}),
    execute: async () => ({}),
  }

  const fee: StdFee = {
    amount: [{ denom: 'uosmo', amount: '500' }],
    gas: '200000',
  }
  const funds: readonly Coin[] = [{ denom: 'uosmo', amount: '1000' }]

  // Valid calls
  assertType<Promise<unknown>>(
    mockClient.execute('sender', 'contract', { transfer: {} }, fee),
  )
  assertType<Promise<unknown>>(
    mockClient.execute('sender', 'contract', { transfer: {} }, 'auto'),
  )
  assertType<Promise<unknown>>(
    mockClient.execute(
      'sender',
      'contract',
      { transfer: {} },
      fee,
      'memo',
      funds,
    ),
  )
})

test('CosmWasmQueryClient is assignable from execute client', () => {
  // An execute client should be usable anywhere a query client is expected
  const execClient: CosmWasmExecuteClient = {
    queryContractSmart: async () => ({}),
    execute: async () => ({}),
  }
  const queryClient: CosmWasmQueryClient = execClient
  assertType<CosmWasmQueryClient>(queryClient)
})
