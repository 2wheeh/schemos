import { Ajv } from 'ajv'
import type { FromSchema, JSONSchema } from 'json-schema-to-ts'
import type { CosmWasmExecuteClient, CosmWasmQueryClient } from './client.js'
import type { Coin, StdFee } from './types.js'

// ---------------------------------------------------------------------------
// Type-level utilities for extracting message names and args from oneOf union
// ---------------------------------------------------------------------------

/** Extract all top-level keys from a union of single-key objects. */
type MessageNames<T> =
  T extends Record<string, unknown> ? keyof T & string : never

/** Extract the value type for a specific key from a union. */
type MessageArgs<T, K extends string> = T extends Record<K, infer V> ? V : never

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
  const ajv = new Ajv({ validateFormats: false })

  const validateQuery = ajv.compile(schemas.query as Record<string, unknown>)
  const validateExecute = schemas.execute
    ? ajv.compile(schemas.execute as Record<string, unknown>)
    : undefined

  const contract: Record<string, unknown> = {
    async query(msg: string, args: unknown) {
      const envelope = { [msg]: args }
      if (!validateQuery(envelope)) {
        throw new Error(
          `Query validation failed for "${msg}": ${ajv.errorsText(validateQuery.errors)}`,
        )
      }
      return client.queryContractSmart(contractAddress, envelope)
    },
  }

  if (schemas.execute && validateExecute) {
    const execClient = client as CosmWasmExecuteClient
    contract.execute = async (
      sender: string,
      msg: string,
      args: unknown,
      fee: StdFee | 'auto',
      memo?: string,
      funds?: readonly Coin[],
    ) => {
      const envelope = { [msg]: args }
      if (!validateExecute(envelope)) {
        throw new Error(
          `Execute validation failed for "${msg}": ${ajv.errorsText(validateExecute.errors)}`,
        )
      }
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
