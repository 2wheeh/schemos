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
  test('cw20 execute schema (12 messages)', () => {
    type Result = FromSchema<typeof cw20ExecuteSchema>
    attest.instantiations([16458, 'instantiations'])
    attest<Result>({} as Result)
  })

  test('cw20 query schema (9 messages)', () => {
    type Result = FromSchema<typeof cw20QuerySchema>
    attest.instantiations([811, 'instantiations'])
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
    attest.instantiations([74, 'instantiations'])
    attest<Result>({} as Result)
  })

  test('extract transfer args', () => {
    type Result = MessageArgs<ExecuteMsg, 'transfer'>
    attest.instantiations([74, 'instantiations'])
    attest<Result>({} as Result)
  })
})

// ---------------------------------------------------------------------------
// Response schema resolution benchmarks
// ---------------------------------------------------------------------------
describe('Response schema resolution (lazy FromSchema)', () => {
  test('resolve balance response', () => {
    type Result = FromSchema<(typeof cw20ResponseSchemas)['balance']>
    attest.instantiations([1115, 'instantiations'])
    attest<Result>({} as Result)
  })

  test('resolve token_info response', () => {
    type Result = FromSchema<(typeof cw20ResponseSchemas)['token_info']>
    attest.instantiations([1488, 'instantiations'])
    attest<Result>({} as Result)
  })

  test('resolve allowance response', () => {
    type Result = FromSchema<(typeof cw20ResponseSchemas)['allowance']>
    attest.instantiations([28809, 'instantiations'])
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
    attest.instantiations([69, 'instantiations'])
    attest<Result>({} as Result)
  })

  test('TypedQueryContract with responses', () => {
    type Result = TypedQueryContract<QueryMsg, typeof cw20ResponseSchemas>
    attest.instantiations([139, 'instantiations'])
    attest<Result>({} as Result)
  })

  test('TypedContract without responses', () => {
    type Result = TypedContract<ExecuteMsg, QueryMsg>
    attest.instantiations([60, 'instantiations'])
    attest<Result>({} as Result)
  })

  test('TypedContract with responses', () => {
    type Result = TypedContract<
      ExecuteMsg,
      QueryMsg,
      unknown,
      typeof cw20ResponseSchemas
    >
    attest.instantiations([142, 'instantiations'])
    attest<Result>({} as Result)
  })
})
