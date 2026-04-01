import { attest } from '@ark/attest'
import type { FromSchema } from 'json-schema-to-ts'
import { describe, test } from 'vitest'
import type { cw20ExecuteSchema } from '../test/fixtures/cw20-execute.js'
import type { cw20QuerySchema } from '../test/fixtures/cw20-query.js'

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

describe('Message type extraction', () => {
  type ExecuteMsg = FromSchema<typeof cw20ExecuteSchema>
  type MessageNames<T> = T extends Record<string, unknown>
    ? keyof T & string
    : never
  type MessageArgs<T, K extends string> = T extends Record<K, infer V>
    ? V
    : never

  test('extract message names from execute union', () => {
    type Result = MessageNames<ExecuteMsg>
    attest<Result>({} as Result)
  })

  test('extract transfer args', () => {
    type Result = MessageArgs<ExecuteMsg, 'transfer'>
    attest<Result>({} as Result)
  })
})
