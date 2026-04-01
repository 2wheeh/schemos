/**
 * Real cw20 ExecuteMsg schema as produced by `cargo schema`.
 * Uses oneOf envelope pattern + $ref/definitions.
 */
export const cw20ExecuteSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'ExecuteMsg',
  oneOf: [
    {
      type: 'object',
      required: ['transfer'],
      properties: {
        transfer: {
          type: 'object',
          required: ['amount', 'recipient'],
          properties: {
            amount: { $ref: '#/definitions/Uint128' },
            recipient: { type: 'string' },
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
    {
      type: 'object',
      required: ['burn'],
      properties: {
        burn: {
          type: 'object',
          required: ['amount'],
          properties: {
            amount: { $ref: '#/definitions/Uint128' },
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
    {
      type: 'object',
      required: ['send'],
      properties: {
        send: {
          type: 'object',
          required: ['amount', 'contract', 'msg'],
          properties: {
            amount: { $ref: '#/definitions/Uint128' },
            contract: { type: 'string' },
            msg: { $ref: '#/definitions/Binary' },
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
    {
      type: 'object',
      required: ['mint'],
      properties: {
        mint: {
          type: 'object',
          required: ['amount', 'recipient'],
          properties: {
            amount: { $ref: '#/definitions/Uint128' },
            recipient: { type: 'string' },
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
  ],
  definitions: {
    Uint128: {
      type: 'string',
    },
    Binary: {
      description: 'Base64 encoded binary',
      type: 'string',
    },
  },
} as const
