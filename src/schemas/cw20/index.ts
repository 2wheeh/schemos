import { cw20ExecuteSchema } from './execute.js'
import { cw20QuerySchema } from './query.js'

export const cw20 = {
  execute: cw20ExecuteSchema,
  query: cw20QuerySchema,
} as const

export { cw20ExecuteSchema, cw20QuerySchema }
