/**
 * CW20 ExecuteMsg schema — standard fungible token.
 * Based on cosmwasm-plus/cw20-base `cargo schema` output.
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
      required: ['increase_allowance'],
      properties: {
        increase_allowance: {
          type: 'object',
          required: ['amount', 'spender'],
          properties: {
            amount: { $ref: '#/definitions/Uint128' },
            spender: { type: 'string' },
            expires: {
              anyOf: [{ $ref: '#/definitions/Expiration' }, { type: 'null' }],
            },
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
    {
      type: 'object',
      required: ['decrease_allowance'],
      properties: {
        decrease_allowance: {
          type: 'object',
          required: ['amount', 'spender'],
          properties: {
            amount: { $ref: '#/definitions/Uint128' },
            spender: { type: 'string' },
            expires: {
              anyOf: [{ $ref: '#/definitions/Expiration' }, { type: 'null' }],
            },
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
    {
      type: 'object',
      required: ['transfer_from'],
      properties: {
        transfer_from: {
          type: 'object',
          required: ['amount', 'owner', 'recipient'],
          properties: {
            amount: { $ref: '#/definitions/Uint128' },
            owner: { type: 'string' },
            recipient: { type: 'string' },
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
    {
      type: 'object',
      required: ['send_from'],
      properties: {
        send_from: {
          type: 'object',
          required: ['amount', 'contract', 'msg', 'owner'],
          properties: {
            amount: { $ref: '#/definitions/Uint128' },
            contract: { type: 'string' },
            msg: { $ref: '#/definitions/Binary' },
            owner: { type: 'string' },
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
    {
      type: 'object',
      required: ['burn_from'],
      properties: {
        burn_from: {
          type: 'object',
          required: ['amount', 'owner'],
          properties: {
            amount: { $ref: '#/definitions/Uint128' },
            owner: { type: 'string' },
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
    {
      type: 'object',
      required: ['update_minter'],
      properties: {
        update_minter: {
          type: 'object',
          properties: {
            new_minter: { type: ['string', 'null'] },
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
  ],
  definitions: {
    Binary: {
      description:
        'Binary is a wrapper around Vec<u8> to add base64 de/serialization with serde.',
      type: 'string',
    },
    Expiration: {
      description:
        'Expiration represents a point in time when some event happens.',
      oneOf: [
        {
          type: 'object',
          required: ['at_height'],
          properties: {
            at_height: { type: 'integer', format: 'uint64', minimum: 0 },
          },
          additionalProperties: false,
        },
        {
          type: 'object',
          required: ['at_time'],
          properties: {
            at_time: { $ref: '#/definitions/Timestamp' },
          },
          additionalProperties: false,
        },
        {
          type: 'object',
          required: ['never'],
          properties: {
            never: { type: 'object', additionalProperties: false },
          },
          additionalProperties: false,
        },
      ],
    },
    Timestamp: {
      description: 'A point in time in nanosecond precision.',
      allOf: [{ $ref: '#/definitions/Uint64' }],
    },
    Uint64: {
      description:
        'A thin wrapper around u64 that is using strings for JSON encoding/decoding.',
      type: 'string',
    },
    Uint128: {
      description:
        'A thin wrapper around u128 that is using strings for JSON encoding/decoding.',
      type: 'string',
    },
  },
} as const
