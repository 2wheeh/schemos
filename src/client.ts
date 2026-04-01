import type { Coin, StdFee } from './types.js'

export interface CosmWasmQueryClient {
  queryContractSmart(
    address: string,
    query: Record<string, unknown>,
  ): Promise<unknown>
}

export interface CosmWasmExecuteClient<TExecuteResult = unknown>
  extends CosmWasmQueryClient {
  execute(
    sender: string,
    address: string,
    msg: Record<string, unknown>,
    fee: StdFee | 'auto',
    memo?: string,
    funds?: readonly Coin[],
  ): Promise<TExecuteResult>
}
