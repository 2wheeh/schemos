import type { FromSchema, JSONSchema } from 'json-schema-to-ts'
import type { CosmWasmExecuteClient, CosmWasmQueryClient } from './client.js'
import { buildMsg, type MessageArgs, type MessageNames } from './msg.js'
import type { Coin, StdFee } from './types.js'

// ---------------------------------------------------------------------------
// Contract return types
// ---------------------------------------------------------------------------

export interface TypedQueryContract<
  TQueryMsg,
  TResponses extends Record<string, JSONSchema> | undefined = undefined,
> {
  query<K extends MessageNames<TQueryMsg>>(
    msg: K,
    args: MessageArgs<TQueryMsg, K>,
  ): Promise<
    TResponses extends Record<string, JSONSchema>
      ? K extends keyof TResponses
        ? FromSchema<TResponses[K]>
        : unknown
      : unknown
  >
}

export interface TypedContract<
  TExecuteMsg,
  TQueryMsg,
  TExecuteResult = unknown,
  TResponses extends Record<string, JSONSchema> | undefined = undefined,
> extends TypedQueryContract<TQueryMsg, TResponses> {
  execute<K extends MessageNames<TExecuteMsg>>(
    sender: string,
    msg: K,
    args: MessageArgs<TExecuteMsg, K>,
    fee: StdFee | 'auto',
    memo?: string,
    funds?: readonly Coin[],
  ): Promise<TExecuteResult>
}

// ---------------------------------------------------------------------------
// createTypedContract overloads
// ---------------------------------------------------------------------------

/** Full contract with execute + query. */
export function createTypedContract<
  const TExecuteSchema extends JSONSchema,
  const TQuerySchema extends JSONSchema,
  const TResponses extends Record<string, JSONSchema> | undefined = undefined,
  TExecuteResult = unknown,
>(
  client: CosmWasmExecuteClient<TExecuteResult>,
  contractAddress: string,
  schemas: {
    execute: TExecuteSchema
    query: TQuerySchema
    responses?: TResponses
  },
): TypedContract<
  FromSchema<TExecuteSchema>,
  FromSchema<TQuerySchema>,
  TExecuteResult,
  TResponses
>

/** Query-only contract (no execute capability). */
export function createTypedContract<
  const TQuerySchema extends JSONSchema,
  const TResponses extends Record<string, JSONSchema> | undefined = undefined,
>(
  client: CosmWasmQueryClient,
  contractAddress: string,
  schemas: {
    execute?: never
    query: TQuerySchema
    responses?: TResponses
  },
): TypedQueryContract<FromSchema<TQuerySchema>, TResponses>

/** Implementation. */
export function createTypedContract(
  client: CosmWasmQueryClient,
  contractAddress: string,
  schemas: {
    execute?: JSONSchema
    query: JSONSchema
    responses?: Record<string, JSONSchema>
  },
): any {
  const contract: Record<string, unknown> = {
    async query(msg: string, args: unknown) {
      const envelope = buildMsg(schemas.query, msg, args, {
        context: 'Query',
      })
      return client.queryContractSmart(contractAddress, envelope)
    },
  }

  if (schemas.execute) {
    const execClient = client as CosmWasmExecuteClient
    const executeSchema = schemas.execute
    contract.execute = async (
      sender: string,
      msg: string,
      args: unknown,
      fee: StdFee | 'auto',
      memo?: string,
      funds?: readonly Coin[],
    ) => {
      const envelope = buildMsg(executeSchema, msg, args, {
        context: 'Execute',
      })
      return execClient.execute(
        sender,
        contractAddress,
        envelope,
        fee,
        memo,
        funds,
      )
    }
  }

  return contract
}
