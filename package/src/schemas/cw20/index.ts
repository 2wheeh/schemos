import { cw20ExecuteSchema } from './execute.js'
import { cw20InstantiateSchema } from './instantiate.js'
import { cw20QuerySchema } from './query.js'
import { cw20ResponseSchemas } from './responses.js'

export const cw20 = {
  execute: cw20ExecuteSchema,
  instantiate: cw20InstantiateSchema,
  query: cw20QuerySchema,
  responses: cw20ResponseSchemas,
} as const

export {
  cw20ExecuteSchema,
  cw20InstantiateSchema,
  cw20QuerySchema,
  cw20ResponseSchemas,
}
