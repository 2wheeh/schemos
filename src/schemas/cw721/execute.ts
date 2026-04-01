/**
 * CW721 ExecuteMsg schema — standard non-fungible token.
 * Based on cosmwasm-plus/cw721-base `cargo schema` output.
 */
export const cw721ExecuteSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'ExecuteMsg',
  oneOf: [
    {
      type: 'object',
      required: ['transfer_nft'],
      properties: {
        transfer_nft: {
          type: 'object',
          required: ['recipient', 'token_id'],
          properties: {
            recipient: { type: 'string' },
            token_id: { type: 'string' },
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
    {
      type: 'object',
      required: ['send_nft'],
      properties: {
        send_nft: {
          type: 'object',
          required: ['contract', 'msg', 'token_id'],
          properties: {
            contract: { type: 'string' },
            msg: { $ref: '#/definitions/Binary' },
            token_id: { type: 'string' },
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
    {
      type: 'object',
      required: ['approve'],
      properties: {
        approve: {
          type: 'object',
          required: ['spender', 'token_id'],
          properties: {
            spender: { type: 'string' },
            token_id: { type: 'string' },
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
      required: ['revoke'],
      properties: {
        revoke: {
          type: 'object',
          required: ['spender', 'token_id'],
          properties: {
            spender: { type: 'string' },
            token_id: { type: 'string' },
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
    {
      type: 'object',
      required: ['approve_all'],
      properties: {
        approve_all: {
          type: 'object',
          required: ['operator'],
          properties: {
            operator: { type: 'string' },
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
      required: ['revoke_all'],
      properties: {
        revoke_all: {
          type: 'object',
          required: ['operator'],
          properties: {
            operator: { type: 'string' },
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
          required: ['owner', 'token_id'],
          properties: {
            owner: { type: 'string' },
            token_id: { type: 'string' },
            token_uri: { type: ['string', 'null'] },
            extension: {},
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
          required: ['token_id'],
          properties: {
            token_id: { type: 'string' },
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
  },
} as const
