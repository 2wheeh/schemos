import type { CosmWasmExecuteClient, CosmWasmQueryClient } from './client.js'
import type { Coin, StdFee } from './types.js'

/**
 * RPC function signature shared by all telescope-generated clients.
 * e.g., rpc.cosmwasm.wasm.v1.smartContractState
 */
export type SmartContractStateFn = (params: {
  address: string
  queryData: Uint8Array
}) => Promise<{ data: Uint8Array }>

/**
 * Generic sign-and-broadcast function.
 * Accepts encoded messages and returns the broadcast result.
 */
export type SignAndBroadcastFn<TResult = unknown> = (
  sender: string,
  messages: readonly { typeUrl: string; value: Uint8Array }[],
  fee: StdFee | 'auto',
  memo?: string,
) => Promise<TResult>

/**
 * Encodes a CosmWasm JSON message to MsgExecuteContract value bytes.
 * This is the standard protobuf encoding for MsgExecuteContract.
 */
export type EncodeMsgExecuteContractFn = (params: {
  sender: string
  contract: string
  msg: Uint8Array
  funds: readonly Coin[]
}) => Uint8Array

const encoder = new TextEncoder()
const decoder = new TextDecoder()

/**
 * Creates a query-only adapter from a telescope RPC function.
 *
 * Works with any telescope-generated client:
 * - interchainjs: `rpc.cosmwasm.wasm.v1.smartContractState`
 * - xplajs: `rpc.cosmwasm.wasm.v1.smartContractState`
 * - osmosisjs: same pattern
 *
 * @example
 * ```ts
 * import { createQueryAdapter } from 'cosmore/interchain'
 *
 * const adapter = createQueryAdapter(rpc.cosmwasm.wasm.v1.smartContractState)
 * const cw20 = createTypedContract(adapter, 'osmo1...', cw20Schema)
 * ```
 */
export function createQueryAdapter(
  smartContractState: SmartContractStateFn,
): CosmWasmQueryClient {
  return {
    async queryContractSmart(address: string, query: Record<string, unknown>) {
      const queryData = encoder.encode(JSON.stringify(query))
      const res = await smartContractState({ address, queryData })
      return JSON.parse(decoder.decode(res.data))
    },
  }
}

/**
 * Creates a full execute+query adapter from telescope RPC functions.
 *
 * Requires a sign-and-broadcast function and a MsgExecuteContract encoder,
 * both of which are provided by telescope-generated clients.
 *
 * @example
 * ```ts
 * import { createExecuteAdapter } from 'cosmore/interchain'
 * import { MsgExecuteContract } from 'interchainjs/cosmwasm/wasm/v1/tx'
 *
 * const adapter = createExecuteAdapter(
 *   rpc.cosmwasm.wasm.v1.smartContractState,
 *   (sender, messages, fee, memo) => signingClient.signAndBroadcast(sender, messages, fee, memo),
 *   ({ sender, contract, msg, funds }) =>
 *     MsgExecuteContract.encode({ sender, contract, msg, funds }).finish(),
 * )
 * ```
 */
export function createExecuteAdapter<TExecuteResult>(
  smartContractState: SmartContractStateFn,
  signAndBroadcast: SignAndBroadcastFn<TExecuteResult>,
  encodeMsgExecuteContract: EncodeMsgExecuteContractFn,
): CosmWasmExecuteClient<TExecuteResult> {
  const queryAdapter = createQueryAdapter(smartContractState)

  return {
    ...queryAdapter,
    async execute(
      sender: string,
      address: string,
      msg: Record<string, unknown>,
      fee: StdFee | 'auto',
      memo?: string,
      funds?: readonly Coin[],
    ) {
      const msgBytes = encoder.encode(JSON.stringify(msg))
      const value = encodeMsgExecuteContract({
        sender,
        contract: address,
        msg: msgBytes,
        funds: funds ?? [],
      })

      return signAndBroadcast(
        sender,
        [
          {
            typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
            value,
          },
        ],
        fee,
        memo,
      )
    },
  }
}
