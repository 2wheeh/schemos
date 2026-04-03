/**
 * Level 2 (createMsgBuilder) output compatibility tests.
 *
 * Verifies that the typed envelope from createMsgBuilder plugs directly
 * into existing SDK APIs without needing a Level 3 adapter.
 *
 * Two integration patterns:
 * 1. Convenience API (cosmjs, graz): envelope is the `msg` parameter as-is
 * 2. Protobuf API (telescope, interchainjs): envelope goes through
 *    JSON.stringify → toUtf8 → MsgExecuteContract.fromPartial({ msg })
 */

import type { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import type { MsgExecuteContract } from 'interchainjs/cosmwasm/wasm/v1/tx'
import { expectTypeOf, test } from 'vitest'
import { createMsgBuilder } from './msg.js'
import { cw20ExecuteSchema, cw20QuerySchema } from './schemas/cw20/index.js'

const cw20Msg = createMsgBuilder(cw20ExecuteSchema)
const cw20QueryMsg = createMsgBuilder(cw20QuerySchema)

// ---------------------------------------------------------------------------
// Pattern 1: Convenience APIs — envelope plugs in directly as `msg`
// ---------------------------------------------------------------------------

// cosmjs: SigningCosmWasmClient.execute(sender, contract, msg: JsonObject, fee)
test('cosmjs: Level 2 output assignable to execute() msg parameter', () => {
  const envelope = cw20Msg('transfer', {
    amount: '1000',
    recipient: 'osmo1abc',
  })
  type ExecuteMsg = Parameters<SigningCosmWasmClient['execute']>[2]
  expectTypeOf(envelope).toExtend<ExecuteMsg>()
})

// cosmjs: SigningCosmWasmClient.executeMultiple(sender, instructions, fee)
test('cosmjs: Level 2 output assignable to ExecuteInstruction.msg', () => {
  const envelope = cw20Msg('burn', { amount: '500' })
  type Instructions = Parameters<SigningCosmWasmClient['executeMultiple']>[1]
  type InstructionMsg = Instructions[number]['msg']
  expectTypeOf(envelope).toExtend<InstructionMsg>()
})

// cosmjs: CosmWasmClient.queryContractSmart(address, query: JsonObject)
test('cosmjs: Level 2 output assignable to queryContractSmart() query parameter', () => {
  const envelope = cw20QueryMsg('balance', { address: 'osmo1abc' })
  type QueryMsg = Parameters<SigningCosmWasmClient['queryContractSmart']>[1]
  expectTypeOf(envelope).toExtend<QueryMsg>()
})

// graz: executeContract({ msg: Message extends Record<string, unknown> })
test('graz: Level 2 output assignable to Record<string, unknown>', () => {
  const envelope = cw20Msg('transfer', {
    amount: '1000',
    recipient: 'osmo1abc',
  })
  // graz's Message generic is constrained to Record<string, unknown>
  expectTypeOf(envelope).toExtend<Record<string, unknown>>()
})

// ---------------------------------------------------------------------------
// Pattern 2: Protobuf APIs — envelope goes into MsgExecuteContract.msg field
// after JSON.stringify → Uint8Array encoding (user handles this step)
// ---------------------------------------------------------------------------

// interchainjs/telescope: MsgExecuteContract.msg is Uint8Array
test('telescope/interchainjs: Level 2 output is JSON-serializable for MsgExecuteContract.msg field', () => {
  const envelope = cw20Msg('transfer', {
    amount: '1000',
    recipient: 'osmo1abc',
  })

  // The envelope is a plain object that can be JSON.stringify'd
  // User does: toUtf8(JSON.stringify(envelope)) → Uint8Array → MsgExecuteContract.msg
  const serialized = JSON.stringify(envelope)
  expectTypeOf(serialized).toBeString()

  // MsgExecuteContract.msg expects Uint8Array
  type MsgField = MsgExecuteContract['msg']
  expectTypeOf<MsgField>().toEqualTypeOf<Uint8Array>()
})

// interchainjs: signAndBroadcast expects Message<any>[] (= { typeUrl, value }[])
// User builds the full message using telescope codegen, Level 2 only provides the msg field
test('interchainjs: Message<any> is { typeUrl: string, value: any }', () => {
  type InterchainMessage = import('@interchainjs/types').Message<any>
  expectTypeOf<InterchainMessage>().toEqualTypeOf<{
    typeUrl: string
    value: any
  }>()
})
