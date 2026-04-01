/**
 * CW20 query response schemas.
 * Maps each query name to its response JSON Schema.
 * Based on `cargo schema` output (response_to_*.json).
 *
 * Note: $ref/definitions are inlined here because response schemas
 * are evaluated eagerly by ResolveResponses. Keeping them flat
 * avoids excessive TypeScript type instantiation depth.
 */
export const cw20ResponseSchemas = {
  balance: {
    type: 'object',
    required: ['balance'],
    properties: {
      balance: { type: 'string' },
    },
    additionalProperties: false,
  },
  token_info: {
    type: 'object',
    required: ['name', 'symbol', 'decimals', 'total_supply'],
    properties: {
      name: { type: 'string' },
      symbol: { type: 'string' },
      decimals: { type: 'integer' },
      total_supply: { type: 'string' },
    },
    additionalProperties: false,
  },
  minter: {
    type: 'object',
    properties: {
      minter: { type: ['string', 'null'] },
      cap: { type: ['string', 'null'] },
    },
    additionalProperties: false,
  },
  allowance: {
    type: 'object',
    required: ['allowance', 'expires'],
    properties: {
      allowance: { type: 'string' },
      expires: { type: 'object' },
    },
    additionalProperties: false,
  },
  all_allowances: {
    type: 'object',
    required: ['allowances'],
    properties: {
      allowances: {
        type: 'array',
        items: { type: 'object' },
      },
    },
    additionalProperties: false,
  },
  all_accounts: {
    type: 'object',
    required: ['accounts'],
    properties: {
      accounts: {
        type: 'array',
        items: { type: 'string' },
      },
    },
    additionalProperties: false,
  },
  marketing_info: {
    type: 'object',
    properties: {
      project: { type: ['string', 'null'] },
      description: { type: ['string', 'null'] },
      marketing: { type: ['string', 'null'] },
    },
    additionalProperties: false,
  },
  download_logo: {
    type: 'object',
    required: ['mime_type', 'data'],
    properties: {
      mime_type: { type: 'string' },
      data: { type: 'string' },
    },
    additionalProperties: false,
  },
} as const
