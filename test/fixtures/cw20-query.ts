/**
 * Real cw20 QueryMsg schema as produced by `cargo schema`.
 * Uses oneOf envelope pattern.
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
  ],
} as const
