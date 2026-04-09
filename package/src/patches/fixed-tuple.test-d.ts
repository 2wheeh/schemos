import type { FromSchema } from 'json-schema-to-ts'
import { expectTypeOf, test } from 'vitest'

// ---------------------------------------------------------------------------
// Fixed-length array patch: minItems === maxItems should produce a tuple type
// Mirrors ThomasAribart/json-schema-to-ts#231
// ---------------------------------------------------------------------------

// -- AssetInfo (native or cw20 token) ---------------------------------------
const assetInfoSchema = {
  oneOf: [
    {
      type: 'object',
      required: ['native'],
      properties: { native: { type: 'string' } },
      additionalProperties: false,
    },
    {
      type: 'object',
      required: ['cw20'],
      properties: { cw20: { type: 'string' } },
      additionalProperties: false,
    },
  ],
} as const

type AssetInfo = FromSchema<typeof assetInfoSchema>

// -- DEX Pair: exactly 2 AssetInfo ------------------------------------------
const pairSchema = {
  type: 'object',
  required: ['asset_infos', 'contract_addr'],
  properties: {
    asset_infos: {
      type: 'array',
      items: assetInfoSchema,
      minItems: 2,
      maxItems: 2,
    },
    contract_addr: { type: 'string' },
  },
  additionalProperties: false,
} as const

type Pair = FromSchema<typeof pairSchema>

test('Pair.asset_infos is a fixed-length tuple [AssetInfo, AssetInfo]', () => {
  expectTypeOf<Pair['asset_infos']>().toEqualTypeOf<[AssetInfo, AssetInfo]>()
})

// -- Empty fixed-length array (minItems === maxItems === 0) -----------------
const emptyArraySchema = {
  type: 'object',
  required: ['items'],
  properties: {
    items: {
      type: 'array',
      items: { type: 'string' },
      minItems: 0,
      maxItems: 0,
    },
  },
  additionalProperties: false,
} as const

type EmptyArray = FromSchema<typeof emptyArraySchema>

test('empty fixed-length array is []', () => {
  expectTypeOf<EmptyArray['items']>().toEqualTypeOf<[]>()
})

// -- Range array (minItems !== maxItems) should still be T[] ----------------
const rangeArraySchema = {
  type: 'object',
  required: ['items'],
  properties: {
    items: {
      type: 'array',
      items: { type: 'number' },
      minItems: 1,
      maxItems: 3,
    },
  },
  additionalProperties: false,
} as const

type RangeArray = FromSchema<typeof rangeArraySchema>

// TODO: Update this once json-schema-to-ts supports range arrays as tuples (minItems !== maxItems)
test('range array (min !== max) stays as T[]', () => {
  expectTypeOf<RangeArray['items']>().toEqualTypeOf<number[]>()
})
