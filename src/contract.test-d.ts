import type { FromSchema } from 'json-schema-to-ts'
import { assertType, expectTypeOf, test } from 'vitest'
import type { cw20ExecuteSchema } from '../test/fixtures/cw20-execute.js'
import type { cw20QuerySchema } from '../test/fixtures/cw20-query.js'
import type { CosmWasmExecuteClient, CosmWasmQueryClient } from './client.js'
import { createTypedContract } from './contract.js'
import type { TypedContract, TypedQueryContract } from './contract.js'

// ---------------------------------------------------------------------------
// Derive message types from schemas (purely at the type level)
// ---------------------------------------------------------------------------
type ExecuteMsg = FromSchema<typeof cw20ExecuteSchema>
type QueryMsg = FromSchema<typeof cw20QuerySchema>

// ---------------------------------------------------------------------------
// Test: FromSchema produces correct message union
// ---------------------------------------------------------------------------
test('ExecuteMsg is a union of single-key objects', () => {
  assertType<ExecuteMsg>({
    transfer: { amount: '1000', recipient: 'osmo1abc' },
  })
  assertType<ExecuteMsg>({ burn: { amount: '500' } })
  assertType<ExecuteMsg>({
    send: { amount: '100', contract: 'osmo1xyz', msg: 'base64' },
  })
  assertType<ExecuteMsg>({
    mint: { amount: '2000', recipient: 'osmo1def' },
  })
})

test('ExecuteMsg rejects invalid message name', () => {
  // @ts-expect-error - 'xfer' is not a valid execute message name
  assertType<ExecuteMsg>({ xfer: {} })
})

test('ExecuteMsg rejects typo in field name', () => {
  assertType<ExecuteMsg>({
    // @ts-expect-error - 'recipent' is a typo
    transfer: { amount: '1000', recipent: 'osmo1abc' },
  })
})

test('ExecuteMsg rejects missing required field', () => {
  // @ts-expect-error - missing 'recipient'
  assertType<ExecuteMsg>({ transfer: { amount: '1000' } })
})

test('QueryMsg is a union of single-key objects', () => {
  assertType<QueryMsg>({ balance: { address: 'osmo1abc' } })
  assertType<QueryMsg>({ token_info: {} })
  assertType<QueryMsg>({
    allowance: { owner: 'osmo1abc', spender: 'osmo1def' },
  })
})

test('QueryMsg rejects invalid query name', () => {
  // @ts-expect-error - 'balances' is not a valid query name
  assertType<QueryMsg>({ balances: { address: 'osmo1abc' } })
})

test('QueryMsg rejects missing required field', () => {
  // @ts-expect-error - missing 'address'
  assertType<QueryMsg>({ balance: {} })
})

// ---------------------------------------------------------------------------
// Test: TypedContract and TypedQueryContract shapes
// ---------------------------------------------------------------------------
type Cw20Contract = TypedContract<ExecuteMsg, QueryMsg>
type Cw20QueryOnly = TypedQueryContract<QueryMsg>

test('full contract has execute and query methods', () => {
  expectTypeOf<Cw20Contract>().toHaveProperty('execute')
  expectTypeOf<Cw20Contract>().toHaveProperty('query')
})

test('query-only contract has query but not execute', () => {
  expectTypeOf<Cw20QueryOnly>().toHaveProperty('query')
  expectTypeOf<Cw20QueryOnly>().not.toHaveProperty('execute')
})

test('execute return type is Promise<unknown>', () => {
  expectTypeOf<ReturnType<Cw20Contract['execute']>>().toEqualTypeOf<
    Promise<unknown>
  >()
})

test('query return type is Promise<unknown>', () => {
  expectTypeOf<ReturnType<Cw20Contract['query']>>().toEqualTypeOf<
    Promise<unknown>
  >()
})

// ---------------------------------------------------------------------------
// Test: createTypedContract overload resolution
// ---------------------------------------------------------------------------
test('createTypedContract with execute+query returns TypedContract', () => {
  const execClient: CosmWasmExecuteClient = {
    queryContractSmart: async () => ({}),
    execute: async () => ({}),
  }
  const contract = createTypedContract(execClient, 'addr', {
    execute: {} as typeof cw20ExecuteSchema,
    query: {} as typeof cw20QuerySchema,
  })
  expectTypeOf(contract).toHaveProperty('execute')
  expectTypeOf(contract).toHaveProperty('query')
})

test('createTypedContract with query-only returns TypedQueryContract', () => {
  const queryClient: CosmWasmQueryClient = {
    queryContractSmart: async () => ({}),
  }
  const contract = createTypedContract(queryClient, 'addr', {
    query: {} as typeof cw20QuerySchema,
  })
  expectTypeOf(contract).toHaveProperty('query')
  expectTypeOf(contract).not.toHaveProperty('execute')
})
