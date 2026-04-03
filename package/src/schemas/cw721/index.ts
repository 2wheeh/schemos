import { cw721ExecuteSchema } from './execute.js'
import { cw721InstantiateSchema } from './instantiate.js'
import { cw721QuerySchema } from './query.js'
import { cw721ResponseSchemas } from './responses.js'

export const cw721 = {
  execute: cw721ExecuteSchema,
  instantiate: cw721InstantiateSchema,
  query: cw721QuerySchema,
  responses: cw721ResponseSchemas,
} as const

export {
  cw721ExecuteSchema,
  cw721InstantiateSchema,
  cw721QuerySchema,
  cw721ResponseSchemas,
}
