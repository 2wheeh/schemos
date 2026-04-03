/**
 * Generic adapter for telescope-based CosmWasm clients.
 *
 * ## Why callbacks instead of direct imports?
 *
 * CosmWasm is not part of the Cosmos SDK core — it's an opt-in module that
 * each chain chooses to enable. This means `MsgExecuteContract` and the
 * `smartContractState` query RPC are NOT in the shared type packages:
 *
 * ```
 * @interchainjs/cosmos-types  → Cosmos SDK core only (no cosmwasm)
 * cosmjs-types                → includes cosmwasm (monolithic)
 *
 * Telescope-generated per-chain packages (include cosmwasm if the chain supports it):
 * @xpla/xplajs               → cosmwasm/wasm/v1/tx (XPLA)
 * osmojs                      → cosmwasm/wasm/v1/tx (Osmosis)
 * neutronjs                   → cosmwasm/wasm/v1/tx (Neutron)
 * ```
 *
 * Since each chain imports `MsgExecuteContract` from a different package,
 * schemos cannot depend on any specific one. Instead, the adapter accepts
 * callback functions that the user provides from their chain's SDK.
 *
 * ## Usage
 *
 * ```ts
 * // With xplajs
 * import { MsgExecuteContract } from '@xpla/xplajs/cosmwasm/wasm/v1/tx'
 * import { createExecuteAdapter } from 'schemos/telescope'
 *
 * const adapter = createExecuteAdapter(
 *   rpc.cosmwasm.wasm.v1.smartContractState,
 *   signingClient.signAndBroadcast,
 *   (p) => MsgExecuteContract.encode(MsgExecuteContract.fromPartial(p)).finish(),
 * )
 *
 * // With osmojs — same pattern, different import
 * import { MsgExecuteContract } from 'osmojs/cosmwasm/wasm/v1/tx'
 * ```
 *
 * @module
 */

import type { CosmWasmExecuteClient, CosmWasmQueryClient } from '../client.js'
import { Json } from '../encoding/index.js'
import type { Coin } from '../types.js'

// StdFee from interchainjs is not readonly!!
interface InterchainStdFee {
  amount: Coin[]
  gas: string
}

/**
 * RPC query function for CosmWasm smart contract state.
 *
 * All telescope-generated packages export this under the same path:
 * `rpc.cosmwasm.wasm.v1.smartContractState`
 */
export type SmartContractStateFn = (params: {
  address: string
  queryData: Uint8Array
}) => Promise<{ data: Uint8Array }>

/**
 * Generic sign-and-broadcast function.
 *
 * Accepts encoded protobuf messages and broadcasts the transaction.
 * Each telescope SDK provides this via its signing client.
 */
export type SignAndBroadcastFn<TResult = unknown> = (
  sender: string,
  messages: readonly { typeUrl: string; value: Uint8Array }[],
  fee: InterchainStdFee | 'auto',
  memo?: string,
) => Promise<TResult>

/**
 * Encodes contract execution parameters to MsgExecuteContract protobuf bytes.
 *
 * Since `MsgExecuteContract` lives in each chain's telescope package
 * (not in a shared package), the user provides this encoder callback:
 *
 * ```ts
 * // xplajs
 * import { MsgExecuteContract } from '@xpla/xplajs/cosmwasm/wasm/v1/tx'
 * const encode = (p) => MsgExecuteContract.encode(MsgExecuteContract.fromPartial(p)).finish()
 *
 * // osmojs
 * import { MsgExecuteContract } from 'osmojs/cosmwasm/wasm/v1/tx'
 * const encode = (p) => MsgExecuteContract.encode(MsgExecuteContract.fromPartial(p)).finish()
 * ```
 */
export type EncodeMsgExecuteContractFn = (params: {
  sender: string
  contract: string
  msg: Uint8Array
  funds: readonly Coin[]
}) => Uint8Array

/**
 * Creates a query-only adapter from a telescope RPC function.
 *
 * Works with any telescope-generated CosmWasm client:
 * - `@xpla/xplajs` → `rpc.cosmwasm.wasm.v1.smartContractState`
 * - `osmojs` → `rpc.cosmwasm.wasm.v1.smartContractState`
 * - Any future telescope package with CosmWasm support
 *
 * @example
 * ```ts
 * import { createQueryAdapter } from 'schemos/telescope'
 * import { createTypedContract } from 'schemos'
 * import { cw20 } from 'schemos/schemas'
 *
 * const adapter = createQueryAdapter(rpc.cosmwasm.wasm.v1.smartContractState)
 * const token = createTypedContract(adapter, 'osmo1...', { query: cw20.query })
 * const { balance } = await token.query('balance', { address: '...' })
 * ```
 */
export function createQueryAdapter(
  smartContractState: SmartContractStateFn,
): CosmWasmQueryClient {
  return {
    async queryContractSmart(address: string, query: Record<string, unknown>) {
      const queryData = Json.toBytes(query)
      const res = await smartContractState({ address, queryData })
      return Json.fromBytes(res.data)
    },
  }
}

/**
 * Creates a full execute+query adapter from telescope RPC functions.
 *
 * Requires three callbacks that come from the user's chain SDK:
 * 1. `smartContractState` — query RPC (same across all telescope SDKs)
 * 2. `signAndBroadcast` — signing client's broadcast method
 * 3. `encodeMsgExecuteContract` — protobuf encoder for MsgExecuteContract
 *
 * @example
 * ```ts
 * import { createExecuteAdapter } from 'schemos/telescope'
 * import { createTypedContract } from 'schemos'
 * import { cw20 } from 'schemos/schemas'
 * import { MsgExecuteContract } from '@xpla/xplajs/cosmwasm/wasm/v1/tx'
 *
 * const adapter = createExecuteAdapter(
 *   rpc.cosmwasm.wasm.v1.smartContractState,
 *   (sender, messages, fee, memo) => signingClient.signAndBroadcast(sender, messages, fee, memo),
 *   (p) => MsgExecuteContract.encode(MsgExecuteContract.fromPartial(p)).finish(),
 * )
 *
 * const token = createTypedContract(adapter, 'xpla1...', cw20)
 * await token.execute(sender, 'transfer', { recipient: '...', amount: '1000' }, 'auto')
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
      fee: InterchainStdFee | 'auto',
      memo?: string,
      funds?: readonly Coin[],
    ) {
      const msgBytes = Json.toBytes(msg)
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
