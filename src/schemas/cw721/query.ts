/**
 * CW721 QueryMsg schema — standard non-fungible token.
 * Based on cosmwasm-plus/cw721-base `cargo schema` output.
 */
export const cw721QuerySchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'QueryMsg',
  oneOf: [
    {
      type: 'object',
      required: ['owner_of'],
      properties: {
        owner_of: {
          type: 'object',
          required: ['token_id'],
          properties: {
            token_id: { type: 'string' },
            include_expired: { type: ['boolean', 'null'] },
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
    {
      type: 'object',
      required: ['approval'],
      properties: {
        approval: {
          type: 'object',
          required: ['spender', 'token_id'],
          properties: {
            spender: { type: 'string' },
            token_id: { type: 'string' },
            include_expired: { type: ['boolean', 'null'] },
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
    {
      type: 'object',
      required: ['approvals'],
      properties: {
        approvals: {
          type: 'object',
          required: ['token_id'],
          properties: {
            token_id: { type: 'string' },
            include_expired: { type: ['boolean', 'null'] },
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
    {
      type: 'object',
      required: ['all_operators'],
      properties: {
        all_operators: {
          type: 'object',
          required: ['owner'],
          properties: {
            owner: { type: 'string' },
            include_expired: { type: ['boolean', 'null'] },
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
      required: ['num_tokens'],
      properties: {
        num_tokens: {
          type: 'object',
          properties: {},
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
    {
      type: 'object',
      required: ['contract_info'],
      properties: {
        contract_info: {
          type: 'object',
          properties: {},
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
    {
      type: 'object',
      required: ['nft_info'],
      properties: {
        nft_info: {
          type: 'object',
          required: ['token_id'],
          properties: {
            token_id: { type: 'string' },
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
    {
      type: 'object',
      required: ['all_nft_info'],
      properties: {
        all_nft_info: {
          type: 'object',
          required: ['token_id'],
          properties: {
            token_id: { type: 'string' },
            include_expired: { type: ['boolean', 'null'] },
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
    {
      type: 'object',
      required: ['tokens'],
      properties: {
        tokens: {
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
      required: ['all_tokens'],
      properties: {
        all_tokens: {
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
  ],
} as const
