import { cw721ExecuteSchema } from './execute.js'
import { cw721QuerySchema } from './query.js'

export const cw721 = {
  execute: cw721ExecuteSchema,
  query: cw721QuerySchema,
} as const

export { cw721ExecuteSchema, cw721QuerySchema }
