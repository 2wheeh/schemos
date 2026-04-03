import { Ajv, type ValidateFunction } from 'ajv'
import type { FromSchema, JSONSchema } from 'json-schema-to-ts'

// ---------------------------------------------------------------------------
// Level 1: Pure type utilities — zero runtime cost
// ---------------------------------------------------------------------------

/** Infer the TypeScript message type from a JSON Schema definition. */
export type InferMsg<TSchema extends JSONSchema> = FromSchema<TSchema>

/** Extract all top-level message names from a union of single-key objects. */
export type MessageNames<T> =
  T extends Record<string, unknown> ? keyof T & string : never

/** Extract the args type for a specific message name from a union. */
export type MessageArgs<T, K extends string> =
  T extends Record<K, infer V> ? V : never

/** Infer a specific response type from a responses schema map. */
export type InferResponse<
  TResponses extends Record<string, JSONSchema>,
  K extends keyof TResponses & string,
> = FromSchema<TResponses[K]>

// ---------------------------------------------------------------------------
// Level 2: buildMsg — validated envelope builder
// ---------------------------------------------------------------------------

/** Module-level Ajv validator cache. WeakMap allows GC of out-of-scope schemas. */
const validatorCache = new WeakMap<
  object,
  { validate: ValidateFunction; ajv: Ajv }
>()

function getValidator(schema: JSONSchema): {
  validate: ValidateFunction
  ajv: Ajv
} {
  const key = schema as object
  let cached = validatorCache.get(key)
  if (!cached) {
    const ajv = new Ajv({ validateFormats: false })
    const validate = ajv.compile(schema as Record<string, unknown>)
    cached = { validate, ajv }
    validatorCache.set(key, cached)
  }
  return cached
}

/** Typed callable interface returned by createMsgBuilder. */
export type MsgBuilder<TMsg> = <K extends MessageNames<TMsg>>(
  msg: K,
  args: MessageArgs<TMsg, K>,
  options?: { context?: string },
) => { [P in K]: MessageArgs<TMsg, K> }

/**
 * Create a typed message builder from a JSON Schema.
 *
 * Returns a callable that builds validated `{ [msgName]: args }` envelopes.
 * The schema is compiled once and cached — safe for batch usage.
 *
 * This follows the same pattern as `createTypedContract`: the schema type
 * is resolved once at factory level, avoiding expensive repeated evaluation
 * of `FromSchema` on complex schemas (12+ oneOf branches with $ref).
 *
 * @example
 * ```ts
 * import { createMsgBuilder } from 'schemos/msg'
 * import { cw20 } from 'schemos/schemas'
 *
 * const cw20Msg = createMsgBuilder(cw20.execute)
 * const msg = cw20Msg('transfer', { amount: '1000', recipient: 'osmo1...' })
 * // msg is typed as { transfer: { amount: string; recipient: string } }
 *
 * // Batch usage — schema compiled once, reused across calls:
 * const msgs = [
 *   cw20Msg('transfer', { amount: '100', recipient: addr1 }),
 *   cw20Msg('transfer', { amount: '200', recipient: addr2 }),
 * ]
 * ```
 */
export function createMsgBuilder<const TSchema extends JSONSchema>(
  schema: TSchema,
): MsgBuilder<FromSchema<TSchema>> {
  return ((msg: string, args: unknown, options?: { context?: string }) => {
    return buildMsg(schema, msg, args, options)
  }) as MsgBuilder<FromSchema<TSchema>>
}

/**
 * Build a validated message envelope. Used internally by createMsgBuilder
 * and createTypedContract. Accepts loose types — prefer createMsgBuilder
 * for type-safe usage.
 */
export function buildMsg(
  schema: JSONSchema,
  msg: string,
  args: unknown,
  options?: { context?: string },
): Record<string, unknown> {
  const envelope = { [msg]: args }

  const { validate, ajv } = getValidator(schema)
  if (!validate(envelope)) {
    const prefix = options?.context
      ? `${options.context} validation`
      : 'Validation'
    throw new Error(
      `${prefix} failed for "${msg}": ${ajv.errorsText(validate.errors)}`,
    )
  }

  return envelope
}
