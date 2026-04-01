import type { FromSchema } from 'json-schema-to-ts'
import { assertType, expectTypeOf, test } from 'vitest'
import { cw20ExecuteMsg } from './cw20-execute-msg.js'

// ============================================================
// Test 1: FromSchema on the full oneOf envelope
// ============================================================
type ExecuteMsg = FromSchema<typeof cw20ExecuteMsg>

test('FromSchema produces union from oneOf envelope', () => {
  // Should accept a valid transfer message
  assertType<ExecuteMsg>({
    transfer: { amount: '1000', recipient: 'osmo1abc' },
  })

  // Should accept a valid burn message
  assertType<ExecuteMsg>({
    burn: { amount: '500' },
  })

  // Should accept a valid send message
  assertType<ExecuteMsg>({
    send: { amount: '100', contract: 'osmo1xyz', msg: 'base64data' },
  })

  // Should accept a valid mint message
  assertType<ExecuteMsg>({
    mint: { amount: '2000', recipient: 'osmo1def' },
  })
})

test('FromSchema rejects invalid messages', () => {
  // @ts-expect-error - 'recipent' is a typo (should be 'recipient')
  assertType<ExecuteMsg>({ transfer: { amount: '1000', recipent: 'osmo1abc' } })

  // @ts-expect-error - missing required field 'amount'
  assertType<ExecuteMsg>({ transfer: { recipient: 'osmo1abc' } })

  // @ts-expect-error - 'unknown_msg' is not a valid message name
  assertType<ExecuteMsg>({ unknown_msg: {} })
})

test('$ref resolves Uint128 to string', () => {
  // Uint128 should resolve to string via $ref -> definitions
  type TransferMsg = Extract<ExecuteMsg, { transfer: unknown }>
  expectTypeOf<TransferMsg['transfer']['amount']>().toEqualTypeOf<string>()
  expectTypeOf<TransferMsg['transfer']['recipient']>().toEqualTypeOf<string>()
})

test('$ref resolves Binary to string', () => {
  type SendMsg = Extract<ExecuteMsg, { send: unknown }>
  expectTypeOf<SendMsg['send']['msg']>().toEqualTypeOf<string>()
})

// ============================================================
// Test 2: Extracting individual variant types from the union
// ============================================================
test('individual message variants can be extracted from union', () => {
  type TransferMsg = Extract<ExecuteMsg, { transfer: unknown }>
  type BurnMsg = Extract<ExecuteMsg, { burn: unknown }>

  assertType<TransferMsg>({
    transfer: { amount: '1000', recipient: 'osmo1abc' },
  })

  assertType<BurnMsg>({
    burn: { amount: '500' },
  })
})

// ============================================================
// Test 3: Message name extraction at the type level
// ============================================================
type MessageNames<T> = T extends Record<string, unknown>
  ? keyof T & string
  : never

test('message names can be extracted as string literal union', () => {
  type Names = MessageNames<ExecuteMsg>
  expectTypeOf<Names>().toEqualTypeOf<
    'transfer' | 'burn' | 'send' | 'mint'
  >()
})

// ============================================================
// Test 4: Extracting args for a specific message name
// ============================================================
type MessageArgs<T, K extends string> = T extends Record<K, infer V> ? V : never

test('args for a specific message can be extracted', () => {
  type TransferArgs = MessageArgs<ExecuteMsg, 'transfer'>
  expectTypeOf<TransferArgs>().toEqualTypeOf<{
    amount: string
    recipient: string
  }>()

  type BurnArgs = MessageArgs<ExecuteMsg, 'burn'>
  expectTypeOf<BurnArgs>().toEqualTypeOf<{
    amount: string
  }>()

  type SendArgs = MessageArgs<ExecuteMsg, 'send'>
  expectTypeOf<SendArgs>().toEqualTypeOf<{
    amount: string
    contract: string
    msg: string
  }>()
})
