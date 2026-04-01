/**
 * CW20 QueryMsg schema — standard fungible token.
 * Based on cosmwasm-plus/cw20-base `cargo schema` output.
 */
export const cw20QuerySchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'QueryMsg',
  oneOf: [
    {
      type: 'object',
      required: ['balance'],
      properties: {
        balance: {
          type: 'object',
          required: ['address'],
          properties: {
            address: { type: 'string' },
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
    {
      type: 'object',
      required: ['token_info'],
      properties: {
        token_info: {
          type: 'object',
          properties: {},
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
    {
      type: 'object',
      required: ['minter'],
      properties: {
        minter: {
          type: 'object',
          properties: {},
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
    {
      type: 'object',
      required: ['allowance'],
      properties: {
        allowance: {
          type: 'object',
          required: ['owner', 'spender'],
          properties: {
            owner: { type: 'string' },
            spender: { type: 'string' },
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
    {
      type: 'object',
      required: ['all_allowances'],
      properties: {
        all_allowances: {
          type: 'object',
          required: ['owner'],
          properties: {
            owner: { type: 'string' },
            limit: { type: ['integer', 'null'], format: 'uint32', minimum: 0 },
            start_after: { type: ['string', 'null'] },
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
    {
      type: 'object',
      required: ['all_accounts'],
      properties: {
        all_accounts: {
          type: 'object',
          properties: {
            limit: { type: ['integer', 'null'], format: 'uint32', minimum: 0 },
            start_after: { type: ['string', 'null'] },
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
    {
      type: 'object',
      required: ['marketing_info'],
      properties: {
        marketing_info: {
          type: 'object',
          properties: {},
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
    {
      type: 'object',
      required: ['download_logo'],
      properties: {
        download_logo: {
          type: 'object',
          properties: {},
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
  ],
} as const
