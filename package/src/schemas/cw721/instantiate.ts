/**
 * CW721 InstantiateMsg schema.
 * Generated from cw-nfts cw721-base cargo schema output.
 */
export const cw721InstantiateSchema = {
  oneOf: [
    {
      type: 'object',
      required: ['name', 'symbol'],
      properties: {
        collection_info_extension: {
          anyOf: [
            {
              $ref: '#/definitions/CollectionExtensionMsg_for_RoyaltyInfoResponse',
            },
            {
              type: 'null',
            },
          ],
        },
        creator: {
          description:
            'The account that can update the collection info. If not set, the minter is the creator.',
          type: ['string', 'null'],
        },
        minter: {
          description:
            'The minter is the only one who can create new NFTs. This is designed for a base NFT that is controlled by an external program or contract. You will likely replace this with custom logic in custom NFT contracts.',
          type: ['string', 'null'],
        },
        name: {
          type: 'string',
        },
        symbol: {
          type: 'string',
        },
        withdraw_address: {
          type: ['string', 'null'],
        },
      },
      additionalProperties: false,
    },
  ],
  definitions: {
    CollectionExtensionMsg_for_RoyaltyInfoResponse: {
      type: 'object',
      properties: {
        description: {
          type: ['string', 'null'],
        },
        explicit_content: {
          type: ['boolean', 'null'],
        },
        external_link: {
          type: ['string', 'null'],
        },
        image: {
          type: ['string', 'null'],
        },
        royalty_info: {
          anyOf: [
            {
              $ref: '#/definitions/RoyaltyInfoResponse',
            },
            {
              type: 'null',
            },
          ],
        },
        start_trading_time: {
          anyOf: [
            {
              $ref: '#/definitions/Timestamp',
            },
            {
              type: 'null',
            },
          ],
        },
      },
      additionalProperties: false,
    },
    Decimal: {
      description:
        'A fixed-point decimal value with 18 fractional digits, i.e. Decimal(1_000_000_000_000_000_000) == 1.0\n\nThe greatest possible value that can be represented is 340282366920938463463.374607431768211455 (which is (2^128 - 1) / 10^18)',
      type: 'string',
    },
    RoyaltyInfoResponse: {
      type: 'object',
      required: ['payment_address', 'share'],
      properties: {
        payment_address: {
          type: 'string',
        },
        share: {
          $ref: '#/definitions/Decimal',
        },
      },
      additionalProperties: false,
    },
    Timestamp: {
      description:
        'A point in time in nanosecond precision.\n\nThis type can represent times from 1970-01-01T00:00:00Z to 2554-07-21T23:34:33Z.',
      allOf: [
        {
          $ref: '#/definitions/Uint64',
        },
      ],
    },
    Uint64: {
      description:
        'A thin wrapper around u64 that is using strings for JSON encoding/decoding, such that the full u64 range can be used for clients that convert JSON numbers to floats, like JavaScript and jq.',
      type: 'string',
    },
  },
} as const
