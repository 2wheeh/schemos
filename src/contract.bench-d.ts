import { attest } from '@ark/attest'
import type { FromSchema } from 'json-schema-to-ts'
import { describe, test } from 'vitest'
import type { TypedContract, TypedQueryContract } from './contract.js'
import type {
  cw20ExecuteSchema,
  cw20QuerySchema,
} from './schemas/cw20/index.js'
import type { cw20ResponseSchemas } from './schemas/cw20/responses.js'

// ---------------------------------------------------------------------------
// FromSchema instantiation benchmarks
// ---------------------------------------------------------------------------
describe('FromSchema on CosmWasm schemas', () => {
  test('cw20 execute schema (4 messages)', () => {
    type Result = FromSchema<typeof cw20ExecuteSchema>
    attest<Result>({} as Result)
  })

  test('cw20 query schema (3 messages)', () => {
    type Result = FromSchema<typeof cw20QuerySchema>
    attest<Result>({} as Result)
  })
})

// ---------------------------------------------------------------------------
// Message type extraction benchmarks
// ---------------------------------------------------------------------------
describe('Message type extraction', () => {
  type ExecuteMsg = FromSchema<typeof cw20ExecuteSchema>
  type MessageNames<T> =
    T extends Record<string, unknown> ? keyof T & string : never
  type MessageArgs<T, K extends string> =
    T extends Record<K, infer V> ? V : never

  test('extract message names from execute union', () => {
    type Result = MessageNames<ExecuteMsg>
    attest<Result>({} as Result)
  })

  test('extract transfer args', () => {
    type Result = MessageArgs<ExecuteMsg, 'transfer'>
    attest<Result>({} as Result)
  })
})

// ---------------------------------------------------------------------------
// Response schema resolution benchmarks
// ---------------------------------------------------------------------------
describe('Response schema resolution (lazy FromSchema)', () => {
  test('resolve balance response', () => {
    type Result = FromSchema<(typeof cw20ResponseSchemas)['balance']>
    attest<Result>({} as Result)
  })

  test('resolve token_info response', () => {
    type Result = FromSchema<(typeof cw20ResponseSchemas)['token_info']>
    attest<Result>({} as Result)
  })

  test('resolve allowance response', () => {
    type Result = FromSchema<(typeof cw20ResponseSchemas)['allowance']>
    attest<Result>({} as Result)
  })
})

// ---------------------------------------------------------------------------
// Full contract type construction benchmarks
// ---------------------------------------------------------------------------
describe('TypedContract construction', () => {
  type ExecuteMsg = FromSchema<typeof cw20ExecuteSchema>
  type QueryMsg = FromSchema<typeof cw20QuerySchema>

  test('TypedQueryContract without responses', () => {
    type Result = TypedQueryContract<QueryMsg>
    attest<Result>({} as Result)
  })

  test('TypedQueryContract with responses', () => {
    type Result = TypedQueryContract<QueryMsg, typeof cw20ResponseSchemas>
    attest<Result>({} as Result)
  })

  test('TypedContract without responses', () => {
    type Result = TypedContract<ExecuteMsg, QueryMsg>
    attest<Result>({} as Result)
  })

  test('TypedContract with responses', () => {
    type Result = TypedContract<
      ExecuteMsg,
      QueryMsg,
      unknown,
      typeof cw20ResponseSchemas
    >
    attest<Result>({} as Result)
  })
})
