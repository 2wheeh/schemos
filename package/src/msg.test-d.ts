import type { FromSchema } from 'json-schema-to-ts'
import { assertType, expectTypeOf, test } from 'vitest'
import type {
  InferMsg,
  InferResponse,
  MessageArgs,
  MessageNames,
} from './msg.js'
import { createMsgBuilder } from './msg.js'
import {
  cw20ExecuteSchema,
  cw20QuerySchema,
  type cw20ResponseSchemas,
} from './schemas/cw20/index.js'

// ---------------------------------------------------------------------------
// InferMsg: same as FromSchema (single source of truth)
// ---------------------------------------------------------------------------
type Cw20Execute = InferMsg<typeof cw20ExecuteSchema>
type Cw20Query = InferMsg<typeof cw20QuerySchema>

test('InferMsg produces same type as FromSchema', () => {
  expectTypeOf<Cw20Execute>().toEqualTypeOf<
    FromSchema<typeof cw20ExecuteSchema>
  >()
  expectTypeOf<Cw20Query>().toEqualTypeOf<FromSchema<typeof cw20QuerySchema>>()
})

test('InferMsg<execute> accepts valid messages', () => {
  assertType<Cw20Execute>({
    transfer: { amount: '1000', recipient: 'osmo1abc' },
  })
  assertType<Cw20Execute>({ burn: { amount: '500' } })
  assertType<Cw20Execute>({
    send: { amount: '100', contract: 'osmo1xyz', msg: 'base64' },
  })
})

test('InferMsg<query> accepts valid messages', () => {
  assertType<Cw20Query>({ balance: { address: 'osmo1abc' } })
  assertType<Cw20Query>({ token_info: {} })
})

// ---------------------------------------------------------------------------
// MessageNames: extract message name literals from union
// ---------------------------------------------------------------------------
type ExecuteNames = MessageNames<Cw20Execute>
type QueryNames = MessageNames<Cw20Query>

test('MessageNames extracts execute message names', () => {
  assertType<ExecuteNames>('transfer')
  assertType<ExecuteNames>('burn')
  assertType<ExecuteNames>('send')
  assertType<ExecuteNames>('mint')
  assertType<ExecuteNames>('increase_allowance')
  assertType<ExecuteNames>('decrease_allowance')
  assertType<ExecuteNames>('transfer_from')
  assertType<ExecuteNames>('send_from')
  assertType<ExecuteNames>('burn_from')
})

test('MessageNames extracts query message names', () => {
  assertType<QueryNames>('balance')
  assertType<QueryNames>('token_info')
  assertType<QueryNames>('allowance')
  assertType<QueryNames>('all_allowances')
  assertType<QueryNames>('all_accounts')
})

test('MessageNames rejects invalid names', () => {
  // @ts-expect-error - 'xfer' is not a valid execute message name
  assertType<ExecuteNames>('xfer')
  // @ts-expect-error - 'balances' is not a valid query name
  assertType<QueryNames>('balances')
})

// ---------------------------------------------------------------------------
// MessageArgs: narrow args for a specific message name
// ---------------------------------------------------------------------------
test('MessageArgs narrows transfer to { amount, recipient }', () => {
  expectTypeOf<MessageArgs<Cw20Execute, 'transfer'>>().toEqualTypeOf<{
    amount: string
    recipient: string
  }>()
})

test('MessageArgs narrows burn to { amount }', () => {
  expectTypeOf<MessageArgs<Cw20Execute, 'burn'>>().toEqualTypeOf<{
    amount: string
  }>()
})

test('MessageArgs narrows balance query to { address }', () => {
  expectTypeOf<MessageArgs<Cw20Query, 'balance'>>().toEqualTypeOf<{
    address: string
  }>()
})

test('MessageArgs narrows token_info query to {}', () => {
  expectTypeOf<MessageArgs<Cw20Query, 'token_info'>>().toEqualTypeOf<{}>()
})

// ---------------------------------------------------------------------------
// InferResponse: extract typed response from responses schema map
// ---------------------------------------------------------------------------
test('InferResponse infers balance response', () => {
  expectTypeOf<
    InferResponse<typeof cw20ResponseSchemas, 'balance'>
  >().toEqualTypeOf<{ balance: string }>()
})

test('InferResponse infers token_info response', () => {
  type TokenInfo = InferResponse<typeof cw20ResponseSchemas, 'token_info'>
  expectTypeOf<TokenInfo>().toHaveProperty('name')
  expectTypeOf<TokenInfo>().toHaveProperty('symbol')
  expectTypeOf<TokenInfo>().toHaveProperty('decimals')
  expectTypeOf<TokenInfo>().toHaveProperty('total_supply')
})

test('InferResponse rejects invalid response key', () => {
  // @ts-expect-error - 'nonexistent' is not a valid response key
  type _Invalid = InferResponse<typeof cw20ResponseSchemas, 'nonexistent'>
})

// ---------------------------------------------------------------------------
// createMsgBuilder: return type narrowing (Level 2 type tests)
// ---------------------------------------------------------------------------
const cw20Msg = createMsgBuilder(cw20ExecuteSchema)
const cw20QueryMsg = createMsgBuilder(cw20QuerySchema)

test('createMsgBuilder return type narrows to single-key envelope', () => {
  const result = cw20Msg('transfer', {
    amount: '1000',
    recipient: 'osmo1abc',
  })
  expectTypeOf(result).toEqualTypeOf<{
    transfer: { amount: string; recipient: string }
  }>()
})

test('createMsgBuilder return type is NOT the full union', () => {
  const result = cw20Msg('transfer', {
    amount: '1000',
    recipient: 'osmo1abc',
  })
  expectTypeOf(result).not.toEqualTypeOf<InferMsg<typeof cw20ExecuteSchema>>()
})

test('createMsgBuilder narrows query envelope too', () => {
  const result = cw20QueryMsg('balance', { address: 'osmo1abc' })
  expectTypeOf(result).toEqualTypeOf<{ balance: { address: string } }>()
})

test('createMsgBuilder rejects invalid message name at type level', () => {
  expectTypeOf(cw20Msg).parameter(0).not.toExtend<'xfer'>()
})

test('createMsgBuilder rejects wrong args shape at type level', () => {
  // Missing 'recipient' — should not be assignable to transfer args
  expectTypeOf<{ amount: string }>().not.toExtend<
    MessageArgs<Cw20Execute, 'transfer'>
  >()
})

test('createMsgBuilder rejects typo in field name at type level', () => {
  // 'recipent' is a typo — should not be assignable
  expectTypeOf<{ amount: string; recipent: string }>().not.toExtend<
    MessageArgs<Cw20Execute, 'transfer'>
  >()
})
